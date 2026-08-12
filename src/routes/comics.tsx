import { IconBook2 } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, StatusBadge, getStatusLabel } from "@/components/collection/CollectionPage";
import { comicsAtom, comicColumnsAtom } from "@/state/atoms";
import type { Comic } from "@/types";
import { useT } from "@/i18n/useT";
import { useAtom } from "jotai";
import { Text } from "@mantine/core";

export const Route = createFileRoute("/comics")({
  component: ComicsPage,
});

function ComicsPage() {
  const t = useT();
  const [comicColumns, setComicColumns] = useAtom(comicColumnsAtom);

  const ALL_COLUMNS = [
    { key: "editor",    label: t("col_editor"),    width: 140 },
    { key: "series",    label: t("col_series"),    width: 140 },
    { key: "issue",     label: t("col_issue"),     width: 80  },
    { key: "year",      label: t("col_year"),      width: 80  },
    { key: "condition", label: t("col_condition"), width: 110, render: (item: Comic) => <StatusBadge value={item.condition} />, getSearchValue: (item: Comic) => getStatusLabel(item.condition ?? "", t) },
    { key: "status",    label: t("col_status"),    width: 120, render: (item: Comic) => <StatusBadge value={item.status} />, getSearchValue: (item: Comic) => getStatusLabel(item.status ?? "", t) },
    { key: "rating",    label: t("col_rating"),    width: 90  },
    { key: "notes",     label: t("col_notes"),     width: 160, render: (item: Comic) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
  ] as const;

  const columns = comicColumns
    .filter((s) => s.visible)
    .map((s) => ALL_COLUMNS.find((c) => c.key === s.key))
    .filter(Boolean) as typeof ALL_COLUMNS[number][];

  return (
    <CollectionPage
      title={t("nav_comics")}
      singular="Comic"
      icon={<IconBook2 size={22} />}
      atom={comicsAtom as any}
      kind="comics"
      columns={columns as any}
      columnSettings={comicColumns}
      allColumnDefs={ALL_COLUMNS.map((c) => ({ key: c.key, label: c.label }))}
      setColumnSettings={setComicColumns}
    />
  );
}
