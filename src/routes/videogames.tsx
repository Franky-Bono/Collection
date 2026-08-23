import { IconDeviceGamepad2 } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, StatusBadge, getStatusLabel } from "@/components/collection/CollectionPage";
import { videoGamesAtom, videoGameColumnsAtom, customColumnsAtom } from "@/state/atoms";
import type { VideoGame } from "@/types";
import { useT } from "@/i18n/useT";
import { useAtom } from "jotai";
import { Text } from "@mantine/core";
import type { CustomColumnDef } from "@/state/atoms";

export const Route = createFileRoute("/videogames")({
  component: VideoGamesPage,
});

function VideoGamesPage() {
  const t = useT();
  const [videoGameColumns, setVideoGameColumns] = useAtom(videoGameColumnsAtom);
  const [customColumns, setCustomColumns] = useAtom(customColumnsAtom);
  const kindCustom: CustomColumnDef[] = customColumns["videogames"] ?? [];

  const BUILTIN_COLUMNS = [
    { key: "studio",   label: t("col_studio"),   width: 140 },
    { key: "genre",    label: t("col_genre"),    width: 120 },
    { key: "year",     label: t("col_year"),     width: 80  },
    { key: "platform", label: t("col_platform"), width: 120 },
    { key: "status",   label: t("col_status"),   width: 120, render: (item: VideoGame) => <StatusBadge value={item.status} />, getSearchValue: (item: VideoGame) => getStatusLabel(item.status ?? "", t) },
    { key: "rating",   label: t("col_rating"),   width: 90  },
    { key: "notes",    label: t("col_notes"),    width: 160, render: (item: VideoGame) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
  ] as const;

  const ALL_COLUMNS = [
    ...BUILTIN_COLUMNS,
    ...kindCustom.map((c) => ({ key: c.key, label: c.label, width: c.width })),
  ];

  const mergedColumns = [
    ...videoGameColumns.filter(s => ALL_COLUMNS.some(c => c.key === s.key)),
    ...ALL_COLUMNS.filter(c => !videoGameColumns.some(s => s.key === c.key)).map(c => ({ key: c.key, visible: false })),
  ];

  const columns = mergedColumns
    .filter((s) => s.visible)
    .map((s) => ALL_COLUMNS.find((c) => c.key === s.key))
    .filter(Boolean) as (typeof ALL_COLUMNS[number])[];

  const handleAddCustom = (col: CustomColumnDef) => {
    setCustomColumns((prev) => ({ ...prev, videogames: [...(prev["videogames"] ?? []), col] }));
    setVideoGameColumns((prev) => [...prev, { key: col.key, visible: true }]);
  };

  const handleDeleteCustom = (key: string) => {
    setCustomColumns((prev) => ({ ...prev, videogames: (prev["videogames"] ?? []).filter((c) => c.key !== key) }));
    setVideoGameColumns((prev) => prev.filter((s) => s.key !== key));
  };

  return (
    <CollectionPage
      title={t("nav_videogames")}
      singular="Video Game"
      icon={<IconDeviceGamepad2 size={22} />}
      atom={videoGamesAtom as any}
      kind="videogames"
      columns={columns as any}
      columnSettings={mergedColumns}
      allColumnDefs={ALL_COLUMNS.map((c) => ({ key: c.key, label: c.label }))}
      setColumnSettings={setVideoGameColumns}
      customColumnDefs={kindCustom}
      onAddCustomColumn={handleAddCustom}
      onDeleteCustomColumn={handleDeleteCustom}
    />
  );
}
