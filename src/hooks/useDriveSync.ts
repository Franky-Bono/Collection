import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useCallback } from "react";
import {
  booksAtom, comicsAtom, videoGamesAtom, moviesAtom, musicAtom,
  customTypesAtom, customItemsAtom, driveLoadDoneAtom,
  driveClientIdAtom, driveSyncEnabledAtom, driveLastSyncAtom,
  driveSyncStatusAtom, driveUserAtom, drivePendingAtom,
} from "@/state/atoms";
import {
  initGoogleDrive, signIn, signInSilent, signOut, isSignedIn, getUser,
  readFromDrive, writeToDrive, deleteAllDriveFiles, setStatusListener,
} from "@/lib/driveSync";
import type { CollectionData, CustomItem } from "@/types";

type Snapshot = CollectionData & { music: unknown[]; customItems: Record<string, CustomItem[]> };

// Module-level singletons shared across all hook instances
let driveInitialized = false;
let isSyncing = false;
let isLoadingFromDrive = false; // suppresses debounce push during Drive reads
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pendingSnapshot: Snapshot | null = null; // queued push waiting for auth

export function useDriveSync() {
  const clientId       = useAtomValue(driveClientIdAtom);
  const [enabled, setEnabled] = useAtom(driveSyncEnabledAtom);
  const [, setLastSync]  = useAtom(driveLastSyncAtom);
  const setStatus        = useSetAtom(driveSyncStatusAtom);
  const [driveUser, setDriveUser] = useAtom(driveUserAtom);
  const lastSync         = useAtomValue(driveLastSyncAtom);
  const setPending       = useSetAtom(drivePendingAtom);

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
  const idbReady      = true; // atoms are pre-hydrated from IDB before React mounts
  const [driveLoadDone, setDriveLoadDone] = useAtom(driveLoadDoneAtom);

  useEffect(() => {
    setStatusListener((s) => {
      setStatus(s);
      if (s === "idle") setLastSync(new Date().toISOString());
    });
  }, [setStatus, setLastSync]);

  const loadFromDrive = useCallback(async () => {
    isLoadingFromDrive = true;
    const data = await readFromDrive();
    if (!data) { isLoadingFromDrive = false; setDriveLoadDone(true); return; }
    if (Array.isArray(data.books))      setBooks(data.books);
    if (Array.isArray(data.comics))     setComics(data.comics);
    if (Array.isArray(data.videoGames)) setVideoGames(data.videoGames);
    if (Array.isArray(data.movies))     setMovies(data.movies);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (Array.isArray((data as any).music)) setMusic((data as any).music);
    if (Array.isArray(data.customTypes)) setCustomTypes(data.customTypes);
    if (data.customItems && typeof data.customItems === "object") setCustomItems(data.customItems as Record<string, CustomItem[]>);
    setLastSync(new Date().toISOString());
    setDriveLoadDone(true);
    // Clear flag after React has flushed the atom updates
    setTimeout(() => { isLoadingFromDrive = false; }, 100);
  }, [setBooks, setComics, setVideoGames, setMovies, setMusic, setCustomTypes, setCustomItems, setLastSync, setDriveLoadDone]);

  const pushToDrive = useCallback(async (snapshot: Snapshot) => {
    if (!isSignedIn()) {
      pendingSnapshot = snapshot;
      setPending(true);
      return;
    }
    isSyncing = true;
    try {
      await writeToDrive(snapshot);
      pendingSnapshot = null;
      setPending(false);
      setLastSync(new Date().toISOString());
    } catch {
      // push failed silently — will retry on next Sync Now
    } finally {
      isSyncing = false;
    }
  }, [setLastSync, setPending]);

  // syncNow: re-auth if needed (user gesture = no popup block), flush pending push, then pull
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
    isSyncing = true;
    try {
      if (pendingSnapshot) {
        await writeToDrive(pendingSnapshot);
        pendingSnapshot = null;
        setPending(false);
      }
      await loadFromDrive();
      setLastSync(new Date().toISOString());
    } finally {
      isSyncing = false;
    }
  }, [clientId, setDriveUser, loadFromDrive, setLastSync, setPending]);

  // Initial auth + load
  useEffect(() => {
    if (!enabled || !clientId || driveInitialized) {
      if (!enabled || !clientId) setDriveLoadDone(true);
      return;
    }
    driveInitialized = true;
    initGoogleDrive(clientId).then(async () => {
      try {
        await signInSilent(clientId, driveUser?.email);
        setDriveUser(getUser());
        await loadFromDrive();
      } catch {
        setDriveLoadDone(true);
      }
    }).catch(() => { setDriveLoadDone(true); });
  }, [enabled, clientId, loadFromDrive, setDriveUser, driveUser, setDriveLoadDone]);

  // Debounced auto-push on any collection change
  useEffect(() => {
    if (!enabled || !driveUser || !driveLoadDone || isLoadingFromDrive || !idbReady) return;
    const snapshot: Snapshot = {
      books, comics, videoGames, movies, music: music as unknown[],
      customTypes, customItems: customItems as Record<string, CustomItem[]>,
      version: 1,
    };
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      pushToDrive(snapshot);
    }, 2000);
    return () => { if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; } };
  }, [books, comics, videoGames, movies, music, customTypes, customItems, enabled, driveUser, driveLoadDone, pushToDrive]);

  // Poll every 30s to pick up changes from other browsers
  useEffect(() => {
    if (!enabled || !driveUser) {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      return;
    }
    if (pollTimer) return;
    pollTimer = setInterval(() => {
      if (isSignedIn() && !isSyncing && !debounceTimer && !pendingSnapshot) loadFromDrive();
    }, 30000);
    return () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } };
  }, [enabled, driveUser, loadFromDrive]);

  const resetDriveFile = useCallback(async () => {
    if (!clientId) return;
    if (!isSignedIn()) {
      await initGoogleDrive(clientId);
      await signIn();
      setDriveUser(getUser());
    }
    await deleteAllDriveFiles();
    const snapshot: Snapshot = {
      books, comics, videoGames, movies, music: music as unknown[],
      customTypes, customItems: customItems as Record<string, CustomItem[]>,
      version: 1,
    };
    await writeToDrive(snapshot);
    setPending(false);
    setLastSync(new Date().toISOString());
  }, [clientId, setDriveUser, books, comics, videoGames, movies, music, customTypes, customItems, setPending, setLastSync]);

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
    setDriveLoadDone(false);
    driveInitialized = false;
    isLoadingFromDrive = false;
    pendingSnapshot = null;
    setPending(false);
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }, [setEnabled, setDriveUser, setDriveLoadDone]);

  return { syncNow, connect, disconnect, resetDriveFile, user: driveUser, lastSync, enabled, signedIn: isSignedIn() };
}
