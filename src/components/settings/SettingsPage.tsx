import {
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
import { IconDownload, IconPlus, IconRefresh, IconTrash, IconUpload } from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";
import { exportJSON, importJSON } from "@/storage";
import { useAtom, useAtomValue } from "jotai";
import { booksAtom, comicsAtom, moviesAtom, musicAtom, videoGamesAtom, languageAtom, customTypesAtom, customItemsAtom, driveClientIdAtom, driveSyncStatusAtom, driveLastSyncAtom, appPasswordHashAtom, thousandSeparatorAtom, dateFormatAtom } from "@/state/atoms";
import type { CollectionData, CustomCollectionType } from "@/types";
import { useT } from "@/i18n/useT";
import type { Language } from "@/i18n/translations";
import { useState } from "react";
import { NewCollectionTypeModal } from "@/components/collection/NewCollectionTypeModal";
import { useNavigate } from "@tanstack/react-router";
import { useDriveSync } from "@/hooks/useDriveSync";
import { formatDate } from "@/hooks/useFormatting";

export function SettingsPage() {
  const t = useT();
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [language, setLanguage] = useAtom(languageAtom);
  const [thousandSep, setThousandSep] = useAtom(thousandSeparatorAtom);
  const [dateFormat, setDateFormat] = useAtom(dateFormatAtom);
  const [, setBooks] = useAtom(booksAtom);
  const [, setComics] = useAtom(comicsAtom);
  const [, setVideoGames] = useAtom(videoGamesAtom);
  const [, setMovies] = useAtom(moviesAtom);
  const [, setMusic] = useAtom(musicAtom);
  const [customTypes, setCustomTypes] = useAtom(customTypesAtom);
  const [, setCustomItems] = useAtom(customItemsAtom);
  const [newTypeOpen, setNewTypeOpen] = useState(false);
  const [deleteAllTarget, setDeleteAllTarget] = useState<string | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState("");

  const COLLECTIONS = [
    { value: "books",      label: t("nav_books") },
    { value: "comics",     label: t("nav_comics") },
    { value: "videogames", label: t("nav_videogames") },
    { value: "movies",     label: t("nav_movies") },
    { value: "music",      label: t("nav_music") },
  ];

  const handleDeleteAll = () => {
    if (deleteAllTarget === "books")      setBooks([]);
    if (deleteAllTarget === "comics")     setComics([]);
    if (deleteAllTarget === "videogames") setVideoGames([]);
    if (deleteAllTarget === "movies")     setMovies([]);
    if (deleteAllTarget === "music")      setMusic([]);
    notifications.show({ message: `All ${COLLECTIONS.find(c => c.value === deleteAllTarget)?.label} deleted.`, color: "red" });
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
  const { connect, disconnect, syncNow, user: driveUser, enabled: driveEnabled } = useDriveSync();

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

  const handleExport = () => {
    exportJSON();
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
        const data: CollectionData = await importJSON(file);
        setBooks(data.books);
        setComics(data.comics);
        setVideoGames(data.videoGames);
        setMovies(data.movies);
        if ((data as CollectionData & { music?: typeof data.books }).music) {
          setMusic((data as CollectionData & { music: typeof data.books }).music as never);
        }
        notifications.show({ message: t("settings_import_success"), color: "green" });
        window.location.reload();
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
                onChange={() => toggleColorScheme()}
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
                    {lastSync ? `${t("settings_drive_last_sync")} ${formatDate(lastSync, dateFormat)}` : t("settings_drive_not_synced")}
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
            <Divider />
            <Group justify="space-between">
              <Stack gap={2}>
                <Text size="sm">{t("settings_import_label")}</Text>
                <Text size="xs" c="dimmed">{t("settings_import_hint")}</Text>
              </Stack>
              <Button variant="default" leftSection={<IconUpload size={16} />} onClick={handleImport}>
                {t("settings_import")}
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
              data={COLLECTIONS}
              value={deleteAllTarget}
              onChange={(v) => { setDeleteAllTarget(v); setDeleteAllConfirm(""); }}
              style={{ width: 180 }}
            />
          </Group>
        </Card>
      </Stack>

      {/* Delete-all confirmation modal */}
      <Modal
        opened={!!deleteAllTarget}
        onClose={() => { setDeleteAllTarget(null); setDeleteAllConfirm(""); }}
        title={<Text fw={700} c="red">{t("settings_danger_modal_title", { collection: COLLECTIONS.find(c => c.value === deleteAllTarget)?.label ?? "" })}</Text>}
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            {t("settings_danger_modal_body", { collection: COLLECTIONS.find(c => c.value === deleteAllTarget)?.label ?? "" })}
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
