import type { HistoryApi } from '@coaction/history';
import type { Slice, Store } from '@coaction/react';

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

export type TodoFilter = 'all' | 'active' | 'completed';

export type TodosState = {
  /** Authoritative todo list. Lives in the SharedWorker, mirrored to every tab. */
  todos: Todo[];
  /** Current view filter. Shared as well — switching tabs stays in sync. */
  filter: TodoFilter;
  /** Reactive history availability, maintained by the authority. */
  canUndo: boolean;
  canRedo: boolean;
  // Cached computed state — recomputed only when their dependencies change.
  remaining: number;
  completedCount: number;
  allCompleted: boolean;
  visibleTodos: Todo[];
  // Actions. Executed on the authority (SharedWorker) and awaited by clients.
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  updateTodo: (id: string, text: string) => void;
  removeTodo: (id: string) => void;
  toggleAll: () => void;
  clearCompleted: () => void;
  setFilter: (filter: TodoFilter) => void;
  /** Replay history on the authority; returns whether anything was undone. */
  undo: () => boolean;
  redo: () => boolean;
};

const createTodo = (text: string, completed = false): Todo => ({
  id: crypto.randomUUID(),
  text,
  completed,
  createdAt: Date.now()
});

/**
 * The single store definition shared by all runtimes. The slice factory's
 * third argument is the runtime store, letting `undo`/`redo` reach the
 * authority-side history api that @coaction/history attaches there.
 *
 * Computed values use accessor getters — coaction caches them on its signal
 * graph until the fields they read change, so no memo arrays are needed.
 */
export const todosSlice: Slice<TodosState> = (set, _get, store) => ({
  todos: [
    createTodo('Welcome to coaction todos', true),
    createTodo('Add, edit, complete and remove items'),
    createTodo('Open a second tab — state stays in sync via SharedWorker'),
    createTodo('Double-click a todo to edit it')
  ],
  filter: 'all',
  canUndo: false,
  canRedo: false,

  get remaining() {
    return this.todos.filter((todo) => !todo.completed).length;
  },

  get completedCount() {
    return this.todos.filter((todo) => todo.completed).length;
  },

  get allCompleted() {
    return this.todos.length > 0 && this.todos.every((todo) => todo.completed);
  },

  get visibleTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter((todo) => !todo.completed);
      case 'completed':
        return this.todos.filter((todo) => todo.completed);
      default:
        return this.todos;
    }
  },

  addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    set((state) => {
      state.todos.unshift(createTodo(trimmed));
    });
  },

  toggleTodo(id) {
    set((state) => {
      const todo = state.todos.find((todo) => todo.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    });
  },

  updateTodo(id, text) {
    const trimmed = text.trim();
    set((state) => {
      const todo = state.todos.find((todo) => todo.id === id);
      if (!todo) {
        return;
      }
      if (trimmed) {
        todo.text = trimmed;
      } else {
        state.todos = state.todos.filter((todo) => todo.id !== id);
      }
    });
  },

  removeTodo(id) {
    set((state) => {
      state.todos = state.todos.filter((todo) => todo.id !== id);
    });
  },

  toggleAll() {
    set((state) => {
      const makeCompleted = state.todos.some((todo) => !todo.completed);
      state.todos.forEach((todo) => {
        todo.completed = makeCompleted;
      });
    });
  },

  clearCompleted() {
    set((state) => {
      state.todos = state.todos.filter((todo) => !todo.completed);
    });
  },

  setFilter(filter) {
    set((state) => {
      state.filter = filter;
    });
  },

  undo() {
    const api = (store as Store<TodosState> & {
      history?: HistoryApi<TodosState>;
    }).history;
    return api?.undo() ?? false;
  },

  redo() {
    const api = (store as Store<TodosState> & {
      history?: HistoryApi<TodosState>;
    }).history;
    return api?.redo() ?? false;
  }
});
