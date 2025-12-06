import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartCard({
  title,
  description,
  children,
  className,
  action,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-card p-6 shadow-sm border border-border',
        className
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
