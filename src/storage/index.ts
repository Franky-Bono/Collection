import type { CollectionData, CustomItem } from "@/types";

const STORAGE_KEYS = {
  books: "collection-books",
  comics: "collection-comics",
  videoGames: "collection-videogames",
  movies: "collection-movies",
  music: "collection-music",
  customTypes: "collection-custom-types",
  customItems: "collection-custom-items",
};

export function exportJSON(): void {
  const data: Record<string, unknown> = {};
  for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
    try {
      data[key] = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    } catch {
      data[key] = [];
    }
  }
  data.version = 1;
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
