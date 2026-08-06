import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useCallback } from "react";
import {
  booksAtom, comicsAtom, videoGamesAtom, moviesAtom, musicAtom,
  customTypesAtom, customItemsAtom,
  driveClientIdAtom, driveSyncEnabledAtom, driveLastSyncAtom,
  driveSyncStatusAtom, driveUserAtom,
} from "@/state/atoms";
import {
  initGoogleDrive, signIn, signInSilent, signOut, isSignedIn, getUser,
  readFromDrive, writeToDrive, setStatusListener,
} from "@/lib/driveSync";
import type { CollectionData, CustomItem } from "@/types";

function readLocalAll(): CollectionData & { music: unknown[]; customItems: Record<string, CustomItem[]> } {
  const parse = <T>(key: string, fallback: T): T => {
    try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)); }
    catch { return fallback; }
  };
  return {
    books:       parse("collection-books", []),
    comics:      parse("collection-comics", []),
    videoGames:  parse("collection-videogames", []),
    movies:      parse("collection-movies", []),
    music:       parse("collection-music", []),
    customTypes: parse("collection-custom-types", []),
    customItems: parse("collection-custom-items", {}),
    version: 1,
  };
}

// Module-level flag so navigating away/back doesn't re-trigger silent auth
let driveInitialized = false;

export function useDriveSync() {
  const clientId       = useAtomValue(driveClientIdAtom);
  const [enabled, setEnabled] = useAtom(driveSyncEnabledAtom);
  const [, setLastSync]  = useAtom(driveLastSyncAtom);
  const setStatus        = useSetAtom(driveSyncStatusAtom);
  const [driveUser, setDriveUser] = useAtom(driveUserAtom);
  const lastSync         = useAtomValue(driveLastSyncAtom);

  const [, setBooks]      = useAtom(booksAtom);
  const [, setComics]     = useAtom(comicsAtom);
  const [, setVideoGames] = useAtom(videoGamesAtom);
  const [, setMovies]     = useAtom(moviesAtom);
  const [, setMusic]      = useAtom(musicAtom);
  const [, setCustomTypes] = useAtom(customTypesAtom);
  const [, setCustomItems] = useAtom(customItemsAtom);

  const books      = useAtomValue(booksAtom);
  const comics     = useAtomValue(comicsAtom);
  const videoGames = useAtomValue(videoGamesAtom);
  const movies     = useAtomValue(moviesAtom);
  const music      = useAtomValue(musicAtom);
  const customTypes = useAtomValue(customTypesAtom);
  const customItems = useAtomValue(customItemsAtom);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setStatusListener((s) => {
      setStatus(s);
      if (s === "idle") setLastSync(new Date().toISOString());
    });
  }, [setStatus, setLastSync]);

  const loadFromDrive = useCallback(async () => {
    const data = await readFromDrive();
    if (!data) return;
    if (Array.isArray(data.books))      setBooks(data.books);
    if (Array.isArray(data.comics))     setComics(data.comics);
    if (Array.isArray(data.videoGames)) setVideoGames(data.videoGames);
    if (Array.isArray(data.movies))     setMovies(data.movies);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (Array.isArray((data as any).music)) setMusic((data as any).music);
    if (Array.isArray(data.customTypes)) setCustomTypes(data.customTypes);
    if (data.customItems && typeof data.customItems === "object") setCustomItems(data.customItems as Record<string, CustomItem[]>);
    setLastSync(new Date().toISOString());
  }, [setBooks, setComics, setVideoGames, setMovies, setMusic, setCustomTypes, setCustomItems, setLastSync]);

  const syncNow = useCallback(async () => {
    if (!isSignedIn()) return;
    const data = readLocalAll();
    await writeToDrive(data);
    setLastSync(new Date().toISOString());
  }, [setLastSync]);

  useEffect(() => {
    if (!enabled || !clientId || driveInitialized) return;
    driveInitialized = true;
    initGoogleDrive(clientId).then(async () => {
      try {
        await signInSilent(clientId);
        setDriveUser(getUser());
        await loadFromDrive();
      } catch {
        // Silent sign-in failed — user must click Connect manually
      }
    }).catch(() => {});
  }, [enabled, clientId, loadFromDrive, setDriveUser]);

  useEffect(() => {
    if (!enabled || !isSignedIn()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { syncNow(); }, 2000);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [books, comics, videoGames, movies, music, customTypes, customItems, enabled, syncNow]);

  const connect = useCallback(async (id: string) => {
    await initGoogleDrive(id);
    await signIn();
    setDriveUser(getUser());
    setEnabled(true);
    await loadFromDrive();
  }, [setEnabled, setDriveUser, loadFromDrive]);

  const disconnect = useCallback(() => {
    signOut();
    setDriveUser(null);
    setEnabled(false);
    driveInitialized = false;
  }, [setEnabled, setDriveUser]);

  return { syncNow, connect, disconnect, user: driveUser, lastSync, enabled };
}
