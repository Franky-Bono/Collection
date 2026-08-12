import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useCallback } from "react";
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

// Module-level singletons — shared across all hook instances so SettingsPage
// and RootLayout don't create conflicting parallel sync loops.
let driveInitialized = false;
let initialLoadDone = false;
let isSyncing = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

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

  useEffect(() => {
    setStatusListener((s) => {
      setStatus(s);
      if (s === "idle") setLastSync(new Date().toISOString());
    });
  }, [setStatus, setLastSync]);

  const loadFromDrive = useCallback(async () => {
    const data = await readFromDrive();
    initialLoadDone = true;
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

  const pushToDrive = useCallback(async (snapshot: CollectionData & { music: unknown[]; customItems: Record<string, CustomItem[]> }) => {
    if (!isSignedIn()) { console.log("[Drive] pushToDrive skipped: not signed in"); return; }
    console.log("[Drive] pushing to Drive...");
    isSyncing = true;
    try {
      await writeToDrive(snapshot);
      console.log("[Drive] push complete");
      setLastSync(new Date().toISOString());
    } finally {
      isSyncing = false;
    }
  }, [setLastSync]);

  const syncNow = useCallback(async () => {
    if (!clientId) return;
    if (!isSignedIn()) {
      try {
        await initGoogleDrive(clientId);
        await signIn();
        setDriveUser(getUser());
      } catch {
        return;
      }
    }
    // Pull only — auto-push handles writing local edits to Drive
    isSyncing = true;
    try {
      await loadFromDrive();
      setLastSync(new Date().toISOString());
    } finally {
      isSyncing = false;
    }
  }, [clientId, setDriveUser, loadFromDrive, setLastSync]);

  // Initial auth + load
  useEffect(() => {
    if (!enabled || !clientId || driveInitialized) return;
    driveInitialized = true;
    initGoogleDrive(clientId).then(async () => {
      try {
        await signInSilent(clientId, driveUser?.email);
        setDriveUser(getUser());
        await loadFromDrive();
      } catch {
        initialLoadDone = true;
      }
    }).catch(() => { initialLoadDone = true; });
  }, [enabled, clientId, loadFromDrive, setDriveUser, driveUser]);

  // Debounced auto-push on any collection change
  useEffect(() => {
    console.log("[Drive] debounce effect — enabled:", enabled, "driveUser:", !!driveUser, "initialLoadDone:", initialLoadDone);
    if (!enabled || !driveUser || !initialLoadDone) return;
    const snapshot = {
      books, comics, videoGames, movies, music: music as unknown[],
      customTypes, customItems: customItems as Record<string, CustomItem[]>,
      version: 1 as const,
    };
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      pushToDrive(snapshot);
    }, 2000);
    return () => { if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; } };
  }, [books, comics, videoGames, movies, music, customTypes, customItems, enabled, driveUser, pushToDrive]);

  // Poll every 30s to pick up changes from other browsers
  useEffect(() => {
    if (!enabled || !driveUser) {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      return;
    }
    if (pollTimer) return;
    pollTimer = setInterval(() => {
      if (!isSyncing && !debounceTimer) loadFromDrive();
    }, 30000);
    return () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } };
  }, [enabled, driveUser, loadFromDrive]);

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
    initialLoadDone = false;
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }, [setEnabled, setDriveUser]);

  return { syncNow, connect, disconnect, user: driveUser, lastSync, enabled, signedIn: isSignedIn() };
}
