import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  className?: string;
  text?: string;
}

export function Loader({ className, text }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader text="Loading..." />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-sm border border-border animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-3 w-40 bg-muted rounded" />
        </div>
        <div className="h-12 w-12 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-sm border border-border animate-pulse">
      <div className="space-y-3 mb-6">
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="h-3 w-48 bg-muted rounded" />
      </div>
      <div className="h-[300px] bg-muted/50 rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl bg-card p-6 shadow-sm border border-border animate-pulse">
      <div className="space-y-3 mb-6">
        <div className="h-5 w-40 bg-muted rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 flex-1 bg-muted rounded" />
            <div className="h-10 w-32 bg-muted rounded" />
            <div className="h-10 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
