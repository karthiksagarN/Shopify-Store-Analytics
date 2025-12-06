import { useState } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { tenantsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AddStoreModal } from '@/components/AddStoreModal';
import { EmptyState } from '@/components/EmptyState';
import { PageLoader } from '@/components/Loader';
import {
  Store,
  Plus,
  ExternalLink,
  MoreVertical,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export default function StoresPage() {
  const { tenants, selectedTenant, selectTenant, removeTenant, isLoading } = useTenant();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSync = async (tenant: any) => {
    toast({
      title: 'Syncing data...',
      description: `Fetching latest data for ${tenant.name}.`,
    });

    try {
      // Trigger all syncs in parallel
      await Promise.all([
        tenantsApi.syncCustomers(tenant.id),
        tenantsApi.syncProducts(tenant.id),
        tenantsApi.syncOrders(tenant.id),
      ]);

      toast({
        title: 'Sync Complete',
        description: `Successfully synced data for ${tenant.name}.`,
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync data from Shopify. Please check your credentials.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
          <p className="text-muted-foreground">
            Manage your connected Shopify stores
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Store
        </Button>
      </div>

      {/* Store Cards */}
      {tenants.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No stores connected"
          description="Connect your first Shopify store to start syncing data and viewing analytics."
          action={{
            label: 'Add Store',
            onClick: () => setModalOpen(true),
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Card
              key={tenant.id}
              className={`relative transition-all hover:shadow-md cursor-pointer ${selectedTenant?.id === tenant.id
                ? 'ring-2 ring-primary border-primary'
                : ''
                }`}
              onClick={() => selectTenant(tenant)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        {tenant.shopDomain}
                        <ExternalLink className="h-3 w-3" />
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSync(tenant.name);
                        }}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Data
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to remove this store?')) {
                            try {
                              await removeTenant(tenant.id);
                              toast({
                                title: 'Store removed',
                                description: 'The store has been successfully removed.',
                              });
                            } catch (error) {
                              toast({
                                title: 'Error',
                                description: 'Failed to remove store.',
                                variant: 'destructive',
                              });
                            }
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Store
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Connected {format(new Date(tenant.createdAt), 'MMM d, yyyy')}
                  </p>
                  {selectedTenant?.id === tenant.id && (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddStoreModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
