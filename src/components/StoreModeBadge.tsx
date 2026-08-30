import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isSharedWorkerMode } from '@/store';

/** Shows where the store authority lives. */
export function StoreModeBadge({ className }: { className?: string }) {
  return isSharedWorkerMode ? (
    <Badge variant="outline" className={cn('gap-1.5', className)}>
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
      SharedWorker
    </Badge>
  ) : (
    <Badge variant="outline" className={cn('gap-1.5', className)}>
      <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
      Local store
    </Badge>
  );
}
