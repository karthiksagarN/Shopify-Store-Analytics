import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card p-6 shadow-sm border border-border transition-all duration-300 hover:shadow-md hover:border-primary/20',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-sm text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            iconClassName || 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
    </div>
  );
}
