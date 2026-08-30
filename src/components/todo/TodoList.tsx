import { observer } from '@coaction/react';
import { ClipboardList } from 'lucide-react';

import { useTodos } from '@/store';
import { TodoItem } from './TodoItem';

const EMPTY_MESSAGES = {
  all: 'Nothing here yet — add your first todo above.',
  active: 'No active todos. Nice work!',
  completed: 'No completed todos yet.'
} as const;

/**
 * The visible list. Reads only `visibleTodos` — a cached computed value —
 * so switching filters re-renders the list while unrelated changes don't.
 */
export const TodoList = observer(() => {
  const store = useTodos();
  const todos = store.visibleTodos;

  if (todos.length === 0) {
    const message =
      store.todos.length === 0
        ? EMPTY_MESSAGES.all
        : EMPTY_MESSAGES[store.filter];
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
        <ClipboardList className="size-8 opacity-40" />
        <p>{message}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5 p-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
});
