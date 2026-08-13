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
  { key: "author",   visible: true  },
  { key: "editor",   visible: false },
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
  { key: "editor",    visible: true  },
  { key: "author",    visible: false },
  { key: "series",    visible: true  },
  { key: "issue",     visible: true  },
  { key: "year",      visible: true  },
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
