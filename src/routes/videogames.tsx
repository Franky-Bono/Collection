import { IconDeviceGamepad2 } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, StatusBadge, getStatusLabel } from "@/components/collection/CollectionPage";
import { videoGamesAtom, videoGameColumnsAtom } from "@/state/atoms";
import type { VideoGame } from "@/types";
import { useT } from "@/i18n/useT";
import { useAtom } from "jotai";
import { Text } from "@mantine/core";

export const Route = createFileRoute("/videogames")({
  component: VideoGamesPage,
});

function VideoGamesPage() {
  const t = useT();
  const [videoGameColumns, setVideoGameColumns] = useAtom(videoGameColumnsAtom);

  const ALL_COLUMNS = [
    { key: "studio",   label: t("col_studio"),   width: 140 },
    { key: "genre",    label: t("col_genre"),    width: 120 },
    { key: "year",     label: t("col_year"),     width: 80  },
    { key: "platform", label: t("col_platform"), width: 120 },
    { key: "status",   label: t("col_status"),   width: 120, render: (item: VideoGame) => <StatusBadge value={item.status} />, getSearchValue: (item: VideoGame) => getStatusLabel(item.status ?? "", t) },
    { key: "rating",   label: t("col_rating"),   width: 90  },
    { key: "notes",    label: t("col_notes"),    width: 160, render: (item: VideoGame) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
  ] as const;

  const columns = videoGameColumns
    .filter((s) => s.visible)
    .map((s) => ALL_COLUMNS.find((c) => c.key === s.key))
    .filter(Boolean) as typeof ALL_COLUMNS[number][];

  return (
    <CollectionPage
      title={t("nav_videogames")}
      singular="Video Game"
      icon={<IconDeviceGamepad2 size={22} />}
      atom={videoGamesAtom as any}
      kind="videogames"
      columns={columns as any}
      columnSettings={videoGameColumns}
      allColumnDefs={ALL_COLUMNS.map((c) => ({ key: c.key, label: c.label }))}
      setColumnSettings={setVideoGameColumns}
    />
  );
}
