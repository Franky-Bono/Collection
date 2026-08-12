import { Box, Button, Card, Group, Select, Stack, Table, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { booksAtom, comicsAtom, moviesAtom, musicAtom, videoGamesAtom } from "@/state/atoms";
import { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { notifications } from "@mantine/notifications";
import { useT } from "@/i18n/useT";
import { useFormatting } from "@/hooks/useFormatting";
import type { Book, Comic, VideoGame, Movie, MusicAlbum } from "@/types";

export const Route = createFileRoute("/import")({
  component: ImportPage,
});

import type { TranslationKey } from "@/i18n/translations";

type CollectionKind = "books" | "comics" | "videogames" | "movies" | "music";

const FIELD_LABEL_KEY: Record<string, TranslationKey> = {  title:     "col_title",
  author:    "col_author",
  artist:    "col_artist",
  editor:    "col_editor",
  studio:    "col_studio",
  director:  "col_director",
  genre:     "col_genre",
  country:   "col_country",
  quality:   "col_quality",
  edition:   "col_edition",
  year:      "col_year",
  status:    "col_status",
  rating:    "col_rating",
  format:    "col_format",
  platform:  "col_platform",
  series:    "col_series",
  issue:     "col_issue",
  publisher: "col_publisher",
  condition: "col_condition",
  label:     "col_label",
  pages:     "col_pages",
  duration:  "col_duration",
  location:  "col_location",
  notes:     "col_notes",
  language:  "col_language",
};

const FIELD_OPTIONS: Record<CollectionKind, string[]> = {
  books:      ["title", "author", "genre", "year", "format", "language", "status", "rating", "notes", "edition", "pages", "publisher", "location"],
  comics:     ["title", "editor", "series", "issue", "genre", "year", "format", "status", "rating", "notes", "publisher", "condition", "location"],
  videogames: ["title", "studio", "genre", "year", "platform", "status", "rating", "notes", "location"],
  movies:     ["title", "director", "genre", "year", "duration", "format", "edition", "status", "rating", "notes", "quality", "country", "location"],
  music:      ["title", "artist", "genre", "year", "format", "status", "rating", "notes", "label", "duration", "location"],
};

function ImportPage() {
  const t = useT();
  const { formatNumber } = useFormatting();
  const [, setBooks] = useAtom(booksAtom);
  const [, setComics] = useAtom(comicsAtom);
  const [, setVideoGames] = useAtom(videoGamesAtom);
  const [, setMovies] = useAtom(moviesAtom);
  const [, setMusic] = useAtom(musicAtom);

  const [kind, setKind] = useState<CollectionKind>("movies");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [allRows, setAllRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const hdrs = result.meta.fields ?? [];
          setHeaders(hdrs);
          setAllRows(result.data);
          setRows(result.data.slice(0, 5));
          const auto: Record<string, string> = {};
          const fields = FIELD_OPTIONS[kind];
          hdrs.forEach((h) => {
            const match = fields.find((f) => f.toLowerCase() === h.toLowerCase());
            if (match) auto[h] = match;
          });
          setMapping(auto);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
        const data: Record<string, string>[] = raw.map((r) =>
          Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)]))
        );
        const hdrs = data.length > 0 ? Object.keys(data[0]) : [];
        setHeaders(hdrs);
        setAllRows(data);
        setRows(data.slice(0, 5));
        const auto: Record<string, string> = {};
        const fields = FIELD_OPTIONS[kind];
        hdrs.forEach((h) => {
          const match = fields.find((f) => f.toLowerCase() === h.toLowerCase());
          if (match) auto[h] = match;
        });
        setMapping(auto);
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleImport = () => {
    try {
      const makeItem = (row: Record<string, string>) => {
        const id = typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
        const item: Record<string, unknown> = { id, addedAt: new Date().toISOString() };
        Object.entries(mapping).forEach(([col, field]) => {
          if (field && row[col] !== undefined) {
            const val = row[col];
            if (field === "year" || field === "rating" || field === "pages" || field === "issue") {
              const n = parseInt(val);
              if (!isNaN(n)) item[field] = n;
            } else {
              item[field] = val;
            }
          }
        });
        return item;
      };

      const items = allRows.map(makeItem);
      if (kind === "books")      setBooks((prev) => [...prev, ...items as unknown as Book[]]);
      if (kind === "comics")     setComics((prev) => [...prev, ...items as unknown as Comic[]]);
      if (kind === "videogames") setVideoGames((prev) => [...prev, ...items as unknown as VideoGame[]]);
      if (kind === "movies")     setMovies((prev) => [...prev, ...items as unknown as Movie[]]);
      if (kind === "music")      setMusic((prev) => [...prev, ...items as unknown as MusicAlbum[]]);
      notifications.show({ message: t("import_success", { count: formatNumber(items.length) }), color: "green" });
      setHeaders([]); setRows([]); setAllRows([]); setMapping({});
    } catch (err) {
      if (String(err).includes("QuotaExceededError") || String(err).includes("exceeded the quota")) {
        notifications.show({ message: t("import_error_quota"), color: "red" });
      } else {
        notifications.show({ message: String(err), color: "red" });
      }
    }
  };

  return (
    <Box p="xl">
      <Title order={2} mb="xl">{t("nav_import")}</Title>
      <Stack gap="lg" style={{ maxWidth: 700 }}>
        <Card withBorder>
          <Stack gap="sm">
            <Select
              label="Collection"
              value={kind}
              onChange={(v) => { setKind(v as CollectionKind); setHeaders([]); setRows([]); setAllRows([]); setMapping({}); }}
              data={[
                { value: "movies",     label: t("nav_movies") },
                { value: "books",      label: t("nav_books") },
                { value: "music",      label: t("nav_music") },
                { value: "comics",     label: t("nav_comics") },
                { value: "videogames", label: t("nav_videogames") },
              ]}
            />
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <Button variant="default" onClick={() => fileRef.current?.click()}>
              {t("import_choose_file")}
            </Button>
          </Stack>
        </Card>

        {headers.length > 0 && (
          <Card withBorder>
            <Text fw={600} mb="md">{t("import_map_columns")}</Text>
            <Stack gap="xs" style={{ overflowX: "auto" }}>
              {headers.map((h) => (
                <Group key={h}>
                  <Text size="sm" style={{ width: 160, flexShrink: 0 }}>{h}</Text>
                  <Select
                    size="xs"
                    value={mapping[h] ?? ""}
                    onChange={(v) => setMapping({ ...mapping, [h]: v ?? "" })}
                    data={[{ value: "", label: t("import_skip") }, ...FIELD_OPTIONS[kind].map((f) => {
                      const raw = FIELD_LABEL_KEY[f] ? t(FIELD_LABEL_KEY[f]) : f;
                      const label = raw.charAt(0).toUpperCase() + raw.slice(1);
                      return { value: f, label };
                    })]}
                    style={{ flex: 1 }}
                    clearable
                  />
                </Group>
              ))}
            </Stack>
          </Card>
        )}

        {rows.length > 0 && (
          <Card withBorder>
            <Text fw={600} mb="md">{t("import_preview", { count: formatNumber(rows.length) })}</Text>
            <Box style={{ overflowX: "auto" }}>
              <Table fz="xs">
                <Table.Thead>
                  <Table.Tr>{headers.map((h) => <Table.Th key={h}>{h}</Table.Th>)}</Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((row, i) => (
                    <Table.Tr key={i}>{headers.map((h) => <Table.Td key={h}>{row[h]}</Table.Td>)}</Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
            <Button mt="md" onClick={handleImport}>{t("import_btn", { count: formatNumber(allRows.length) })}</Button>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
