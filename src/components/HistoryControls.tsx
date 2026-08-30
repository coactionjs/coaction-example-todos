import { useEffect } from 'react';
import { observer } from '@coaction/react';
import { Redo2, Undo2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTodos } from '@/store';

const isApplePlatform = () =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const modKey = () => (isApplePlatform() ? '⌘' : 'Ctrl+');

/**
 * Undo / redo controls driven by the reactive `canUndo` / `canRedo` flags the
 * authority maintains, plus the conventional shortcuts. Shortcuts step aside
 * while editing text so native input undo keeps working.
 */
export const HistoryControls = observer(() => {
  const store = useTodos();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.altKey ||
        event.key.toLowerCase() !== 'z'
      ) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      const action = event.shiftKey ? 'redo' : 'undo';
      void useTodos.getState()[action]();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Undo"
        title={`Undo (${modKey()}Z)`}
        disabled={!store.canUndo}
        className="size-8 text-muted-foreground"
        onClick={() => void useTodos.getState().undo()}
      >
        <Undo2 className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Redo"
        title={`Redo (${modKey()}Shift+Z)`}
        disabled={!store.canRedo}
        className="size-8 text-muted-foreground"
        onClick={() => void useTodos.getState().redo()}
      >
        <Redo2 className="size-4" />
      </Button>
    </div>
  );
});
