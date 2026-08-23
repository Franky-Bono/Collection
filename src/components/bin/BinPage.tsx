import { ActionIcon, Badge, Box, Button, Group, Stack, Table, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowBackUp, IconTrash } from "@tabler/icons-react";
import { useAtom, useAtomValue } from "jotai";
import {
  trashedItemsAtom,
  booksAtom,
  comicsAtom,
  videoGamesAtom,
  moviesAtom,
  musicAtom,
  customItemsAtom,
  customTypesAtom,
  subCollectionsAtom,
  subCollectionItemsAtom,
} from "@/state/atoms";
import type { TrashedEntry } from "@/state/atoms";
import type { AnyItem, Book, Comic, VideoGame, Movie, MusicAlbum, CustomItem } from "@/types";
import { useT } from "@/i18n/useT";
import { useFormatting } from "@/hooks/useFormatting";

export function BinPage() {
  const t = useT();
  const { formatDate } = useFormatting();

  const [trashed, setTrashed] = useAtom(trashedItemsAtom);
  const [books, setBooks] = useAtom(booksAtom);
  const [comics, setComics] = useAtom(comicsAtom);
  const [videoGames, setVideoGames] = useAtom(videoGamesAtom);
  const [movies, setMovies] = useAtom(moviesAtom);
  const [music, setMusic] = useAtom(musicAtom);
  const [customItems, setCustomItems] = useAtom(customItemsAtom);
  const customTypes = useAtomValue(customTypesAtom);
  const subCollections = useAtomValue(subCollectionsAtom);
  const [subCollectionItems, setSubCollectionItems] = useAtom(subCollectionItemsAtom);

  const kindLabel = (entry: TrashedEntry): string => {
    if (entry.subCollectionId) {
      const sub = subCollections.find((s) => s.id === entry.subCollectionId);
      return sub ? sub.name : entry.kind;
    }
    if (entry.typeId) {
      return customTypes.find((ct) => ct.id === entry.typeId)?.name ?? entry.kind;
    }
    const map: Record<string, string> = {
      books: t("nav_books"),
      comics: t("nav_comics"),
      videogames: t("nav_videogames"),
      movies: t("nav_movies"),
      music: t("nav_music"),
    };
    return map[entry.kind] ?? entry.kind;
  };

  const kindColor = (kind: string): string => {
    const map: Record<string, string> = {
      books: "blue", comics: "grape", videogames: "green",
      movies: "orange", music: "cyan",
    };
    return map[kind] ?? "gray";
  };

  const handleRestore = (entry: TrashedEntry) => {
    if (entry.subCollectionId) {
      const sid = entry.subCollectionId;
      setSubCollectionItems({
        ...subCollectionItems,
        [sid]: [...(subCollectionItems[sid] ?? []), entry.item as AnyItem],
      });
    } else {
      switch (entry.kind) {
        case "books":      setBooks([...books, entry.item as Book]); break;
        case "comics":     setComics([...comics, entry.item as Comic]); break;
        case "videogames": setVideoGames([...videoGames, entry.item as VideoGame]); break;
        case "movies":     setMovies([...movies, entry.item as Movie]); break;
        case "music":      setMusic([...music, entry.item as MusicAlbum]); break;
        default: {
          const tid = entry.typeId!;
          setCustomItems({ ...customItems, [tid]: [...(customItems[tid] ?? []), entry.item as CustomItem] });
        }
      }
    }
    setTrashed(trashed.filter((e) => e !== entry));
    notifications.show({ message: t("bin_restored"), color: "green" });
  };

  const handleEmptyBin = () => {
    setTrashed([]);
    notifications.show({ message: t("bin_emptied"), color: "red" });
  };

  const sorted = [...trashed].reverse();

  return (
    <Box p="xl">
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconTrash size={22} />
          <Title order={3}>{t("nav_bin")}</Title>
        </Group>
        {trashed.length > 0 && (
          <Button color="red" variant="subtle" leftSection={<IconTrash size={14} />} onClick={handleEmptyBin}>
            {t("bin_empty")}
          </Button>
        )}
      </Group>

      {trashed.length === 0 ? (
        <Stack align="center" mt="xl" gap="xs">
          <IconTrash size={48} opacity={0.2} />
          <Text c="dimmed">{t("bin_empty_state")}</Text>
        </Stack>
      ) : (
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("col_title")}</Table.Th>
              <Table.Th>{t("bin_col_type")}</Table.Th>
              <Table.Th>{t("bin_col_deleted")}</Table.Th>
              <Table.Th style={{ width: 40 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sorted.map((entry, i) => (
              <Table.Tr key={`${entry.item.id}-${i}`}>
                <Table.Td>
                  <Text size="sm" fw={500}>{(entry.item as AnyItem).title}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge size="sm" color={kindColor(entry.kind)} variant="light">
                    {kindLabel(entry)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{formatDate(entry.deletedAt)}</Text>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="green"
                    title={t("bin_restore")}
                    onClick={() => handleRestore(entry)}
                  >
                    <IconArrowBackUp size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Box>
  );
}
