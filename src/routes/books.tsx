import { IconBook } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, FormatBadge, StatusBadge, getStatusLabel, getFormatLabel } from "@/components/collection/CollectionPage";
import { booksAtom, bookColumnsAtom } from "@/state/atoms";
import type { Book } from "@/types";
import { useT } from "@/i18n/useT";
import { useAtom } from "jotai";
import { Text } from "@mantine/core";

export const Route = createFileRoute("/books")({
  component: BooksPage,
});

function BooksPage() {
  const t = useT();
  const [bookColumns, setBookColumns] = useAtom(bookColumnsAtom);

  const ALL_COLUMNS = [
    { key: "author",   label: t("col_author"),   width: 200 },
    { key: "genre",    label: t("col_genre"),    width: 120 },
    { key: "year",     label: t("col_year"),     width: 80  },
    { key: "pages",    label: t("col_pages"),    width: 80  },
    { key: "language", label: t("col_language"), width: 110 },
    { key: "edition",  label: t("col_edition"),  width: 120 },
    { key: "location", label: t("col_location"), width: 120 },
    { key: "format",   label: t("col_format"),   width: 110, render: (item: Book) => <FormatBadge value={item.format} />, getSearchValue: (item: Book) => getFormatLabel(item.format ?? "", t) },
    { key: "status",   label: t("col_status"),   width: 120, render: (item: Book) => <StatusBadge value={item.status} />, getSearchValue: (item: Book) => getStatusLabel(item.status ?? "", t) },
    { key: "rating",   label: t("col_rating"),   width: 90  },
    { key: "notes",    label: t("col_notes"),    width: 200, render: (item: Book) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
  ] as const;

  const mergedColumns = [
    ...bookColumns.filter(s => ALL_COLUMNS.some(c => c.key === s.key)),
    ...ALL_COLUMNS.filter(c => !bookColumns.some(s => s.key === c.key)).map(c => ({ key: c.key, visible: false })),
  ];

  const columns = mergedColumns
    .filter((s) => s.visible)
    .map((s) => ALL_COLUMNS.find((c) => c.key === s.key))
    .filter(Boolean) as typeof ALL_COLUMNS[number][];

  return (
    <CollectionPage
      title={t("nav_books")}
      singular="Book"
      icon={<IconBook size={22} />}
      atom={booksAtom as any}
      kind="books"
      columns={columns as any}
      columnSettings={mergedColumns}
      allColumnDefs={ALL_COLUMNS.map((c) => ({ key: c.key, label: c.label }))}
      setColumnSettings={setBookColumns}
    />
  );
}
