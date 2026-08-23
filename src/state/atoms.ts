import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import type { Book, Comic, VideoGame, Movie, MusicAlbum, CustomCollectionType, CustomItem, AnyItem, SubCollection } from "@/types";
import type { Language } from "@/i18n/translations";
import { setInIDB } from "@/storage/idb";

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

// --- IDB-backed collection atoms ---
// Each uses a private async atom backed by IndexedDB, then a derived writable
// atom that returns [] while the IDB Promise is pending. This keeps the public
// API identical to the old atomWithStorage atoms so no consumers need changes.

function makeCollectionAtom<T extends unknown[]>(key: string, def: T) {
  const base = atom<T>(def);
  const _public = atom<T, [T | ((prev: T) => T)], void>(
    (get) => get(base),
    (get, set, update) => {
      const next = typeof update === "function" ? update(get(base)) : update;
      set(base, next);
      setInIDB(key, next);
    }
  );
  return { atom: _public, asyncAtom: base };
}

const _books      = makeCollectionAtom<Book[]>("collection-books", []);
const _comics     = makeCollectionAtom<Comic[]>("collection-comics", []);
const _videoGames = makeCollectionAtom<VideoGame[]>("collection-videogames", []);
const _movies     = makeCollectionAtom<Movie[]>("collection-movies", []);
const _music      = makeCollectionAtom<MusicAlbum[]>("collection-music", []);

export const booksAtom      = _books.atom;
export const comicsAtom     = _comics.atom;
export const videoGamesAtom = _videoGames.atom;
export const moviesAtom     = _movies.atom;
export const musicAtom      = _music.atom;

export interface TrashedEntry {
  item: AnyItem | CustomItem;
  kind: string;
  typeId?: string;
  subCollectionId?: string;
  deletedAt: string;
}

const _trashed     = makeCollectionAtom<TrashedEntry[]>("collection-trashed", []);
const _customTypes = makeCollectionAtom<CustomCollectionType[]>("collection-custom-types", []);

export const trashedItemsAtom = _trashed.atom;
export const customTypesAtom  = _customTypes.atom;

// customItemsAtom uses a Record, not an array — handle separately
const _customItemsBase = atom<Record<string, CustomItem[]>>({});
export const customItemsAtom = atom<
  Record<string, CustomItem[]>,
  [Record<string, CustomItem[]> | ((prev: Record<string, CustomItem[]>) => Record<string, CustomItem[]>)],
  void
>(
  (get) => get(_customItemsBase),
  (get, set, update) => {
    const next = typeof update === "function" ? update(get(_customItemsBase)) : update;
    set(_customItemsBase, next);
    setInIDB("collection-custom-items", next);
  }
);

// Set to true once the initial Drive load (or skip) has completed.
// Prevents auto-push from firing before Drive data has been pulled on startup.
export const driveLoadDoneAtom = atom(false);

export function makeCustomItemsAtom(typeId: string) {
  return atom(
    (get) => get(customItemsAtom)[typeId] ?? [],
    (get, set, items: CustomItem[]) => {
      const all = get(customItemsAtom);
      set(customItemsAtom, { ...all, [typeId]: items });
    },
  );
}

// --- Sub-collection atoms ---
const _subCollections = makeCollectionAtom<SubCollection[]>("collection-sub-collections", []);
export const subCollectionsAtom = _subCollections.atom;

const _subCollectionItemsBase = atom<Record<string, AnyItem[]>>({});
export const subCollectionItemsAtom = atom<
  Record<string, AnyItem[]>,
  [Record<string, AnyItem[]> | ((prev: Record<string, AnyItem[]>) => Record<string, AnyItem[]>)],
  void
>(
  (get) => get(_subCollectionItemsBase),
  (get, set, update) => {
    const next = typeof update === "function" ? update(get(_subCollectionItemsBase)) : update;
    set(_subCollectionItemsBase, next);
    setInIDB("collection-sub-items", next);
  }
);

export function makeSubCollectionItemsAtom(collectionId: string) {
  return atom(
    (get) => get(subCollectionItemsAtom)[collectionId] ?? [],
    (get, set, items: AnyItem[]) => {
      const all = get(subCollectionItemsAtom);
      set(subCollectionItemsAtom, { ...all, [collectionId]: items });
    },
  );
}

export const sidebarExpandedAtom = atomWithStorage<string[]>("collection-sidebar-expanded", []);

export const categoryOrderAtom = atomWithStorage<string[]>(
  "collection-category-order",
  ["movies", "books", "music", "comics", "videogames"],
);

// Per-sub-collection column settings — Record<subCollectionId, MovieColumnSetting[]>
const _subColColumnsBase = atom<Record<string, MovieColumnSetting[]>>({});
export const subCollectionColumnsAtom = atom<
  Record<string, MovieColumnSetting[]>,
  [Record<string, MovieColumnSetting[]> | ((prev: Record<string, MovieColumnSetting[]>) => Record<string, MovieColumnSetting[]>)],
  void
>(
  (get) => get(_subColColumnsBase),
  (get, set, update) => {
    const next = typeof update === "function" ? update(get(_subColColumnsBase)) : update;
    set(_subColColumnsBase, next);
    setInIDB("collection-sub-columns", next);
  }
);

export const driveClientIdAtom = atomWithStorage<string>("collection-drive-client-id", "");
export const driveSyncEnabledAtom = atomWithStorage<boolean>("collection-drive-enabled", false);
export const driveLastSyncAtom = atomWithStorage<string | null>("collection-drive-last-sync", null);
export const driveSyncStatusAtom = atom<"idle" | "syncing" | "error">("idle");
export const drivePendingAtom = atom<boolean>(false);
export const driveUserAtom = atomWithStorage<{ name: string; email: string } | null>("collection-drive-user", null);

export const appPasswordHashAtom = atomWithStorage<string>("collection-password-hash", "");

export interface MovieColumnSetting { key: string; visible: boolean; }

export const DEFAULT_MOVIE_COLUMNS: MovieColumnSetting[] = [
  { key: "year",      visible: true  },
  { key: "director",  visible: true  },
  { key: "country",   visible: true  },
  { key: "duration",  visible: true  },
  { key: "edition",   visible: true  },
  { key: "quality",   visible: true  },
  { key: "format",    visible: false },
  { key: "location",  visible: true  },
  { key: "genre",     visible: true  },
  { key: "status",    visible: false },
  { key: "rating",    visible: false },
  { key: "notes",     visible: false },
];
export const movieColumnsAtom = atomWithStorage<MovieColumnSetting[]>(
  "collection-movie-columns",
  DEFAULT_MOVIE_COLUMNS,
);

export const DEFAULT_BOOK_COLUMNS: MovieColumnSetting[] = [
  { key: "author",    visible: true  },
  { key: "publisher", visible: false },
  { key: "genre",    visible: true  },
  { key: "year",     visible: true  },
  { key: "pages",    visible: false },
  { key: "language", visible: true  },
  { key: "edition",  visible: false },
  { key: "location", visible: false },
  { key: "format",   visible: true  },
  { key: "status",   visible: true  },
  { key: "rating",   visible: true  },
  { key: "notes",    visible: false },
];
export const bookColumnsAtom = atomWithStorage<MovieColumnSetting[]>(
  "collection-book-columns",
  DEFAULT_BOOK_COLUMNS,
);

export const DEFAULT_COMIC_COLUMNS: MovieColumnSetting[] = [
  { key: "author",    visible: true  },
  { key: "series",    visible: true  },
  { key: "issue",     visible: true  },
  { key: "pages",     visible: false },
  { key: "year",      visible: true  },
  { key: "publisher", visible: false },
  { key: "genre",     visible: false },
  { key: "condition", visible: true  },
  { key: "status",    visible: true  },
  { key: "rating",    visible: true  },
  { key: "notes",     visible: false },
];
export const comicColumnsAtom = atomWithStorage<MovieColumnSetting[]>(
  "collection-comic-columns",
  DEFAULT_COMIC_COLUMNS,
);

export const DEFAULT_VIDEOGAME_COLUMNS: MovieColumnSetting[] = [
  { key: "studio",   visible: true  },
  { key: "genre",    visible: true  },
  { key: "year",     visible: true  },
  { key: "platform", visible: true  },
  { key: "status",   visible: true  },
  { key: "rating",   visible: true  },
  { key: "notes",    visible: false },
];
export const videoGameColumnsAtom = atomWithStorage<MovieColumnSetting[]>(
  "collection-videogame-columns",
  DEFAULT_VIDEOGAME_COLUMNS,
);

export const DEFAULT_MUSIC_COLUMNS: MovieColumnSetting[] = [
  { key: "artist",  visible: true  },
  { key: "genre",   visible: true  },
  { key: "year",    visible: true  },
  { key: "format",  visible: true  },
  { key: "status",  visible: true  },
  { key: "rating",  visible: true  },
  { key: "notes",   visible: false },
];
export const musicColumnsAtom = atomWithStorage<MovieColumnSetting[]>(
  "collection-music-columns",
  DEFAULT_MUSIC_COLUMNS,
);

export interface CustomColumnDef { key: string; label: string; width: number; }

// Extra user-defined columns per collection kind
export const customColumnsAtom = atomWithStorage<Record<string, CustomColumnDef[]>>(
  "collection-custom-columns",
  {},
);

// Extra user-defined columns per sub-collection id
const _subCollectionCustomColumnsBase = atom<Record<string, CustomColumnDef[]>>({});
export const subCollectionCustomColumnsAtom = atom<
  Record<string, CustomColumnDef[]>,
  [Record<string, CustomColumnDef[]> | ((prev: Record<string, CustomColumnDef[]>) => Record<string, CustomColumnDef[]>)],
  void
>(
  (get) => get(_subCollectionCustomColumnsBase),
  (get, set, update) => {
    const next = typeof update === "function" ? update(get(_subCollectionCustomColumnsBase)) : update;
    set(_subCollectionCustomColumnsBase, next);
    setInIDB("collection-sub-custom-columns", next);
  }
);
