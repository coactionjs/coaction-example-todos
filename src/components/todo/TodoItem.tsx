import { useEffect, useRef, useState } from 'react';
import { observer } from '@coaction/react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Todo } from '@/store/todo';
import { useTodos } from '@/store';

type TodoItemProps = {
  todo: Todo;
};

/**
 * A single row. Double-click (or press Enter on a focused row) to edit;
 * Enter/blur saves, Escape cancels, clearing the text removes the todo.
 *
 * Wrapped in observer() so only the rows whose fields actually changed
 * re-render — structural sharing from the shared worker patches keeps
 * unchanged todo objects referentially equal.
 */
export const TodoItem = observer(({ todo }: TodoItemProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editing]);

  // Keep the draft in sync when the row is not being edited.
  useEffect(() => {
    if (!editing) {
      setDraft(todo.text);
    }
  }, [todo.text, editing]);

  const startEditing = () => {
    setDraft(todo.text);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== todo.text) {
      void useTodos.getState().updateTodo(todo.id, draft);
    }
  };

  const cancel = () => {
    setDraft(todo.text);
    setEditing(false);
  };

  return (
    <li
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
        'hover:bg-muted/50',
        editing && 'bg-muted/50'
      )}
      onDoubleClick={startEditing}
    >
      {editing ? (
        <Input
          ref={editInputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commit();
            } else if (event.key === 'Escape') {
              cancel();
            }
          }}
          aria-label="Edit todo"
          className="h-8 flex-1"
        />
      ) : (
        <>
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => void useTodos.getState().toggleTodo(todo.id)}
            aria-label={`Mark "${todo.text}" as ${todo.completed ? 'active' : 'completed'}`}
          />
          <span
            className={cn(
              'flex-1 cursor-default truncate text-sm select-none',
              todo.completed && 'text-muted-foreground line-through'
            )}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                startEditing();
              }
            }}
            title={todo.text}
          >
            {todo.text}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete "${todo.text}"`}
            className="size-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() => void useTodos.getState().removeTodo(todo.id)}
          >
            <X className="size-4" />
          </Button>
        </>
      )}
    </li>
  );
});
