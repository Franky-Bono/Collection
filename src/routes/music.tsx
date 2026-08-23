import { IconMusic } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, FormatBadge, StatusBadge, getStatusLabel, getFormatLabel } from "@/components/collection/CollectionPage";
import { musicAtom, musicColumnsAtom, customColumnsAtom } from "@/state/atoms";
import type { MusicAlbum } from "@/types";
import { useT } from "@/i18n/useT";
import { useAtom } from "jotai";
import { Text } from "@mantine/core";
import type { CustomColumnDef } from "@/state/atoms";

export const Route = createFileRoute("/music")({
  component: MusicPage,
});

function MusicPage() {
  const t = useT();
  const [musicColumns, setMusicColumns] = useAtom(musicColumnsAtom);
  const [customColumns, setCustomColumns] = useAtom(customColumnsAtom);
  const kindCustom: CustomColumnDef[] = customColumns["music"] ?? [];

  const BUILTIN_COLUMNS = [
    { key: "artist",  label: t("col_artist"),  width: 150 },
    { key: "genre",   label: t("col_genre"),   width: 120 },
    { key: "year",    label: t("col_year"),    width: 80  },
    { key: "format",  label: t("col_format"),  width: 110, render: (item: MusicAlbum) => <FormatBadge value={item.format} />, getSearchValue: (item: MusicAlbum) => getFormatLabel(item.format ?? "", t) },
    { key: "status",  label: t("col_status"),  width: 120, render: (item: MusicAlbum) => <StatusBadge value={item.status} />, getSearchValue: (item: MusicAlbum) => getStatusLabel(item.status ?? "", t) },
    { key: "rating",  label: t("col_rating"),  width: 90  },
    { key: "notes",   label: t("col_notes"),   width: 160, render: (item: MusicAlbum) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
  ] as const;

  const ALL_COLUMNS = [
    ...BUILTIN_COLUMNS,
    ...kindCustom.map((c) => ({ key: c.key, label: c.label, width: c.width })),
  ];

  const mergedColumns = [
    ...musicColumns.filter(s => ALL_COLUMNS.some(c => c.key === s.key)),
    ...ALL_COLUMNS.filter(c => !musicColumns.some(s => s.key === c.key)).map(c => ({ key: c.key, visible: false })),
  ];

  const columns = mergedColumns
    .filter((s) => s.visible)
    .map((s) => ALL_COLUMNS.find((c) => c.key === s.key))
    .filter(Boolean) as (typeof ALL_COLUMNS[number])[];

  const handleAddCustom = (col: CustomColumnDef) => {
    setCustomColumns((prev) => ({ ...prev, music: [...(prev["music"] ?? []), col] }));
    setMusicColumns((prev) => [...prev, { key: col.key, visible: true }]);
  };

  const handleDeleteCustom = (key: string) => {
    setCustomColumns((prev) => ({ ...prev, music: (prev["music"] ?? []).filter((c) => c.key !== key) }));
    setMusicColumns((prev) => prev.filter((s) => s.key !== key));
  };

  return (
    <CollectionPage
      title={t("nav_music")}
      singular="Album"
      icon={<IconMusic size={22} />}
      atom={musicAtom as any}
      kind="music"
      columns={columns as any}
      columnSettings={mergedColumns}
      allColumnDefs={ALL_COLUMNS.map((c) => ({ key: c.key, label: c.label }))}
      setColumnSettings={setMusicColumns}
      customColumnDefs={kindCustom}
      onAddCustomColumn={handleAddCustom}
      onDeleteCustomColumn={handleDeleteCustom}
    />
  );
}
