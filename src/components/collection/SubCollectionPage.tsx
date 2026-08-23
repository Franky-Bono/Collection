import { ActionIcon, Box, Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { IconBook, IconBook2, IconDeviceGamepad2, IconEdit, IconMovie, IconMusic, IconTrash } from "@tabler/icons-react";
import { useAtom, useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { CollectionPage, FormatBadge, StatusBadge, getStatusLabel, getFormatLabel } from "./CollectionPage";
import { subCollectionsAtom, subCollectionItemsAtom, makeSubCollectionItemsAtom, trashedItemsAtom } from "@/state/atoms";
import type { CollectionKind } from "@/types";
import type { Movie, Book, Comic, MusicAlbum, VideoGame, AnyItem } from "@/types";
import { useT } from "@/i18n/useT";
import type { TranslationKey } from "@/i18n/translations";

const KIND_ICONS: Record<CollectionKind, React.ReactNode> = {
  movies:     <IconMovie size={22} />,
  books:      <IconBook size={22} />,
  comics:     <IconBook2 size={22} />,
  music:      <IconMusic size={22} />,
  videogames: <IconDeviceGamepad2 size={22} />,
};

const KIND_SINGULAR: Record<CollectionKind, string> = {
  movies:     "Movie",
  books:      "Book",
  comics:     "Comic",
  music:      "Album",
  videogames: "Video Game",
};

const KIND_TITLE_WIDTH: Record<CollectionKind, number> = {
  movies:     250,
  books:      250,
  comics:     200,
  music:      220,
  videogames: 220,
};

function useKindColumns(kind: CollectionKind, t: (k: TranslationKey) => string) {
  return useMemo(() => {
    switch (kind) {
      case "movies":
        return [
          { key: "year",     label: t("col_year"),     width: 80  },
          { key: "director", label: t("col_director"), width: 150 },
          { key: "country",  label: t("col_country"),  width: 110 },
          { key: "duration", label: t("col_duration"), width: 100 },
          { key: "edition",  label: t("col_edition"),  width: 120 },
          { key: "quality",  label: t("col_quality"),  width: 110 },
          { key: "format",   label: t("col_format"),   width: 110, render: (item: Movie) => <FormatBadge value={item.format} />, getSearchValue: (item: Movie) => getFormatLabel(item.format ?? "", t) },
          { key: "location", label: t("col_location"), width: 120 },
          { key: "genre",    label: t("col_genre"),    width: 120 },
          { key: "status",   label: t("col_status"),   width: 120, render: (item: Movie) => <StatusBadge value={item.status} />, getSearchValue: (item: Movie) => getStatusLabel(item.status ?? "", t) },
          { key: "rating",   label: t("col_rating"),   width: 90  },
          { key: "notes",    label: t("col_notes"),    width: 160, render: (item: Movie) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
        ];
      case "books":
        return [
          { key: "author",    label: t("col_author"),    width: 200 },
          { key: "publisher", label: t("col_publisher"), width: 140 },
          { key: "genre",     label: t("col_genre"),     width: 120 },
          { key: "year",      label: t("col_year"),      width: 80  },
          { key: "pages",     label: t("col_pages"),     width: 80  },
          { key: "language",  label: t("col_language"),  width: 110 },
          { key: "edition",   label: t("col_edition"),   width: 120 },
          { key: "location",  label: t("col_location"),  width: 120 },
          { key: "format",    label: t("col_format"),    width: 110, render: (item: Book) => <FormatBadge value={item.format} />, getSearchValue: (item: Book) => getFormatLabel(item.format ?? "", t) },
          { key: "status",    label: t("col_status"),    width: 120, render: (item: Book) => <StatusBadge value={item.status} />, getSearchValue: (item: Book) => getStatusLabel(item.status ?? "", t) },
          { key: "rating",    label: t("col_rating"),    width: 90  },
          { key: "notes",     label: t("col_notes"),     width: 200, render: (item: Book) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
        ];
      case "comics":
        return [
          { key: "author",    label: t("col_author"),    width: 140 },
          { key: "series",    label: t("col_series"),    width: 140 },
          { key: "issue",     label: t("col_issue"),     width: 80  },
          { key: "pages",     label: t("col_pages"),     width: 80  },
          { key: "year",      label: t("col_year"),      width: 80  },
          { key: "publisher", label: t("col_publisher"), width: 140 },
          { key: "genre",     label: t("col_genre"),     width: 110 },
          { key: "condition", label: t("col_condition"), width: 110, render: (item: Comic) => <StatusBadge value={item.condition} />, getSearchValue: (item: Comic) => getStatusLabel(item.condition ?? "", t) },
          { key: "status",    label: t("col_status"),    width: 120, render: (item: Comic) => <StatusBadge value={item.status} />, getSearchValue: (item: Comic) => getStatusLabel(item.status ?? "", t) },
          { key: "rating",    label: t("col_rating"),    width: 90  },
          { key: "notes",     label: t("col_notes"),     width: 160, render: (item: Comic) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
        ];
      case "music":
        return [
          { key: "artist",  label: t("col_artist"),  width: 150 },
          { key: "genre",   label: t("col_genre"),   width: 120 },
          { key: "year",    label: t("col_year"),    width: 80  },
          { key: "format",  label: t("col_format"),  width: 110, render: (item: MusicAlbum) => <FormatBadge value={item.format} />, getSearchValue: (item: MusicAlbum) => getFormatLabel(item.format ?? "", t) },
          { key: "status",  label: t("col_status"),  width: 120, render: (item: MusicAlbum) => <StatusBadge value={item.status} />, getSearchValue: (item: MusicAlbum) => getStatusLabel(item.status ?? "", t) },
          { key: "rating",  label: t("col_rating"),  width: 90  },
          { key: "notes",   label: t("col_notes"),   width: 160, render: (item: MusicAlbum) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
        ];
      case "videogames":
        return [
          { key: "studio",   label: t("col_studio"),   width: 140 },
          { key: "genre",    label: t("col_genre"),    width: 120 },
          { key: "year",     label: t("col_year"),     width: 80  },
          { key: "platform", label: t("col_platform"), width: 120 },
          { key: "status",   label: t("col_status"),   width: 120, render: (item: VideoGame) => <StatusBadge value={item.status} />, getSearchValue: (item: VideoGame) => getStatusLabel(item.status ?? "", t) },
          { key: "rating",   label: t("col_rating"),   width: 90  },
          { key: "notes",    label: t("col_notes"),    width: 160, render: (item: VideoGame) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
        ];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);
}

interface Props {
  kind: string;
  collectionId: string;
}

export function SubCollectionPage({ kind, collectionId }: Props) {
  const t = useT();
  const navigate = useNavigate();
  const [subCollections, setSubCollections] = useAtom(subCollectionsAtom);
  const [subCollectionItems, setSubCollectionItems] = useAtom(subCollectionItemsAtom);
  const [trashed, setTrashed] = useAtom(trashedItemsAtom);

  const subCollection = subCollections.find((s) => s.id === collectionId);
  const itemsAtom = useMemo(() => makeSubCollectionItemsAtom(collectionId), [collectionId]);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const safeKind = (subCollection?.kind ?? kind) as CollectionKind;
  const columns = useKindColumns(safeKind, t);

  const currentItems = useAtomValue(itemsAtom);

  if (!subCollection) {
    return (
      <Box p="xl">
        <Text c="dimmed">Collection not found.</Text>
      </Box>
    );
  }

  const handleRenameOpen = () => {
    setRenameValue(subCollection.name);
    setRenameOpen(true);
  };

  const handleRenameConfirm = () => {
    if (!renameValue.trim()) return;
    setSubCollections(subCollections.map((s) =>
      s.id === collectionId ? { ...s, name: renameValue.trim() } : s
    ));
    setRenameOpen(false);
  };

  const handleDelete = () => {
    const items = currentItems;
    const trashedEntries = items.map((item) => ({
      item: item as AnyItem,
      kind: safeKind,
      subCollectionId: collectionId,
      deletedAt: new Date().toISOString(),
    }));
    setTrashed([...trashed, ...trashedEntries]);
    const newItems = { ...subCollectionItems };
    delete newItems[collectionId];
    setSubCollectionItems(newItems);
    setSubCollections(subCollections.filter((s) => s.id !== collectionId));
    setDeleteOpen(false);
    notifications.show({ message: `"${subCollection.name}" deleted`, color: "orange" });
    navigate({ to: `/${safeKind}` });
  };

  const extraHeaderActions = (
    <Group gap="xs">
      <ActionIcon size="sm" variant="subtle" title={t("sub_rename")} onClick={handleRenameOpen}>
        <IconEdit size={15} />
      </ActionIcon>
      <ActionIcon size="sm" variant="subtle" color="red" title={t("sub_delete")} onClick={() => setDeleteOpen(true)}>
        <IconTrash size={15} />
      </ActionIcon>
    </Group>
  );

  return (
    <>
      <CollectionPage
        title={subCollection.name}
        singular={KIND_SINGULAR[safeKind]}
        icon={KIND_ICONS[safeKind]}
        atom={itemsAtom as any}
        kind={safeKind}
        titleWidth={KIND_TITLE_WIDTH[safeKind]}
        columns={columns as any}
        subCollectionId={collectionId}
        extraHeaderActions={extraHeaderActions}
      />

      {/* Rename modal */}
      <Modal opened={renameOpen} onClose={() => setRenameOpen(false)} title={t("sub_rename_title")} centered size="sm">
        <TextInput
          label={t("sub_name_label")}
          value={renameValue}
          onChange={(e) => setRenameValue(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
          data-autofocus
        />
        <Group justify="flex-end" mt="md" gap="xs">
          <Button variant="default" size="xs" onClick={() => setRenameOpen(false)}>{t("sub_cancel")}</Button>
          <Button size="xs" onClick={handleRenameConfirm} disabled={!renameValue.trim()}>{t("sub_rename")}</Button>
        </Group>
      </Modal>

      {/* Delete confirm modal */}
      <Modal opened={deleteOpen} onClose={() => setDeleteOpen(false)} title={t("sub_delete")} centered size="sm">
        <Text size="sm">
          {t("sub_delete_confirm", { name: subCollection.name })}
        </Text>
        <Group justify="flex-end" mt="md" gap="xs">
          <Button variant="default" size="xs" onClick={() => setDeleteOpen(false)}>{t("sub_cancel")}</Button>
          <Button size="xs" color="red" onClick={handleDelete}>{t("sub_delete_confirm_btn")}</Button>
        </Group>
      </Modal>
    </>
  );
}
