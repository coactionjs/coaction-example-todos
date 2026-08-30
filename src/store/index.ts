import { create, type Store } from '@coaction/react';
import type { HistoryApi } from '@coaction/history';
import { logger } from '@coaction/logger';

import { attachHistoryFlagSync, authorityMiddlewares } from './authority';
import { todosSlice, type TodosState } from './todo';

const STORE_NAME = 'todos';

const createWorker = () => {
  try {
    return new SharedWorker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
      name: STORE_NAME
    });
  } catch {
    // SharedWorker construction can fail in restricted contexts
    // (e.g. Firefox private windows); fall back to a local store.
    return undefined;
  }
};

const worker = typeof SharedWorker !== 'undefined' ? createWorker() : undefined;

/** True when the store runs on a SharedWorker shared by all tabs. */
export const isSharedWorkerMode = worker !== undefined;

/**
 * The React hook for the todos store.
 *
 * With SharedWorker support every tab connects as a client mirror: reads are
 * local and synchronous, actions are transported to the authority and the
 * returned promises resolve once the mirror has caught up. Without it, the
 * same slice degrades to a local store whose actions still return promises
 * (coaction ≥ 3.2) — and that fallback also takes over the authority-side
 * middlewares, so history and persistence work in both modes.
 */
export const useTodos = create<TodosState>(todosSlice, {
  name: STORE_NAME,
  worker,
  middlewares: isSharedWorkerMode
    ? // Mirror-only: history()/persist() are not supported in client mode.
      [logger()]
    : // The degraded store IS the authority, so it owns history + persist.
      [logger(), ...authorityMiddlewares]
});

if (!isSharedWorkerMode) {
  attachHistoryFlagSync(
    useTodos as unknown as Store<TodosState> & {
      history?: HistoryApi<TodosState>;
    }
  );
}
