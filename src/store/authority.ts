import { history, type HistoryApi } from '@coaction/history';
import type { Middleware, Store } from '@coaction/react';
import { persist } from '@coaction/persist';

import { idbStorage } from './storage';
import type { TodosState } from './todo';

export const PERSIST_KEY = 'coaction-todos';

type AuthorityStore = Store<TodosState> & {
  history?: HistoryApi<TodosState>;
};

const historySuppress = Symbol.for('coaction.history.suppress');

const getSuppressRunner = (store: AuthorityStore) =>
  (store as unknown as Record<symbol, unknown>)[historySuppress] as
    | ((callback: () => void) => void)
    | undefined;

/**
 * Authority-side middlewares: `history()` and `persist()` only run where the
 * write authority lives (the SharedWorker, or the local fallback store), so
 * undo journal and persisted state are single-sourced and shared by all tabs.
 */
export const authorityMiddlewares: Middleware<TodosState>[] = [
  history({
    // Undo/redo should replay todo edits, not view-state switches.
    partialize: (state) => ({ todos: state.todos })
  }),
  persist({
    name: PERSIST_KEY,
    storage: idbStorage,
    partialize: (state) => ({
      todos: state.todos,
      filter: state.filter
    })
  })
];

/**
 * Reflect history availability into reactive store state so every mirror can
 * enable or disable undo/redo affordances. Commits run inside the updater,
 * so the flag write is deferred to a microtask and runs under history
 * suppression — it never becomes an undo entry itself.
 */
export const attachHistoryFlagSync = (store: AuthorityStore) => {
  let scheduled = false;
  const applyFlags = () => {
    scheduled = false;
    const api = store.history;
    if (!api) {
      return;
    }
    const canUndo = api.canUndo();
    const canRedo = api.canRedo();
    const state = store.getState();
    if (state.canUndo === canUndo && state.canRedo === canRedo) {
      return;
    }
    const apply = () => {
      store.setState({ canUndo, canRedo });
    };
    const suppress = getSuppressRunner(store);
    if (suppress) {
      suppress(apply);
    } else {
      apply();
    }
  };
  const scheduleFlags = () => {
    if (scheduled) {
      return;
    }
    scheduled = true;
    queueMicrotask(applyFlags);
  };
  store.subscribe(scheduleFlags);
  scheduleFlags();
};
