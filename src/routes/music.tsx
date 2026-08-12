import { IconMusic } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, FormatBadge, StatusBadge, getStatusLabel, getFormatLabel } from "@/components/collection/CollectionPage";
import { musicAtom, musicColumnsAtom } from "@/state/atoms";
import type { MusicAlbum } from "@/types";
import { useT } from "@/i18n/useT";
import { useAtom } from "jotai";

export const Route = createFileRoute("/music")({
  component: MusicPage,
});

function MusicPage() {
  const t = useT();
  const [musicColumns, setMusicColumns] = useAtom(musicColumnsAtom);

  const ALL_COLUMNS = [
    { key: "artist",  label: t("col_artist"),  width: 150 },
    { key: "genre",   label: t("col_genre"),   width: 120 },
    { key: "year",    label: t("col_year"),    width: 80  },
    { key: "format",  label: t("col_format"),  width: 110, render: (item: MusicAlbum) => <FormatBadge value={item.format} />, getSearchValue: (item: MusicAlbum) => getFormatLabel(item.format ?? "", t) },
    { key: "status",  label: t("col_status"),  width: 120, render: (item: MusicAlbum) => <StatusBadge value={item.status} />, getSearchValue: (item: MusicAlbum) => getStatusLabel(item.status ?? "", t) },
    { key: "rating",  label: t("col_rating"),  width: 90  },
  ] as const;

  const columns = musicColumns
    .filter((s) => s.visible)
    .map((s) => ALL_COLUMNS.find((c) => c.key === s.key))
    .filter(Boolean) as typeof ALL_COLUMNS[number][];

  return (
    <CollectionPage
      title={t("nav_music")}
      singular="Album"
      icon={<IconMusic size={22} />}
      atom={musicAtom as any}
      kind="music"
      columns={columns as any}
      columnSettings={musicColumns}
      allColumnDefs={ALL_COLUMNS.map((c) => ({ key: c.key, label: c.label }))}
      setColumnSettings={setMusicColumns}
    />
  );
}
