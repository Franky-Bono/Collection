import type { CollectionData, CustomItem } from "@/types";
import { getMany } from "idb-keyval";
import { collectionStore } from "./idb";

const IDB_KEYS = {
  books:       "collection-books",
  comics:      "collection-comics",
  videoGames:  "collection-videogames",
  movies:      "collection-movies",
  music:       "collection-music",
  customTypes: "collection-custom-types",
  customItems: "collection-custom-items",
} as const;

export async function exportJSON(): Promise<void> {
  const keys = Object.values(IDB_KEYS) as string[];
  const values = await getMany(keys, collectionStore);
  const data: Record<string, unknown> = { version: 1 };
  (Object.keys(IDB_KEYS) as Array<keyof typeof IDB_KEYS>).forEach((k, i) => {
    data[k] = values[i] ?? (k === "customItems" ? {} : []);
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `collection-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importJSON(file: File): Promise<CollectionData & { music: unknown[]; customItems: Record<string, CustomItem[]> }> {
  const text = await file.text();
  const data = JSON.parse(text);
  return data;
}
