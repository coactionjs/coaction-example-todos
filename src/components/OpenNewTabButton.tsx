import { ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { isSharedWorkerMode } from '@/store';

/**
 * Opens a second window connected to the same SharedWorker authority —
 * the quickest way to see the mirrors stay in sync.
 */
export function OpenNewTabButton() {
  if (!isSharedWorkerMode) {
    return null;
  }
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 text-muted-foreground"
      onClick={() => window.open(window.location.href, '_blank')}
    >
      <ExternalLink className="size-3.5" />
      Open another tab
    </Button>
  );
}
