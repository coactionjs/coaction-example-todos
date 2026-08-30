import { useRef, useState } from 'react';
import { observer } from '@coaction/react';
import { ChevronDown, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTodos } from '@/store';

/**
 * The "new todo" bar. The chevron toggles every todo at once and reflects
 * the all-computed state from the store.
 */
export const AddTodo = observer(() => {
  const store = useTodos();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const hasTodos = store.todos.length > 0;

  const submit = () => {
    if (!text.trim()) {
      return;
    }
    void useTodos.getState().addTodo(text);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Toggle all todos"
        title="Toggle all todos"
        disabled={!hasTodos}
        className={cn('shrink-0 text-muted-foreground', store.allCompleted && 'text-primary')}
        onClick={() => void useTodos.getState().toggleAll()}
      >
        <ChevronDown className="size-5" />
      </Button>
      <Input
        ref={inputRef}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="What needs to be done?"
        aria-label="New todo"
        className="h-11 flex-1 text-base"
        autoFocus
      />
      <Button type="submit" variant="outline" className="shrink-0" disabled={!text.trim()}>
        <Plus className="size-4" />
        Add
      </Button>
    </form>
  );
});
