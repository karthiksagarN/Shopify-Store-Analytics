import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

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

// GET /api/analytics/:tenantId/summary
router.get('/:tenantId/summary', async (req, res, next) => {
  try {
    await verifyTenantAccess(req.params.tenantId, req.user!.id);
    const tenantId = req.params.tenantId;

    const [
      totalCustomers,
      totalOrders,
      revenueResult,
      repeatCustomers,
    ] = await Promise.all([
      prisma.customer.count({ where: { tenantId } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.order.aggregate({
        where: { tenantId },
        _sum: { totalPrice: true },
      }),
      prisma.customer.count({
        where: { tenantId, ordersCount: { gt: 1 } },
      }),
    ]);

    const totalRevenue = revenueResult._sum.totalPrice?.toNumber() || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const repeatCustomerRate = totalCustomers > 0
      ? (repeatCustomers / totalCustomers) * 100
      : 0;

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      repeatCustomerRate: Math.round(repeatCustomerRate * 10) / 10,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/:tenantId/orders-by-date
router.get('/:tenantId/orders-by-date', async (req, res, next) => {
  try {
    await verifyTenantAccess(req.params.tenantId, req.user!.id);
    const tenantId = req.params.tenantId;
    const { start, end } = req.query;

    if (!start || !end) {
      throw new ApiError('Start and end dates are required', 400);
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);
    endDate.setHours(23, 59, 59, 999);

    // Using raw query for date grouping
    const result = await prisma.$queryRaw<Array<{
      date: Date;
      orderCount: bigint;
      totalRevenue: Prisma.Decimal;
    }>>`
      SELECT 
        DATE(orderDate) as date,
        COUNT(*) as orderCount,
        SUM(totalPrice) as totalRevenue
      FROM \`Order\`
      WHERE tenantId = ${tenantId}
        AND orderDate >= ${startDate}
        AND orderDate <= ${endDate}
      GROUP BY DATE(orderDate)
      ORDER BY date ASC
    `;

    const formatted = result.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      orderCount: Number(row.orderCount),
      totalRevenue: Number(row.totalRevenue) || 0,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/:tenantId/top-customers
router.get('/:tenantId/top-customers', async (req, res, next) => {
  try {
    await verifyTenantAccess(req.params.tenantId, req.user!.id);
    const tenantId = req.params.tenantId;
    const limit = parseInt(req.query.limit as string) || 5;

    const customers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { totalSpent: 'desc' },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalSpent: true,
        ordersCount: true,
      },
    });

    const formatted = customers.map((c) => ({
      customerId: c.id,
      name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown',
      email: c.email || 'N/A',
      totalSpent: c.totalSpent.toNumber(),
      orderCount: c.ordersCount,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/:tenantId/revenue-by-category
router.get('/:tenantId/revenue-by-category', async (req, res, next) => {
  try {
    await verifyTenantAccess(req.params.tenantId, req.user!.id);
    const tenantId = req.params.tenantId;

    const result = await prisma.$queryRaw<Array<{
      category: string;
      totalRevenue: Prisma.Decimal;
    }>>`
      SELECT 
        COALESCE(p.productType, 'Uncategorized') as category,
        SUM(oi.price * oi.quantity) as totalRevenue
      FROM OrderItem oi
      JOIN \`Order\` o ON oi.orderId = o.id
      LEFT JOIN Product p ON oi.productId = p.id
      WHERE o.tenantId = ${tenantId}
      GROUP BY category
      ORDER BY totalRevenue DESC
    `;

    const formatted = result.map((row) => ({
      name: row.category || 'Uncategorized',
      value: Number(row.totalRevenue) || 0,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

export default router;
