// Mock data for demonstration when backend is not connected

export const mockTenants = [
  {
    id: '1',
    name: 'Fashion Store',
    shopDomain: 'fashion-store.myshopify.com',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Electronics Hub',
    shopDomain: 'electronics-hub.myshopify.com',
    createdAt: '2024-02-20T14:30:00Z',
  },
];

export const mockSummary = {
  totalCustomers: 1247,
  totalOrders: 3892,
  totalRevenue: 284750.50,
  averageOrderValue: 73.17,
  repeatCustomerRate: 34.2,
};

export const mockOrdersByDate = [
  { date: '2024-11-01', orderCount: 45, totalRevenue: 3250.00 },
  { date: '2024-11-02', orderCount: 52, totalRevenue: 3890.50 },
  { date: '2024-11-03', orderCount: 38, totalRevenue: 2780.25 },
  { date: '2024-11-04', orderCount: 61, totalRevenue: 4520.75 },
  { date: '2024-11-05', orderCount: 55, totalRevenue: 4150.00 },
  { date: '2024-11-06', orderCount: 48, totalRevenue: 3420.50 },
  { date: '2024-11-07', orderCount: 72, totalRevenue: 5280.25 },
  { date: '2024-11-08', orderCount: 68, totalRevenue: 4980.00 },
  { date: '2024-11-09', orderCount: 83, totalRevenue: 6150.75 },
  { date: '2024-11-10', orderCount: 91, totalRevenue: 6820.50 },
  { date: '2024-11-11', orderCount: 76, totalRevenue: 5620.25 },
  { date: '2024-11-12', orderCount: 64, totalRevenue: 4780.00 },
  { date: '2024-11-13', orderCount: 58, totalRevenue: 4280.50 },
  { date: '2024-11-14', orderCount: 49, totalRevenue: 3650.75 },
];

export const mockTopCustomers = [
  {
    customerId: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    totalSpent: 4250.50,
    orderCount: 28,
  },
  {
    customerId: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    totalSpent: 3890.25,
    orderCount: 24,
  },
  {
    customerId: '3',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    totalSpent: 3420.00,
    orderCount: 19,
  },
  {
    customerId: '4',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    totalSpent: 2980.75,
    orderCount: 17,
  },
  {
    customerId: '5',
    name: 'Amanda Brown',
    email: 'amanda.brown@email.com',
    totalSpent: 2650.50,
    orderCount: 15,
  },
];

export const mockRevenueByProduct = [
  { name: 'T-Shirts', value: 45200, color: 'hsl(var(--chart-1))' },
  { name: 'Jeans', value: 38500, color: 'hsl(var(--chart-2))' },
  { name: 'Sneakers', value: 32100, color: 'hsl(var(--chart-3))' },
  { name: 'Accessories', value: 24800, color: 'hsl(var(--chart-4))' },
  { name: 'Jackets', value: 18650, color: 'hsl(var(--chart-5))' },
];
