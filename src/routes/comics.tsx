import { IconBook2 } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, StatusBadge, getStatusLabel } from "@/components/collection/CollectionPage";
import { comicsAtom, comicColumnsAtom, customColumnsAtom } from "@/state/atoms";
import type { Comic } from "@/types";
import { useT } from "@/i18n/useT";
import { useAtom } from "jotai";
import { Text } from "@mantine/core";
import type { CustomColumnDef } from "@/state/atoms";

export const Route = createFileRoute("/comics")({
  component: ComicsPage,
});

function ComicsPage() {
  const t = useT();
  const [comicColumns, setComicColumns] = useAtom(comicColumnsAtom);
  const [customColumns, setCustomColumns] = useAtom(customColumnsAtom);
  const kindCustom: CustomColumnDef[] = customColumns["comics"] ?? [];

  const BUILTIN_COLUMNS = [
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
  ] as const;

  const ALL_COLUMNS = [
    ...BUILTIN_COLUMNS,
    ...kindCustom.map((c) => ({ key: c.key, label: c.label, width: c.width })),
  ];

  const mergedColumns = [
    ...comicColumns.filter(s => ALL_COLUMNS.some(c => c.key === s.key)),
    ...ALL_COLUMNS.filter(c => !comicColumns.some(s => s.key === c.key)).map(c => ({ key: c.key, visible: false })),
  ];

  const columns = mergedColumns
    .filter((s) => s.visible)
    .map((s) => ALL_COLUMNS.find((c) => c.key === s.key))
    .filter(Boolean) as (typeof ALL_COLUMNS[number])[];

  const handleAddCustom = (col: CustomColumnDef) => {
    setCustomColumns((prev) => ({ ...prev, comics: [...(prev["comics"] ?? []), col] }));
    setComicColumns((prev) => [...prev, { key: col.key, visible: true }]);
  };

  const handleDeleteCustom = (key: string) => {
    setCustomColumns((prev) => ({ ...prev, comics: (prev["comics"] ?? []).filter((c) => c.key !== key) }));
    setComicColumns((prev) => prev.filter((s) => s.key !== key));
  };

  return (
    <CollectionPage
      title={t("nav_comics")}
      singular="Comic"
      icon={<IconBook2 size={22} />}
      atom={comicsAtom as any}
      kind="comics"
      columns={columns as any}
      columnSettings={mergedColumns}
      allColumnDefs={ALL_COLUMNS.map((c) => ({ key: c.key, label: c.label }))}
      setColumnSettings={setComicColumns}
      customColumnDefs={kindCustom}
      onAddCustomColumn={handleAddCustom}
      onDeleteCustomColumn={handleDeleteCustom}
    />
  );
}
