import { PrismaClient, Tenant } from '@prisma/client';
import {
  createShopifyClient,
  fetchShopifyCustomers,
  fetchShopifyProducts,
  fetchShopifyOrders,
} from './shopify.js';

export async function syncCustomers(
  prisma: PrismaClient,
  tenant: Tenant
): Promise<{ count: number }> {
  const client = createShopifyClient(tenant);
  const shopifyCustomers = await fetchShopifyCustomers(client);

  let count = 0;

  for (const customer of shopifyCustomers) {
    await prisma.customer.upsert({
      where: {
        tenantId_shopifyCustomerId: {
          tenantId: tenant.id,
          shopifyCustomerId: String(customer.id),
        },
      },
      update: {
        firstName: customer.first_name || customer.default_address?.first_name || null,
        lastName: customer.last_name || customer.default_address?.last_name || null,
        email: customer.email,
        totalSpent: parseFloat(customer.total_spent) || 0,
        ordersCount: customer.orders_count,
      },
      create: {
        tenantId: tenant.id,
        shopifyCustomerId: String(customer.id),
        firstName: customer.first_name || customer.default_address?.first_name || null,
        lastName: customer.last_name || customer.default_address?.last_name || null,
        email: customer.email,
        totalSpent: parseFloat(customer.total_spent) || 0,
        ordersCount: customer.orders_count,
      },
    });
    count++;
  }

  return { count };
}

export async function syncProducts(
  prisma: PrismaClient,
  tenant: Tenant
): Promise<{ count: number }> {
  const client = createShopifyClient(tenant);
  const shopifyProducts = await fetchShopifyProducts(client);

  let count = 0;

  for (const product of shopifyProducts) {
    const variant = product.variants[0];

    await prisma.product.upsert({
      where: {
        tenantId_shopifyProductId: {
          tenantId: tenant.id,
          shopifyProductId: String(product.id),
        },
      },
      update: {
        title: product.title,
        productType: product.product_type,
        sku: variant?.sku || null,
        price: parseFloat(variant?.price) || 0,
        status: product.status,
      },
      create: {
        tenantId: tenant.id,
        shopifyProductId: String(product.id),
        title: product.title,
        productType: product.product_type,
        sku: variant?.sku || null,
        price: parseFloat(variant?.price) || 0,
        status: product.status,
      },
    });
    count++;
  }

  return { count };
}

export async function syncOrders(
  prisma: PrismaClient,
  tenant: Tenant
): Promise<{ count: number }> {
  const client = createShopifyClient(tenant);
  const shopifyOrders = await fetchShopifyOrders(client);

  let count = 0;

  for (const order of shopifyOrders) {
    // Find customer if exists
    let customerId: string | null = null;
    if (order.customer?.id) {
      const customer = await prisma.customer.findUnique({
        where: {
          tenantId_shopifyCustomerId: {
            tenantId: tenant.id,
            shopifyCustomerId: String(order.customer.id),
          },
        },
      });
      customerId = customer?.id || null;
    }

    const savedOrder = await prisma.order.upsert({
      where: {
        tenantId_shopifyOrderId: {
          tenantId: tenant.id,
          shopifyOrderId: String(order.id),
        },
      },
      update: {
        totalPrice: parseFloat(order.total_price) || 0,
        currency: order.currency,
        orderDate: new Date(order.created_at),
        status: order.financial_status,
        customerId,
      },
      create: {
        tenantId: tenant.id,
        shopifyOrderId: String(order.id),
        totalPrice: parseFloat(order.total_price) || 0,
        currency: order.currency,
        orderDate: new Date(order.created_at),
        status: order.financial_status,
        customerId,
      },
    });

    // Sync Line Items
    if (order.line_items && order.line_items.length > 0) {
      // First, remove existing items to avoid duplicates/stale data
      await prisma.orderItem.deleteMany({
        where: { orderId: savedOrder.id },
      });

      for (const item of order.line_items) {
        // Find product ID if exists
        let productId: string | null = null;
        if (item.product_id) {
          const product = await prisma.product.findUnique({
            where: {
              tenantId_shopifyProductId: {
                tenantId: tenant.id,
                shopifyProductId: String(item.product_id),
              },
            },
          });
          productId = product?.id || null;
        }

        await prisma.orderItem.create({
          data: {
            orderId: savedOrder.id,
            productId,
            quantity: item.quantity,
            price: parseFloat(item.price) || 0,
          },
        });
      }
    }

    count++;
  }

  return { count };
}

export async function syncAllTenants(prisma: PrismaClient): Promise<void> {
  const tenants = await prisma.tenant.findMany();

  for (const tenant of tenants) {
    try {
      console.log(`[SYNC] Syncing tenant: ${tenant.name}`);
      await syncCustomers(prisma, tenant);
      await syncProducts(prisma, tenant);
      await syncOrders(prisma, tenant);
      console.log(`[SYNC] Completed sync for: ${tenant.name}`);
    } catch (error) {
      console.error(`[SYNC] Failed to sync tenant ${tenant.name}:`, error);
    }
  }
}
