import { Box, Button, Card, Group, Image, Loader, Modal, Stack, Tabs, Text, TextInput } from "@mantine/core";
import { useState } from "react";
import { useT } from "@/i18n/useT";
import type { AnyItem } from "@/types";

type CollectionKind = "books" | "comics" | "videogames" | "movies" | "music";

interface LookupResult {
  title: string;
  author?: string;
  artist?: string;
  director?: string;
  studio?: string;
  editor?: string;
  year?: number;
  genre?: string;
  coverUrl?: string;
  format?: string;
  publisher?: string;
  label?: string;
  duration?: string;
  country?: string;
}

interface Props {
  kind: CollectionKind;
  opened: boolean;
  onClose: () => void;
  onAdd: (item: Partial<AnyItem>) => void;
}

async function searchBooks(query: string): Promise<LookupResult[]> {
  const resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
  const data = await resp.json() as { docs: Array<{ title: string; author_name?: string[]; first_publish_year?: number; subject?: string[]; cover_i?: number }> };
  return data.docs.map((d) => ({
    title: d.title,
    author: d.author_name?.[0],
    year: d.first_publish_year,
    genre: d.subject?.[0],
    coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : undefined,
  }));
}

async function searchBooksByISBN(isbn: string): Promise<LookupResult[]> {
  const resp = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
  const data = await resp.json() as Record<string, { title: string; authors?: Array<{ name: string }>; publish_date?: string; cover?: { medium: string }; publishers?: Array<{ name: string }> }>;
  const key = `ISBN:${isbn}`;
  if (!data[key]) return [];
  const b = data[key];
  return [{
    title: b.title,
    author: b.authors?.[0]?.name,
    year: b.publish_date ? parseInt(b.publish_date) : undefined,
    coverUrl: b.cover?.medium,
    publisher: b.publishers?.[0]?.name,
  }];
}

async function searchMovies(query: string): Promise<LookupResult[]> {
  const resp = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=trilogy`);
  const data = await resp.json() as { Search?: Array<{ Title: string; Year: string; Poster: string; imdbID: string }> };
  if (!data.Search) return [];
  return data.Search.map((m) => ({
    title: m.Title,
    year: parseInt(m.Year),
    coverUrl: m.Poster !== "N/A" ? m.Poster : undefined,
  }));
}

async function searchMusic(query: string): Promise<LookupResult[]> {
  const resp = await fetch(`https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=10`);
  const data = await resp.json() as { releases?: Array<{ title: string; date?: string; "artist-credit"?: Array<{ name: string }>; "label-info"?: Array<{ label?: { name: string } }> }> };
  if (!data.releases) return [];
  return data.releases.map((r) => ({
    title: r.title,
    artist: r["artist-credit"]?.[0]?.name,
    year: r.date ? parseInt(r.date) : undefined,
    label: r["label-info"]?.[0]?.label?.name,
  }));
}

async function searchMusicByBarcode(barcode: string): Promise<LookupResult[]> {
  const resp = await fetch(`https://musicbrainz.org/ws/2/release/?query=barcode:${barcode}&fmt=json&limit=5`);
  const data = await resp.json() as { releases?: Array<{ title: string; date?: string; "artist-credit"?: Array<{ name: string }> }> };
  if (!data.releases) return [];
  return data.releases.map((r) => ({
    title: r.title,
    artist: r["artist-credit"]?.[0]?.name,
    year: r.date ? parseInt(r.date) : undefined,
  }));
}

export function LookupModal({ kind, opened, onClose, onAdd }: Props) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LookupResult[]>([]);
  const [activeTab, setActiveTab] = useState<string>("title");
  const [error, setError] = useState<string | null>(null);

  const titlePlaceholderKey = `lookup_placeholder_${kind}_title` as const;
  const barcodePlaceholderKey = `lookup_placeholder_${kind}_barcode` as const;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      let res: LookupResult[] = [];
      if (activeTab === "title") {
        if (kind === "books" || kind === "comics") res = await searchBooks(query);
        else if (kind === "movies")     res = await searchMovies(query);
        else if (kind === "music")      res = await searchMusic(query);
        else res = [];
      } else {
        if (kind === "books" || kind === "comics") res = await searchBooksByISBN(query);
        else if (kind === "music")      res = await searchMusicByBarcode(query);
        else res = [];
      }
      setResults(res);
      if (res.length === 0) setError(t("lookup_no_results"));
    } catch {
      setError(t("lookup_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (r: LookupResult) => {
    onAdd(r as Partial<AnyItem>);
    setQuery("");
    setResults([]);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={() => { setQuery(""); setResults([]); onClose(); }} title={t("lookup_title")} size="lg">
      <Tabs value={activeTab} onChange={(v) => { setActiveTab(v ?? "title"); setResults([]); setQuery(""); }}>
        <Tabs.List mb="md">
          <Tabs.Tab value="title">{t("lookup_tab_title")}</Tabs.Tab>
          <Tabs.Tab value="barcode">{t("lookup_tab_barcode")}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={activeTab}>
          <Text size="xs" c="dimmed" mb="sm">
            {activeTab === "title" ? t("lookup_hint_title") : t("lookup_hint_barcode")}
          </Text>
          <Group mb="md">
            <TextInput
              placeholder={activeTab === "title" ? t(titlePlaceholderKey) : t(barcodePlaceholderKey)}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ flex: 1 }}
            />
            <Button onClick={handleSearch} loading={loading}>{loading ? t("lookup_searching") : t("lookup_search")}</Button>
          </Group>
        </Tabs.Panel>
      </Tabs>

      {error && <Text size="sm" c="dimmed" ta="center" py="md">{error}</Text>}

      {results.length > 0 && (
        <Text size="xs" c="dimmed" mb="sm">
          {results.length === 1 ? t("lookup_results", { count: results.length }) : t("lookup_results_plural", { count: results.length })}
        </Text>
      )}

      <Stack gap="xs">
        {loading && <Box ta="center" py="xl"><Loader size="sm" /></Box>}
        {results.map((r, i) => (
          <Card key={i} withBorder p="sm">
            <Group>
              {r.coverUrl && <Image src={r.coverUrl} h={60} w={40} fit="cover" radius="sm" />}
              <Box style={{ flex: 1 }}>
                <Text size="sm" fw={500}>{r.title}</Text>
                <Text size="xs" c="dimmed">{[r.author ?? r.artist ?? r.director, r.year].filter(Boolean).join(" · ")}</Text>
              </Box>
              <Button size="xs" onClick={() => handleAdd(r)}>{t("lookup_add")}</Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </Modal>
  );
}
