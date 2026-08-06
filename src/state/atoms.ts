import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import type { Book, Comic, VideoGame, Movie, MusicAlbum, CustomCollectionType, CustomItem } from "@/types";
import type { Language } from "@/i18n/translations";

export type ThousandSeparator = "," | "." | "";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

export const thousandSeparatorAtom = atomWithStorage<ThousandSeparator>(
  "collection-thousand-sep",
  ",",
);

export const dateFormatAtom = atomWithStorage<DateFormat>(
  "collection-date-format",
  "DD/MM/YYYY",
);

export const colorSchemeAtom = atomWithStorage<"dark" | "light">(
  "collection-color-scheme",
  "dark",
);

export const languageAtom = atomWithStorage<Language>(
  "collection-language",
  "en",
);

export const sidebarCollapsedAtom = atomWithStorage<boolean>(
  "collection-sidebar-collapsed",
  false,
);

export const booksAtom = atomWithStorage<Book[]>("collection-books", []);
export const comicsAtom = atomWithStorage<Comic[]>("collection-comics", []);
export const videoGamesAtom = atomWithStorage<VideoGame[]>("collection-videogames", []);
export const moviesAtom = atomWithStorage<Movie[]>("collection-movies", []);
export const musicAtom = atomWithStorage<MusicAlbum[]>("collection-music", []);

export const customTypesAtom = atomWithStorage<CustomCollectionType[]>(
  "collection-custom-types",
  [],
);

export const customItemsAtom = atomWithStorage<Record<string, CustomItem[]>>(
  "collection-custom-items",
  {},
);

export function makeCustomItemsAtom(typeId: string) {
  return atom(
    (get) => get(customItemsAtom)[typeId] ?? [],
    (get, set, items: CustomItem[]) => {
      const all = get(customItemsAtom);
      set(customItemsAtom, { ...all, [typeId]: items });
    },
  );
}

export const driveClientIdAtom = atomWithStorage<string>("collection-drive-client-id", "");
export const driveSyncEnabledAtom = atomWithStorage<boolean>("collection-drive-enabled", false);
export const driveLastSyncAtom = atomWithStorage<string | null>("collection-drive-last-sync", null);
export const driveSyncStatusAtom = atom<"idle" | "syncing" | "error">("idle");
export const driveUserAtom = atom<{ name: string; email: string } | null>(null);

export const appPasswordHashAtom = atomWithStorage<string>("collection-password-hash", "");
