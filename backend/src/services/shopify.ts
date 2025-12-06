import axios, { AxiosInstance } from 'axios';

interface ShopifyTenant {
  shopDomain: string;
  accessToken: string;
}

interface ShopifyCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  total_spent: string;
  orders_count: number;
  default_address?: {
    first_name: string;
    last_name: string;
  };
}

interface ShopifyProduct {
  id: number;
  title: string;
  product_type: string;
  variants: Array<{
    sku: string;
    price: string;
  }>;
  status: string;
}

interface ShopifyOrder {
  id: number;
  total_price: string;
  currency: string;
  created_at: string;
  financial_status: string;
  customer?: {
    id: number;
  };
  line_items: Array<{
    id: number;
    product_id: number | null;
    quantity: number;
    price: string;
  }>;
}

export function createShopifyClient(tenant: ShopifyTenant): AxiosInstance {
  return axios.create({
    baseURL: `https://${tenant.shopDomain}/admin/api/2024-01`,
    headers: {
      'X-Shopify-Access-Token': tenant.accessToken,
      'Content-Type': 'application/json',
    },
  });
}

export async function fetchShopifyCustomers(
  client: AxiosInstance,
  limit: number = 250
): Promise<ShopifyCustomer[]> {
  const response = await client.get('/customers.json', {
    params: { limit },
  });
  return response.data.customers;
}

export async function fetchShopifyProducts(
  client: AxiosInstance,
  limit: number = 250
): Promise<ShopifyProduct[]> {
  const response = await client.get('/products.json', {
    params: { limit },
  });
  return response.data.products;
}

export async function fetchShopifyOrders(
  client: AxiosInstance,
  limit: number = 250
): Promise<ShopifyOrder[]> {
  const response = await client.get('/orders.json', {
    params: {
      limit,
      status: 'any', // Include all order statuses
    },
  });
  return response.data.orders;
}

export type { ShopifyCustomer, ShopifyProduct, ShopifyOrder };
