import { IconBook } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, FormatBadge, StatusBadge } from "@/components/collection/CollectionPage";
import { booksAtom } from "@/state/atoms";
import type { Book } from "@/types";
import { useT } from "@/i18n/useT";
import { Text } from "@mantine/core";

export const Route = createFileRoute("/books")({
  component: BooksPage,
});

function BooksPage() {
  const t = useT();
  return (
    <CollectionPage
      title={t("nav_books")}
      singular="Book"
      icon={<IconBook size={22} />}
      atom={booksAtom}
      kind="books"
      columns={[
        { key: "author",  label: t("col_author"),  width: 160 },
        { key: "genre",   label: t("col_genre"),   width: 120 },
        { key: "year",    label: t("col_year"),    width: 80  },
        { key: "format",  label: t("col_format"),  width: 110, render: (item) => <FormatBadge value={(item as Book).format} /> },
        { key: "status",  label: t("col_status"),  width: 120, render: (item) => <StatusBadge value={(item as Book).status} /> },
        { key: "rating",  label: t("col_rating"),  width: 90  },
        { key: "notes",   label: t("col_notes"),   width: 200, render: (item) => <Text size="sm" c="dimmed" truncate>{(item as Book).notes ?? ""}</Text> },
      ]}
    />
  );
}
