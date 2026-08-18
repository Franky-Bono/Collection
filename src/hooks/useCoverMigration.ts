import { useEffect } from "react";
import { getFromIDB, setInIDB } from "@/storage/idb";

const MAX_WIDTH = 200;
const JPEG_QUALITY = 0.7;
const MIGRATION_KEY = "collection-migration-v1-covers-compressed";
const COLLECTION_KEYS = [
  "collection-books",
  "collection-comics",
  "collection-videogames",
  "collection-movies",
  "collection-music",
];

async function compressBase64(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function useCoverMigration() {
  useEffect(() => {
    if (localStorage.getItem(MIGRATION_KEY)) return;

    async function run() {
      for (const key of COLLECTION_KEYS) {
        const items = await getFromIDB<Array<Record<string, unknown>>>(key, []);
        if (items.length === 0) continue;

        let changed = false;
        for (const item of items) {
          const cover = item.coverUrl as string | undefined;
          if (cover?.startsWith("data:image/") && !cover.startsWith("data:image/jpeg")) {
            item.coverUrl = await compressBase64(cover);
            changed = true;
          } else if (cover?.startsWith("data:image/jpeg")) {
            if (cover.length > 50_000) {
              item.coverUrl = await compressBase64(cover);
              changed = true;
            }
          }
        }

        if (changed) {
          await setInIDB(key, items);
        }

        // Yield to the browser between collections
        await new Promise(r => setTimeout(r, 0));
      }
      localStorage.setItem(MIGRATION_KEY, "1");
    }

    run();
  }, []);
}
