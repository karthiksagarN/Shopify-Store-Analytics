import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Store,
  Settings,
  X,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Stores',
    href: '/stores',
    icon: Store,
  },
];

const bottomNavItems = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-0 flex flex-col overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border md:hidden">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <nav className="flex flex-col gap-1 mb-4">
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </NavLink>
            ))}
          </nav>
          <div className="rounded-lg bg-secondary/50 p-4 mb-4">
            <p className="text-sm font-medium">Need help?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Check our documentation for guides and API reference.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => window.open('https://shopify.dev/docs/apps/build/cli-for-apps', '_blank')}
            >
              View Docs
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Developed By</p>
            <p className="text-sm font-semibold mb-3">Karthik Sagar Nallagula</p>
            <div className="flex gap-3">
              <a href="https://github.com/karthiksagarN" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com/in/karthik-sagar-nallagula" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://twitter.com/NKarthikSagar1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="mailto:karthik.nallagula@proton.me" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" />
              </a>
              <a href="https://karthiknallagula.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
