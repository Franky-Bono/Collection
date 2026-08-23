import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createStore, Provider } from "jotai";
import { migrateLocalStorageToIDB } from "./storage/migration";
import { loadAllFromIDB } from "./storage/idb";
import {
  booksAtom, comicsAtom, videoGamesAtom, moviesAtom, musicAtom,
  trashedItemsAtom, customTypesAtom, customItemsAtom,
  subCollectionsAtom, subCollectionItemsAtom, subCollectionColumnsAtom,
} from "./state/atoms";
import type { Book, Comic, VideoGame, Movie, MusicAlbum, CustomCollectionType, SubCollection, AnyItem } from "./types";
import type { TrashedEntry, MovieColumnSetting } from "./state/atoms";
import type { CustomItem } from "./types";

async function bootstrap() {
  await migrateLocalStorageToIDB();
  const snapshot = await loadAllFromIDB();

  const store = createStore();
  store.set(booksAtom,               snapshot["collection-books"] as Book[]);
  store.set(comicsAtom,              snapshot["collection-comics"] as Comic[]);
  store.set(videoGamesAtom,          snapshot["collection-videogames"] as VideoGame[]);
  store.set(moviesAtom,              snapshot["collection-movies"] as Movie[]);
  store.set(musicAtom,               snapshot["collection-music"] as MusicAlbum[]);
  store.set(trashedItemsAtom,        snapshot["collection-trashed"] as TrashedEntry[]);
  store.set(customTypesAtom,         snapshot["collection-custom-types"] as CustomCollectionType[]);
  store.set(customItemsAtom,         snapshot["collection-custom-items"] as Record<string, CustomItem[]>);
  store.set(subCollectionsAtom,      snapshot["collection-sub-collections"] as SubCollection[]);
  store.set(subCollectionItemsAtom,  snapshot["collection-sub-items"] as Record<string, AnyItem[]>);
  store.set(subCollectionColumnsAtom, snapshot["collection-sub-columns"] as Record<string, MovieColumnSetting[]>);

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}

bootstrap();
