import type { CollectionData } from "@/types";

const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
const FILE_NAME = "collection-data.json";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

let _clientId = "";
let _accessToken = "";
let _user: { name: string; email: string } | null = null;
let _gapiReady = false;
let _fileId: string | null = null;

type StatusListener = (status: "idle" | "syncing" | "error", msg?: string) => void;
let _statusListener: StatusListener | null = null;

export function setStatusListener(fn: StatusListener) {
  _statusListener = fn;
}

function setStatus(s: "idle" | "syncing" | "error", msg?: string) {
  _statusListener?.(s, msg);
}

export async function initGoogleDrive(clientId: string): Promise<void> {
  _clientId = clientId;
  await Promise.all([
    loadScript("https://apis.google.com/js/api.js"),
    loadScript("https://accounts.google.com/gsi/client"),
  ]);

  await new Promise<void>((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as unknown as any).gapi.load("client", resolve);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (window as unknown as any).gapi.client.init({
    discoveryDocs: [DISCOVERY_DOC],
  });

  _gapiReady = true;
}

export function signIn(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!_clientId) { reject(new Error("No client ID configured")); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = (window as unknown as any).google.accounts.oauth2.initTokenClient({
      client_id: _clientId,
      scope: SCOPES,
      callback: (resp: { access_token?: string; error?: string }) => {
        if (resp.error) { reject(new Error(resp.error)); return; }
        _accessToken = resp.access_token ?? "";
        fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${_accessToken}`)
          .then((r) => r.json())
          .then((info: { email?: string; name?: string }) => {
            _user = { name: info.name ?? info.email ?? "Google User", email: info.email ?? "" };
            resolve();
          })
          .catch(() => { _user = { name: "Google User", email: "" }; resolve(); });
      },
    });

    client.requestAccessToken();
  });
}

export function signInSilent(clientId: string, hint?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = (window as unknown as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      prompt: "",
      login_hint: hint ?? "",
      callback: (resp: { access_token?: string; error?: string }) => {
        if (resp.error || !resp.access_token) { reject(new Error(resp.error ?? "silent auth failed")); return; }
        _accessToken = resp.access_token;
        fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${_accessToken}`)
          .then((r) => r.json())
          .then((info: { email?: string; name?: string }) => {
            _user = { name: info.name ?? info.email ?? "Google User", email: info.email ?? "" };
            resolve();
          })
          .catch(() => { _user = { name: "Google User", email: "" }; resolve(); });
      },
    });
    client.requestAccessToken();
  });
}

export async function deleteAllDriveFiles(): Promise<void> {
  if (!_accessToken) return;
  // List ALL files including non-appdata to find stale files
  const resp = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}'+and+trashed=false&fields=files(id,name,parents)`,
    { headers: { Authorization: `Bearer ${_accessToken}` } }
  );
  const data = await resp.json() as { files: { id: string; name: string; parents?: string[] }[] };
  console.log("[Drive] all matching files:", JSON.stringify(data.files));
  for (const file of data.files ?? []) {
    const del = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${_accessToken}` },
    });
    console.log("[Drive] deleted file:", file.id, "status:", del.status);
  }
  _fileId = null;
}

export function signOut(): void {
  if (_accessToken) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as unknown as any).google.accounts.oauth2.revoke(_accessToken, () => {});
  }
  _accessToken = "";
  _user = null;
  _fileId = null;
}

export function isSignedIn(): boolean {
  return !!_accessToken;
}

export function getUser(): { name: string; email: string } | null {
  return _user;
}

async function findFile(): Promise<string | null> {
  const resp = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id,name,size,modifiedTime)`,
    { headers: { Authorization: `Bearer ${_accessToken}` } }
  );
  const data = await resp.json() as { files: { id: string; size?: string; modifiedTime?: string }[] };
  console.log("[Drive] findFile results:", JSON.stringify(data.files));
  return data.files?.[0]?.id ?? null;
}

export async function readFromDrive(): Promise<(CollectionData & { customItems?: Record<string, unknown[]> }) | null> {
  if (!_accessToken || !_gapiReady) { console.log("[Drive] readFromDrive skipped: not signed in or GAPI not ready"); return null; }
  setStatus("syncing");
  try {
    _fileId = await findFile();
    if (!_fileId) { console.log("[Drive] readFromDrive: no file found"); setStatus("idle"); return null; }
    console.log("[Drive] reading fileId:", _fileId);
    const resp = await fetch(
      `https://www.googleapis.com/drive/v3/files/${_fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${_accessToken}` } }
    );
    if (!resp.ok) { setStatus("error", "Read failed"); return null; }
    const data = await resp.json() as CollectionData & { customItems?: Record<string, unknown[]> };
    setStatus("idle");
    return data;
  } catch (e) {
    setStatus("error", String(e));
    return null;
  }
}

export async function writeToDrive(data: CollectionData & { customItems?: Record<string, unknown[]> }): Promise<void> {
  if (!_accessToken || !_gapiReady) throw new Error("Not signed in or GAPI not ready");
  setStatus("syncing");
  const body = JSON.stringify(data);
  const blob = new Blob([body], { type: "application/json" });

  // Always re-lookup the file to avoid stale cached ID
  _fileId = await findFile();
  console.log("[Drive] writing to fileId:", _fileId, "size:", body.length);

  try {
    if (_fileId) {
      const resp = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${_fileId}?uploadType=media`,
        { method: "PATCH", headers: { Authorization: `Bearer ${_accessToken}`, "Content-Type": "application/json" }, body: blob }
      );
      if (!resp.ok) {
        _fileId = null;
        throw new Error(`PATCH failed: ${resp.status} ${await resp.text()}`);
      }
    } else {
      const meta = JSON.stringify({ name: FILE_NAME, mimeType: "application/json", parents: ["appDataFolder"] });
      const form = new FormData();
      form.append("metadata", new Blob([meta], { type: "application/json" }));
      form.append("file", blob);
      const resp = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        { method: "POST", headers: { Authorization: `Bearer ${_accessToken}` }, body: form }
      );
      if (!resp.ok) throw new Error(`POST failed: ${resp.status} ${await resp.text()}`);
      const created = await resp.json() as { id: string };
      _fileId = created.id;
    }
    setStatus("idle");
  } catch (e) {
    setStatus("error", String(e));
    throw e;
  }
}
