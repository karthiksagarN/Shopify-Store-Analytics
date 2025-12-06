import { useState } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi, tenantsApi } from '@/lib/api';
import { StatsCard } from '@/components/StatsCard';
import { ChartCard } from '@/components/ChartCard';
import { DateRangePicker } from '@/components/DateRangePicker';
import { EmptyState } from '@/components/EmptyState';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/Loader';
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Store,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subDays, format } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { selectedTenant, isLoading: tenantLoading } = useTenant();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Fetch Summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics-summary', selectedTenant?.id],
    queryFn: () => analyticsApi.getSummary(selectedTenant!.id),
    enabled: !!selectedTenant,
  });

  // Fetch Revenue by Category
  const { data: revenueByCategory, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics-revenue-category', selectedTenant?.id],
    queryFn: () => analyticsApi.getRevenueByCategory(selectedTenant!.id),
    enabled: !!selectedTenant,
  });

  // Fetch Orders by Date
  const { data: ordersByDate, isLoading: ordersLoading } = useQuery({
    queryKey: ['analytics-orders', selectedTenant?.id, dateRange],
    queryFn: () => analyticsApi.getOrdersByDate(
      selectedTenant!.id,
      dateRange.from.toISOString(),
      dateRange.to.toISOString()
    ),
    enabled: !!selectedTenant,
  });

  // Fetch Top Customers
  const { data: topCustomers, isLoading: customersLoading } = useQuery({
    queryKey: ['analytics-customers', selectedTenant?.id],
    queryFn: () => analyticsApi.getTopCustomers(selectedTenant!.id),
    enabled: !!selectedTenant,
  });

  const isLoading = summaryLoading || ordersLoading || customersLoading || revenueLoading;

  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTenant) return;
      await Promise.all([
        tenantsApi.syncCustomers(selectedTenant.id),
        tenantsApi.syncProducts(selectedTenant.id),
        tenantsApi.syncOrders(selectedTenant.id),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-customers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-revenue-category'] });
      toast({
        title: 'Sync complete',
        description: 'All data has been updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync data from Shopify.',
        variant: 'destructive',
      });
    }
  });

  const handleSync = () => {
    toast({
      title: 'Syncing data...',
      description: 'Fetching latest data from Shopify.',
    });
    syncMutation.mutate();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  if (tenantLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!selectedTenant) {
    return (
      <EmptyState
        icon={Store}
        title="No store selected"
        description="Select a store from the dropdown above or add a new Shopify store to get started."
        action={{
          label: 'Go to Stores',
          onClick: () => (window.location.href = '/stores'),
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Analytics overview for {selectedTenant.name}
          </p>
        </div>
        <Button
          onClick={handleSync}
          variant="outline"
          className="gap-2"
          disabled={syncMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          {syncMutation.isPending ? 'Syncing...' : 'Sync Data'}
        </Button>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Customers"
            value={summary?.totalCustomers?.toLocaleString() || '0'}
            icon={Users}
            iconClassName="bg-chart-1/10 text-chart-1"
          />
          <StatsCard
            title="Total Orders"
            value={summary?.totalOrders?.toLocaleString() || '0'}
            icon={ShoppingCart}
            iconClassName="bg-chart-2/10 text-chart-2"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(summary?.totalRevenue)}
            icon={DollarSign}
            iconClassName="bg-chart-3/10 text-chart-3"
          />
          <StatsCard
            title="Avg Order Value"
            value={formatCurrency(summary?.averageOrderValue)}
            icon={TrendingUp}
            iconClassName="bg-chart-4/10 text-chart-4"
          />
        </div>
      )}

      {/* Charts Row */}
      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Over Time */}
          <ChartCard
            title="Revenue Over Time"
            description={`${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ordersByDate || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(value) => `$${value / 1000}k`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Orders by Date */}
          <ChartCard
            title="Orders by Date"
            description="Daily order volume"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByDate || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                />
                <Bar
                  dataKey="orderCount"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                  name="Orders"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Bottom Row */}
      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <div className="col-span-1">
            <TableSkeleton />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue by Category (Donut Chart) */}
          <ChartCard title="Revenue by Category" description="Product breakdown" className="lg:col-span-1">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(revenueByCategory || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={[
                      'hsl(var(--chart-1))',
                      'hsl(var(--chart-2))',
                      'hsl(var(--chart-3))',
                      'hsl(var(--chart-4))',
                      'hsl(var(--chart-5))'
                    ][index % 5]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Customers Table */}
          <ChartCard title="Top Customers" description="By total spend" className="lg:col-span-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers?.map((customer: any, index: number) => (
                  <TableRow key={customer.customerId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {index + 1}
                        </div>
                        {customer.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.email}
                    </TableCell>
                    <TableCell className="text-right">{customer.orderCount}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
