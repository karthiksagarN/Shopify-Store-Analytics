import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';
import { syncCustomers, syncProducts, syncOrders } from '../services/sync.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

const createTenantSchema = z.object({
  name: z.string().min(1),
  shopDomain: z.string().regex(/^[a-zA-Z0-9-]+\.myshopify\.com$/),
  accessToken: z.string().min(1),
});

// GET /api/tenants - List user's tenants
router.get('/', async (req, res, next) => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { createdByUserId: req.user!.id },
      select: {
        id: true,
        name: true,
        shopDomain: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tenants);
  } catch (error) {
    next(error);
  }
});

// POST /api/tenants - Create new tenant
router.post('/', async (req, res, next) => {
  try {
    let { name, shopDomain, accessToken } = req.body;

    // Sanitize shopDomain
    if (shopDomain) {
      shopDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      // If user just typed the name 'my-store', append .myshopify.com
      if (!shopDomain.includes('.')) {
        shopDomain += '.myshopify.com';
      }
    }

    const data = createTenantSchema.parse({ name, shopDomain, accessToken });
    shopDomain = data.shopDomain;
    accessToken = data.accessToken;
    name = data.name;

    // Check if domain already exists
    const existing = await prisma.tenant.findUnique({ where: { shopDomain } });
    if (existing) {
      throw new ApiError('Shop domain already connected', 400);
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        shopDomain,
        accessToken,
        createdByUserId: req.user!.id,
      },
      select: {
        id: true,
        name: true,
        shopDomain: true,
        createdAt: true,
      },
    });

    res.status(201).json(tenant);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tenants/:id - Delete a tenant
router.delete('/:id', async (req, res, next) => {
  try {
    const tenantId = req.params.id;
    await verifyTenantAccess(tenantId, req.user!.id);

    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    res.json({ message: 'Store removed successfully' });
  } catch (error) {
    next(error);
  }
});

// Helper to verify tenant ownership
async function verifyTenantAccess(tenantId: string, userId: string) {
  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, createdByUserId: userId },
  });
  if (!tenant) {
    throw new ApiError('Tenant not found or access denied', 404);
  }
  return tenant;
}

// POST /api/tenants/:tenantId/sync/customers
router.post('/:tenantId/sync/customers', async (req, res, next) => {
  try {
    const tenant = await verifyTenantAccess(req.params.tenantId, req.user!.id);
    const result = await syncCustomers(prisma, tenant);
    res.json({ message: 'Customers synced', count: result.count });
  } catch (error) {
    next(error);
  }
});

// POST /api/tenants/:tenantId/sync/products
router.post('/:tenantId/sync/products', async (req, res, next) => {
  try {
    const tenant = await verifyTenantAccess(req.params.tenantId, req.user!.id);
    const result = await syncProducts(prisma, tenant);
    res.json({ message: 'Products synced', count: result.count });
  } catch (error) {
    next(error);
  }
});

// POST /api/tenants/:tenantId/sync/orders
router.post('/:tenantId/sync/orders', async (req, res, next) => {
  try {
    const tenant = await verifyTenantAccess(req.params.tenantId, req.user!.id);
    const result = await syncOrders(prisma, tenant);
    res.json({ message: 'Orders synced', count: result.count });
  } catch (error) {
    next(error);
  }
});

export default router;
