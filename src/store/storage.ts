import type { PersistStorage } from '@coaction/persist';

const DB_NAME = 'coaction-todos';
const STORE_NAME = 'kv';

let dbPromise: Promise<IDBDatabase | undefined> | undefined;

const openDatabase = () =>
  new Promise<IDBDatabase | undefined>((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(undefined);
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(undefined);
    request.onblocked = () => resolve(undefined);
  });

const getDatabase = () => {
  dbPromise ??= openDatabase();
  return dbPromise;
};

const runRequest = async (
  mode: IDBTransactionMode,
  action: (objectStore: IDBObjectStore) => IDBRequest
): Promise<unknown> => {
  const database = await getDatabase();
  if (!database) {
    return undefined;
  }
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve(request.result);
  });
};

/**
 * A tiny IndexedDB-backed PersistStorage.
 *
 * `localStorage` is unavailable inside a SharedWorker, so the worker
 * authority and the local fallback share this single async backend —
 * persisted state stays consistent whichever mode a browser runs.
 */
export const idbStorage: PersistStorage = {
  async getItem(name) {
    try {
      const value = await runRequest('readonly', (store) => store.get(name));
      return typeof value === 'string' ? value : null;
    } catch {
      return null;
    }
  },
  async setItem(name, value) {
    try {
      await runRequest('readwrite', (store) => store.put(value, name));
    } catch {
      // Persistence is best-effort; quota or transient failures are ignored.
    }
  },
  async removeItem(name) {
    try {
      await runRequest('readwrite', (store) => store.delete(name));
    } catch {
      // Persistence is best-effort.
    }
  }
};
