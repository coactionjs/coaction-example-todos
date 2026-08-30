import { create } from '@coaction/react';
import { logger } from '@coaction/logger';

import {
  attachHistoryFlagSync,
  authorityMiddlewares
} from './authority';
import { todosSlice, type TodosState } from './todo';

/**
 * The write authority of the todos app.
 *
 * coaction detects `SharedWorkerGlobalScope` and automatically bridges this
 * store to every connecting tab: clients execute actions here, and the
 * resulting patches are broadcast back to all mirrors.
 *
 * `history()` and `persist()` run authority-side only: the undo journal and
 * the IndexedDB-persisted state are owned by this single store and shared by
 * every connected tab.
 */
export const todosAuthority = create<TodosState>(todosSlice, {
  name: 'todos',
  middlewares: [
    logger({
      collapsed: false
    }),
    ...authorityMiddlewares
  ]
});

attachHistoryFlagSync(todosAuthority);

declare global {
  // Exposed for debugging in the SharedWorker devtools console.
  // eslint-disable-next-line no-var
  var todosAuthority: unknown;
}

(globalThis as Record<string, unknown>).todosAuthority = todosAuthority;
