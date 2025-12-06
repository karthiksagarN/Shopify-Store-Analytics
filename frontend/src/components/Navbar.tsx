import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Store, ChevronDown, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { tenants, selectedTenant, selectTenant } = useTenant();

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg hidden sm:inline-block">
            Shopify Analytics
          </span>
        </div>

        <div className="flex-1 flex justify-center px-4">
          {tenants.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 max-w-[200px] md:max-w-[300px]">
                  <Store className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {selectedTenant?.name || 'Select Store'}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[250px]">
                <DropdownMenuLabel>Your Stores</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tenants.map((tenant) => (
                  <DropdownMenuItem
                    key={tenant.id}
                    onClick={() => selectTenant(tenant)}
                    className="cursor-pointer"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span className="font-medium">{tenant.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {tenant.shopDomain}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user ? getInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
