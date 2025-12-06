import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockTenants } from '@/lib/mock-data';

interface Tenant {
  id: string;
  name: string;
  shopDomain: string;
  createdAt: string;
}

interface TenantContextType {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  selectTenant: (tenant: Tenant | null) => void;
  addTenant: (tenant: { name: string; shopDomain: string; accessToken: string }) => Promise<void>;
  removeTenant: (tenantId: string) => Promise<void>;
  isLoading: boolean;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Disable demo mode for production
const DEMO_MODE = false;

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTenants = async () => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTenants(mockTenants);
        if (!selectedTenant && mockTenants.length > 0) {
          setSelectedTenant(mockTenants[0]);
        }
      } else {
        const { tenantsApi } = await import('@/lib/api');
        const data = await tenantsApi.getAll();
        setTenants(data);
        if (!selectedTenant && data.length > 0) {
          setSelectedTenant(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTenants();
  }, []);

  const selectTenant = (tenant: Tenant | null) => {
    setSelectedTenant(tenant);
  };

  const addTenant = async (tenantData: any) => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newTenant: Tenant = {
          ...tenantData,
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
        };
        setTenants((prev) => [...prev, newTenant]);
        setSelectedTenant(newTenant);
      } else {
        const { tenantsApi } = await import('@/lib/api');
        const newTenant = await tenantsApi.create({
          name: tenantData.name,
          shopDomain: tenantData.shopDomain,
          accessToken: tenantData.accessToken,
        });
        setTenants((prev) => [...prev, newTenant]);
        setSelectedTenant(newTenant);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeTenant = async (tenantId: string) => {
    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTenants((prev) => prev.filter((t) => t.id !== tenantId));
        if (selectedTenant?.id === tenantId) {
          setSelectedTenant(null);
        }
      } else {
        const { tenantsApi } = await import('@/lib/api');
        await tenantsApi.delete(tenantId);
        setTenants((prev) => prev.filter((t) => t.id !== tenantId));
        if (selectedTenant?.id === tenantId) {
          setSelectedTenant(null);
        }
      }
    } catch (error) {
      console.error('Failed to remove tenant:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        selectedTenant,
        selectTenant,
        addTenant,
        removeTenant,
        isLoading,
        refreshTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
