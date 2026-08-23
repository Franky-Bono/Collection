import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  PasswordInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconDownload, IconPlus, IconRefresh, IconTrash, IconUpload } from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";
import { exportJSON, importJSON } from "@/storage";
import { useAtom, useAtomValue } from "jotai";
import { booksAtom, comicsAtom, moviesAtom, musicAtom, videoGamesAtom, languageAtom, colorSchemeAtom, customTypesAtom, customItemsAtom, driveClientIdAtom, driveSyncStatusAtom, driveLastSyncAtom, appPasswordHashAtom, thousandSeparatorAtom, dateFormatAtom, drivePendingAtom, subCollectionsAtom, subCollectionItemsAtom } from "@/state/atoms";
import type { CollectionData, CustomCollectionType } from "@/types";
import { useT } from "@/i18n/useT";
import type { Language } from "@/i18n/translations";
import { useState } from "react";
import { NewCollectionTypeModal } from "@/components/collection/NewCollectionTypeModal";
import { useNavigate } from "@tanstack/react-router";
import { useDriveSync } from "@/hooks/useDriveSync";
import { formatDate } from "@/hooks/useFormatting";
import dayjs from "dayjs";

export function SettingsPage() {
  const t = useT();
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [, setColorSchemeAtom] = useAtom(colorSchemeAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  const [thousandSep, setThousandSep] = useAtom(thousandSeparatorAtom);
  const [dateFormat, setDateFormat] = useAtom(dateFormatAtom);
  const [, setBooks] = useAtom(booksAtom);
  const [, setComics] = useAtom(comicsAtom);
  const [, setVideoGames] = useAtom(videoGamesAtom);
  const [, setMovies] = useAtom(moviesAtom);
  const [, setMusic] = useAtom(musicAtom);
  const [subCollections, setSubCollections] = useAtom(subCollectionsAtom);
  const [subCollectionItems, setSubCollectionItems] = useAtom(subCollectionItemsAtom);
  const [customTypes, setCustomTypes] = useAtom(customTypesAtom);
  const [, setCustomItems] = useAtom(customItemsAtom);
  const [newTypeOpen, setNewTypeOpen] = useState(false);
  const [deleteAllTarget, setDeleteAllTarget] = useState<string | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState("");

  const topLevelOptions = [
    { value: "books",      label: t("nav_books"),     group: "Collections" },
    { value: "comics",     label: t("nav_comics"),     group: "Collections" },
    { value: "videogames", label: t("nav_videogames"), group: "Collections" },
    { value: "movies",     label: t("nav_movies"),     group: "Collections" },
    { value: "music",      label: t("nav_music"),      group: "Collections" },
  ];
  const subCollectionOptions = subCollections.map((s) => ({
    value: s.id,
    label: s.name,
    group: "Sub-collections",
  }));
  const allSelectOptions = [...topLevelOptions, ...subCollectionOptions];

  const handleDeleteAll = () => {
    if (deleteAllTarget === "books")           setBooks([]);
    else if (deleteAllTarget === "comics")     setComics([]);
    else if (deleteAllTarget === "videogames") setVideoGames([]);
    else if (deleteAllTarget === "movies")     setMovies([]);
    else if (deleteAllTarget === "music")      setMusic([]);
    else {
      const newItems = { ...subCollectionItems };
      delete newItems[deleteAllTarget!];
      setSubCollectionItems(newItems);
      setSubCollections(subCollections.filter((s) => s.id !== deleteAllTarget));
    }
    const label = allSelectOptions.find((c) => c.value === deleteAllTarget)?.label ?? "";
    notifications.show({ message: `All ${label} deleted.`, color: "red" });
    setDeleteAllTarget(null);
    setDeleteAllConfirm("");
  };
  const [connectingDrive, setConnectingDrive] = useState(false);
  const [passwordHash, setPasswordHash] = useAtom(appPasswordHashAtom);
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [clientId, setClientId] = useAtom(driveClientIdAtom);
  const [draftClientId, setDraftClientId] = useState(clientId);
  const syncStatus = useAtomValue(driveSyncStatusAtom);
  const lastSync = useAtomValue(driveLastSyncAtom);
  const hasPending = useAtomValue(drivePendingAtom);
  const { connect, disconnect, syncNow, user: driveUser, enabled: driveEnabled, signedIn: driveSignedIn } = useDriveSync();

  const handleNewType = (type: CustomCollectionType) => {
    setCustomTypes([...customTypes, type]);
    setNewTypeOpen(false);
    navigate({ to: `/custom/${type.id}` });
  };

  const handleDeleteCustomType = (id: string) => {
    setCustomTypes(customTypes.filter((t) => t.id !== id));
    setCustomItems((prev) => { const next = { ...prev }; delete next[id]; return next; });
  };

  const handleConnect = async () => {
    if (!draftClientId.trim()) {
      notifications.show({ message: t("settings_drive_no_client_id"), color: "red" });
      return;
    }
    setConnectingDrive(true);
    setClientId(draftClientId.trim());
    try {
      await connect(draftClientId.trim());
      notifications.show({ message: t("settings_drive_connect_success"), color: "green" });
    } catch (e) {
      notifications.show({ message: `${t("settings_drive_connect_fail")} ${String(e)}`, color: "red" });
    } finally {
      setConnectingDrive(false);
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword.trim()) return;
    const enc = new TextEncoder().encode(newPassword);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const hash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    setPasswordHash(hash);
    setNewPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
    notifications.show({ message: t("settings_password_set_success"), color: "green" });
  };

  const handleRemovePassword = () => {
    setPasswordHash("");
    notifications.show({ message: t("settings_password_removed"), color: "blue" });
  };

  const handleExport = async () => {
    await exportJSON();
    notifications.show({ message: t("settings_export_success"), color: "green" });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const data = await importJSON(file);
        if (Array.isArray(data.books))      setBooks(data.books);
        if (Array.isArray(data.comics))     setComics(data.comics);
        if (Array.isArray(data.videoGames)) setVideoGames(data.videoGames);
        if (Array.isArray(data.movies))     setMovies(data.movies);
        if (Array.isArray((data as {music?: unknown}).music)) setMusic((data as unknown as {music: never}).music);
        if (Array.isArray(data.customTypes)) setCustomTypes(data.customTypes);
        if (data.customItems && typeof data.customItems === "object" && !Array.isArray(data.customItems))
          setCustomItems(data.customItems as Record<string, never>);
        notifications.show({ message: t("settings_import_success"), color: "green" });
      } catch {
        notifications.show({ message: t("settings_import_error"), color: "red" });
      }
    };
    input.click();
  };

  return (
    <Box p="xl" style={{ maxWidth: 600 }}>
      <Title order={2} mb="xl">{t("settings_title")}</Title>

      <Stack gap="lg">
        {/* Appearance */}
        <Card withBorder>
          <Text fw={600} mb="md">{t("settings_appearance")}</Text>
          <Stack gap="md">
            <Group justify="space-between">
              <Stack gap={2}>
                <Text size="sm">{t("settings_dark_mode")}</Text>
                <Text size="xs" c="dimmed">{t("settings_dark_mode_hint")}</Text>
              </Stack>
              <Switch
                checked={colorScheme === "dark"}
                onChange={() => { toggleColorScheme(); setColorSchemeAtom(colorScheme === "dark" ? "light" : "dark"); }}
                size="md"
              />
            </Group>
            <Divider />
            <Group justify="space-between">
              <Stack gap={2}>
                <Text size="sm">{t("settings_language")}</Text>
                <Text size="xs" c="dimmed">{t("settings_language_hint")}</Text>
              </Stack>
              <Select
                value={language}
                onChange={(v) => v && setLanguage(v as Language)}
                data={[
                  { value: "en", label: "English" },
                  { value: "fr", label: "Français" },
                ]}
                style={{ width: 140 }}
              />
            </Group>
            <Divider />
            <Group justify="space-between">
              <Stack gap={2}>
                <Text size="sm">{t("settings_thousand_sep")}</Text>
                <Text size="xs" c="dimmed">{t("settings_thousand_sep_hint")}</Text>
              </Stack>
              <SegmentedControl
                value={thousandSep}
                onChange={(v) => setThousandSep(v as "," | "." | "")}
                data={[
                  { value: ",", label: "1,000" },
                  { value: ".", label: "1.000" },
                  { value: "", label: "1000" },
                ]}
              />
            </Group>
            <Divider />
            <Group justify="space-between">
              <Stack gap={2}>
                <Text size="sm">{t("settings_date_format")}</Text>
                <Text size="xs" c="dimmed">{t("settings_date_format_hint")}</Text>
              </Stack>
              <SegmentedControl
                value={dateFormat}
                onChange={(v) => setDateFormat(v as "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD")}
                data={[
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                ]}
              />
            </Group>
          </Stack>
        </Card>

        {/* Password protection */}
        <Card withBorder>
          <Text fw={600} mb="xs">{t("settings_password_title")}</Text>
          <Text size="xs" c="dimmed" mb="md">{t("settings_password_hint")}</Text>
          <Stack gap="sm">
            {passwordHash && (
              <Group justify="space-between">
                <Text size="sm" c="green">{t("settings_password_set")}</Text>
                <Button size="xs" color="red" variant="subtle" onClick={handleRemovePassword}>
                  {t("settings_password_remove")}
                </Button>
              </Group>
            )}
            <PasswordInput
              placeholder={passwordHash ? t("settings_password_placeholder_change") : t("settings_password_placeholder_new")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
            />
            <Button
              variant="default"
              style={{ alignSelf: "flex-start" }}
              onClick={handleSetPassword}
              disabled={!newPassword.trim()}
              color={passwordSaved ? "green" : undefined}
            >
              {passwordSaved ? t("settings_password_saved") : passwordHash ? t("settings_password_change") : t("settings_password_save")}
            </Button>
          </Stack>
        </Card>

        {/* Custom collections */}
        <Card withBorder>
          <Text fw={600} mb="xs">{t("nav_custom_section")}</Text>
          <Text size="xs" c="dimmed" mb="md">{t("new_type_fields_hint")}</Text>
          <Stack gap="xs" mb="sm">
            {customTypes.map((ct) => (
              <Group key={ct.id} justify="space-between">
                <Text size="sm">{ct.name}</Text>
                <Button
                  size="xs"
                  color="red"
                  variant="subtle"
                  leftSection={<IconTrash size={13} />}
                  onClick={() => handleDeleteCustomType(ct.id)}
                >
                  {t("delete_confirm")}
                </Button>
              </Group>
            ))}
            {customTypes.length === 0 && (
              <Text size="xs" c="dimmed">{t("dashboard_no_items")}</Text>
            )}
          </Stack>
          <Button
            variant="default"
            leftSection={<IconPlus size={16} />}
            onClick={() => setNewTypeOpen(true)}
          >
            {t("nav_new_collection")}
          </Button>
        </Card>

        {/* Google Drive Sync */}
        <Card withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={600}>{t("settings_drive_title")}</Text>
            {driveEnabled && (
              <Badge color={syncStatus === "syncing" ? "blue" : syncStatus === "error" ? "red" : "green"} variant="light">
                {syncStatus === "syncing" ? t("settings_drive_syncing") : syncStatus === "error" ? t("settings_drive_error") : t("settings_drive_connected")}
              </Badge>
            )}
          </Group>

          {!driveEnabled ? (
            <Stack gap="sm">
              <Text size="xs" c="dimmed">{t("settings_drive_hint")}</Text>
              <Text size="xs" c="dimmed">{t("settings_drive_setup")}</Text>
              <TextInput
                placeholder={t("settings_drive_client_placeholder")}
                value={draftClientId}
                onChange={(e) => setDraftClientId(e.currentTarget.value)}
                size="sm"
              />
              <Button onClick={handleConnect} loading={connectingDrive} style={{ alignSelf: "flex-start" }}>
                {t("settings_drive_connect")}
              </Button>
            </Stack>
          ) : (
            <Stack gap="sm">
              <Group justify="space-between">
                <Stack gap={2}>
                  <Text size="sm" fw={500}>{driveUser?.email ?? t("settings_drive_connected")}</Text>
                  <Text size="xs" c="dimmed">
                    {lastSync ? `${t("settings_drive_last_sync")} ${formatDate(lastSync, dateFormat)} ${dayjs(lastSync).format("HH:mm:ss")}` : t("settings_drive_not_synced")}
                  </Text>
                </Stack>
                <Group gap="xs">
                  <Button size="xs" variant="default" leftSection={<IconRefresh size={13} />} onClick={syncNow} loading={syncStatus === "syncing"}>
                    {t("settings_drive_sync_now")}
                  </Button>
                  <Button size="xs" color="red" variant="subtle" onClick={disconnect}>
                    {t("settings_drive_disconnect")}
                  </Button>
                </Group>
              </Group>
              {!driveSignedIn && (
                <Alert icon={<IconAlertCircle size={14} />} color="yellow" variant="light" p="xs">
                  <Text size="xs">Session expired — click Sync Now to re-authenticate and load latest data.</Text>
                </Alert>
              )}
              {driveSignedIn && hasPending && (
                <Alert icon={<IconAlertCircle size={14} />} color="orange" variant="light" p="xs">
                  <Text size="xs">Unsaved changes — click Sync Now to push your edits to Google Drive.</Text>
                </Alert>
              )}
              <Text size="xs" c="dimmed">{t("settings_drive_auto_hint")}</Text>
            </Stack>
          )}
        </Card>

        {/* Data */}
        <Card withBorder>
          <Text fw={600} mb="xs">{t("settings_data")}</Text>
          <Text size="xs" c="dimmed" mb="md">{t("settings_data_hint")}</Text>
          <Divider mb="md" />
          <Stack gap="sm">
            <Group justify="space-between">
              <Stack gap={2}>
                <Text size="sm">{t("settings_export_label")}</Text>
                <Text size="xs" c="dimmed">{t("settings_export_hint")}</Text>
              </Stack>
              <Button variant="default" leftSection={<IconDownload size={16} />} onClick={handleExport}>
                {t("settings_export")}
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Danger zone */}
        <Card withBorder style={{ borderColor: "var(--mantine-color-red-7)" }}>
          <Text fw={600} mb="xs" c="red">{t("settings_danger_title")}</Text>
          <Text size="xs" c="dimmed" mb="md">{t("settings_danger_hint")}</Text>
          <Divider mb="md" />
          <Group justify="space-between">
            <Stack gap={2}>
              <Text size="sm">{t("settings_danger_delete_label")}</Text>
              <Text size="xs" c="dimmed">{t("settings_danger_delete_hint")}</Text>
            </Stack>
            <Select
              placeholder={t("settings_danger_placeholder")}
              data={allSelectOptions}
              value={deleteAllTarget}
              onChange={(v) => { setDeleteAllTarget(v); setDeleteAllConfirm(""); }}
              style={{ width: 180 }}
            />
          </Group>
        </Card>

        {/* Import */}
        <Card withBorder>
          <Group justify="space-between">
            <Stack gap={2}>
              <Text fw={600}>{t("settings_import_label")}</Text>
              <Text size="xs" c="dimmed">{t("settings_import_hint")}</Text>
            </Stack>
            <Button variant="default" leftSection={<IconUpload size={16} />} onClick={handleImport}>
              {t("settings_import")}
            </Button>
          </Group>
        </Card>
      </Stack>

      {/* Delete-all confirmation modal */}
      <Modal
        opened={!!deleteAllTarget}
        onClose={() => { setDeleteAllTarget(null); setDeleteAllConfirm(""); }}
        title={<Text fw={700} c="red">{t("settings_danger_modal_title", { collection: allSelectOptions.find((c) => c.value === deleteAllTarget)?.label ?? "" })}</Text>}
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            {t("settings_danger_modal_body", { collection: allSelectOptions.find((c) => c.value === deleteAllTarget)?.label ?? "" })}
          </Text>
          <Text size="sm">{t("settings_danger_modal_confirm_prompt")}</Text>
          <TextInput
            placeholder={t("settings_danger_modal_confirm_word")}
            value={deleteAllConfirm}
            onChange={(e) => setDeleteAllConfirm(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => { setDeleteAllTarget(null); setDeleteAllConfirm(""); }}>
              {t("settings_danger_cancel")}
            </Button>
            <Button
              color="red"
              disabled={deleteAllConfirm !== t("settings_danger_modal_confirm_word")}
              onClick={handleDeleteAll}
            >
              {t("settings_danger_delete_all")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <NewCollectionTypeModal
        opened={newTypeOpen}
        onClose={() => setNewTypeOpen(false)}
        onSubmit={handleNewType}
      />
    </Box>
  );
}
