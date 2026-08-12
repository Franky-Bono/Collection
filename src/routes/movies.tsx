import { IconMovie } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, FormatBadge, StatusBadge, getStatusLabel, getFormatLabel } from "@/components/collection/CollectionPage";
import { moviesAtom, movieColumnsAtom } from "@/state/atoms";
import type { Movie } from "@/types";
import { useT } from "@/i18n/useT";
import { useAtom } from "jotai";

export const Route = createFileRoute("/movies")({
  component: MoviesPage,
});

function MoviesPage() {
  const t = useT();
  const [movieColumns, setMovieColumns] = useAtom(movieColumnsAtom);

  const ALL_COLUMNS = [
    { key: "year",      label: t("col_year"),     width: 80  },
    { key: "director",  label: t("col_director"), width: 150 },
    { key: "country",   label: t("col_country"),  width: 110 },
    { key: "duration",  label: t("col_duration"), width: 100 },
    { key: "edition",   label: t("col_edition"),  width: 120 },
    { key: "quality",   label: t("col_quality"),  width: 110 },
    { key: "format",    label: t("col_format"),   width: 110, render: (item: Movie) => <FormatBadge value={item.format} />, getSearchValue: (item: Movie) => getFormatLabel(item.format ?? "", t) },
    { key: "location",  label: t("col_location"), width: 120 },
    { key: "genre",     label: t("col_genre"),    width: 120 },
    { key: "status",    label: t("col_status"),   width: 120, render: (item: Movie) => <StatusBadge value={item.status} />, getSearchValue: (item: Movie) => getStatusLabel(item.status ?? "", t) },
    { key: "rating",    label: t("col_rating"),   width: 90  },
    { key: "notes",     label: t("col_notes"),    width: 160 },
  ] as const;

  const columns = movieColumns
    .filter((s) => s.visible)
    .map((s) => ALL_COLUMNS.find((c) => c.key === s.key))
    .filter(Boolean) as typeof ALL_COLUMNS[number][];

  return (
    <CollectionPage
      title={t("nav_movies")}
      singular="Movie"
      icon={<IconMovie size={22} />}
      atom={moviesAtom as any}
      kind="movies"
      titleWidth={250}
      columns={columns as any}
      columnSettings={movieColumns}
      allColumnDefs={ALL_COLUMNS.map((c) => ({ key: c.key, label: c.label }))}
      setColumnSettings={setMovieColumns}
    />
  );
}
