import { createStore, get, set, del, getMany, setMany } from "idb-keyval";

export const collectionStore = createStore("collection-app", "collections");

export function idbStorage<T>() {
  return {
    async getItem(key: string, initialValue: T): Promise<T> {
      try {
        const stored = await get<T>(key, collectionStore);
        return stored === undefined ? initialValue : stored;
      } catch {
        return initialValue;
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

const COLLECTION_KEYS = [
  "collection-books",
  "collection-comics",
  "collection-videogames",
  "collection-movies",
  "collection-music",
  "collection-trashed",
  "collection-custom-types",
  "collection-custom-items",
] as const;

export type IDBSnapshot = {
  "collection-books": unknown[];
  "collection-comics": unknown[];
  "collection-videogames": unknown[];
  "collection-movies": unknown[];
  "collection-music": unknown[];
  "collection-trashed": unknown[];
  "collection-custom-types": unknown[];
  "collection-custom-items": Record<string, unknown[]>;
};

export async function loadAllFromIDB(): Promise<IDBSnapshot> {
  try {
    const values = await getMany([...COLLECTION_KEYS], collectionStore);
    return {
      "collection-books":       Array.isArray(values[0]) ? values[0] : [],
      "collection-comics":      Array.isArray(values[1]) ? values[1] : [],
      "collection-videogames":  Array.isArray(values[2]) ? values[2] : [],
      "collection-movies":      Array.isArray(values[3]) ? values[3] : [],
      "collection-music":       Array.isArray(values[4]) ? values[4] : [],
      "collection-trashed":     Array.isArray(values[5]) ? values[5] : [],
      "collection-custom-types":Array.isArray(values[6]) ? values[6] : [],
      "collection-custom-items":values[7] && typeof values[7] === "object" && !Array.isArray(values[7]) ? values[7] as Record<string, unknown[]> : {},
    };
  } catch {
    return {
      "collection-books": [], "collection-comics": [], "collection-videogames": [],
      "collection-movies": [], "collection-music": [], "collection-trashed": [],
      "collection-custom-types": [], "collection-custom-items": {},
    };
  }
}

export { getMany, setMany };
