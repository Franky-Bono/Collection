import { setMany } from "idb-keyval";
import { collectionStore } from "./idb";

const DONE_KEY = "collection-idb-migration-v1";

const KEYS = [
  "collection-books",
  "collection-comics",
  "collection-videogames",
  "collection-movies",
  "collection-music",
  "collection-trashed",
  "collection-custom-types",
  "collection-custom-items",
];

export async function migrateLocalStorageToIDB(): Promise<void> {
  if (localStorage.getItem(DONE_KEY)) return;

  const entries: [string, unknown][] = [];
  for (const key of KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      entries.push([key, JSON.parse(raw)]);
    } catch {
      // skip corrupt entries
    }
  }

  if (entries.length > 0) await setMany(entries, collectionStore);

  localStorage.setItem(DONE_KEY, "1");
  // Old localStorage keys are intentionally kept for safe rollback
}
