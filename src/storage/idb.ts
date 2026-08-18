import { createStore, get, set, del, getMany, setMany } from "idb-keyval";

export const collectionStore = createStore("collection-app", "collections");

export function idbStorage<T>() {
  return {
    async getItem(key: string, initialValue: T): Promise<T> {
      try {
        const stored = await get<T>(key, collectionStore);
        return stored === undefined ? initialValue : stored;
      } catch {
        return initialValue; // IDB unavailable (private mode, permissions, etc.)
      }
    },
    async setItem(key: string, value: T): Promise<void> {
      await set(key, value, collectionStore);
    },
    async removeItem(key: string): Promise<void> {
      await del(key, collectionStore);
    },
  };
}

export async function getFromIDB<T>(key: string, fallback: T): Promise<T> {
  try {
    const stored = await get<T>(key, collectionStore);
    return stored === undefined ? fallback : stored;
  } catch {
    return fallback;
  }
}

export async function setInIDB<T>(key: string, value: T): Promise<void> {
  await set(key, value, collectionStore);
}

export { getMany, setMany };
