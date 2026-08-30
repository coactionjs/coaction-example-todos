import { observer } from '@coaction/react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useTodos } from '@/store';
import type { TodoFilter } from '@/store/todo';

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' }
];

/**
 * List footer: remaining count, filter switcher and the clear-completed
 * action. All three read shared state, so they stay consistent in every tab.
 */
export const TodoFooter = observer(() => {
  const store = useTodos();

  if (store.todos.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        <span className="font-medium text-foreground tabular-nums">
          {store.remaining}
        </span>{' '}
        {store.remaining === 1 ? 'item' : 'items'} left
      </p>

      <div className="flex items-center gap-1" role="group" aria-label="Filter todos">
        {FILTERS.map(({ value, label }) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            aria-pressed={store.filter === value}
            className={cn(
              'h-8 text-muted-foreground',
              store.filter === value && 'bg-accent font-medium text-accent-foreground'
            )}
            onClick={() => void useTodos.getState().setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <Separator className="sm:hidden" />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-muted-foreground"
        disabled={store.completedCount === 0}
        onClick={() => void useTodos.getState().clearCompleted()}
      >
        Clear completed
      </Button>
    </div>
  );
});
