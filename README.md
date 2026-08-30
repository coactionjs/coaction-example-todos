# todos — Coaction + React + SharedWorker

A complete TodoMVC-style todos app where **state lives in a SharedWorker** and
every open tab mirrors it. Add a todo in one window, watch it appear in the
other — one write authority, zero localStorage tricks.

Built with [Coaction](https://github.com/coactionjs/coaction) (`@coaction/react`),
React 19, [shadcn/ui](https://ui.shadcn.com) on Tailwind CSS v4, and Vite.

## Features

- Add / rename / complete / delete todos, toggle-all, clear completed
- All / Active / Completed filters with live counters
- Cross-tab realtime sync through a SharedWorker authority
- Undo / redo (buttons + ⌘/Ctrl+Z, ⇧⌘/Ctrl+Shift+Z) powered by `@coaction/history`
  — filter switches are deliberately not undoable (`partialize` scopes history to todos)
- Persistence via `@coaction/persist` with an IndexedDB storage adapter
  (localStorage is unavailable inside SharedWorkers), so todos survive reloads
- Automatic fine-grained re-renders via `observer()` render tracking
- Cached computed state (`remaining`, `visibleTodos`, …) as plain accessor
  getters — coaction caches them on its signal graph until the fields they
  read change
- Dark / light / system theme with no flash on load
- Graceful fallback to a local store where SharedWorker is unavailable —
  including history and persistence (coaction ≥ 3.2 degradation)

## Getting started

```sh
npm install
npm run dev
```

Then click **Open another tab** (or just duplicate the tab) and edit todos in
both windows.

## Architecture

```
 ┌────────────┐  execute action (JSON)  ┌──────────────────────────┐
 │   Tab A    │ ───────────────────────▶│                          │
 │ mirror +   │ ◀─────────────────────── │   SharedWorker           │
 │ observer() │   patch broadcast       │   write authority        │
 └────────────┘                          │   create(todosSlice)    │
 ┌────────────┐  execute action (JSON)  │                          │
 │   Tab B    │ ───────────────────────▶│   runs actions, computes │
 │ mirror +   │ ◀─────────────────────── │   patches, broadcasts    │
 │ observer() │   patch broadcast       └──────────────────────────┘
 └────────────┘
```

- **`src/store/todo.ts`** — the single slice definition shared by all
  runtimes. Plain JSON data (what crosses the boundary), cached computed
  values as accessor getters (`get remaining() { … }` — deps are discovered
  automatically; `get(deps, fn)` remains available when a cross-slice
  dependency contract should be explicit), and actions written as mutable
  drafts (`set((state) => …)`). The `undo`/`redo` actions reach the
  authority-side history api through the slice factory's third argument (the
  runtime store).
- **`src/store/worker.ts`** — runs inside the SharedWorker. `create()` detects
  `SharedWorkerGlobalScope` and automatically bridges every connecting tab.
  `history()` and `persist()` are authority-side middlewares: the undo journal
  and persisted state are owned by one store and shared by every tab.
- **`src/store/authority.ts`** — authority middlewares plus a bridge that
  reflects `canUndo`/`canRedo` into reactive state (deferred to a microtask
  and run under history suppression so flag updates never enter the journal).
- **`src/store/storage.ts`** — a tiny async IndexedDB `PersistStorage`; one
  backend for the worker authority and the local fallback alike.
- **`src/store/index.ts`** — client side. `create(todosSlice, { worker })`
  returns a mirrored store: reads are local and synchronous, actions are
  transported to the authority and their promises resolve once the mirror has
  caught up. If `SharedWorker` is missing (e.g. some private modes), the same
  slice degrades to a local store that takes over the authority middlewares.

### Why the filter lives in the store

Filters are view state, but keeping them in the shared store means every tab
renders the same list — a nice property when two windows are open side by side.

## Notable Coaction idioms used here

| Concern | Approach |
| --- | --- |
| Re-render scoping | `observer()` tracks exactly the fields a component reads |
| Derived state | accessor getters cache on the signal graph; `get(deps, fn)` for explicit cross-slice deps |
| Updates | mutable writes inside `set()`, immutable snapshots outside |
| Undo / redo | `history()` on the authority; slice actions transport undo across tabs |
| Persistence | `persist()` on the authority with an IndexedDB adapter |
| Worker transport | `create(slice, { worker })` — client actions return promises |
| Degradation | `worker: undefined` falls back to a local authority (coaction ≥ 3.2) |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (SharedWorker in module mode) |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |
