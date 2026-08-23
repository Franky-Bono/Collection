import { IconMovie } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, FormatBadge, StatusBadge, getStatusLabel, getFormatLabel } from "@/components/collection/CollectionPage";
import { moviesAtom, movieColumnsAtom, customColumnsAtom } from "@/state/atoms";
import type { Movie } from "@/types";
import { useT } from "@/i18n/useT";
import { useAtom } from "jotai";
import { Text } from "@mantine/core";
import type { CustomColumnDef } from "@/state/atoms";

export const Route = createFileRoute("/movies")({
  component: MoviesPage,
});

function MoviesPage() {
  const t = useT();
  const [movieColumns, setMovieColumns] = useAtom(movieColumnsAtom);
  const [customColumns, setCustomColumns] = useAtom(customColumnsAtom);
  const kindCustom: CustomColumnDef[] = customColumns["movies"] ?? [];

  const BUILTIN_COLUMNS = [
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
    { key: "rank",      label: t("col_rank"),     width: 70  },
    { key: "notes",     label: t("col_notes"),    width: 160, render: (item: Movie) => <Text size="sm" c="dimmed">{item.notes ?? ""}</Text> },
  ] as const;

  const ALL_COLUMNS = [
    ...BUILTIN_COLUMNS,
    ...kindCustom.map((c) => ({ key: c.key, label: c.label, width: c.width })),
  ];

  const mergedColumns = [
    ...movieColumns.filter(s => ALL_COLUMNS.some(c => c.key === s.key)),
    ...ALL_COLUMNS.filter(c => !movieColumns.some(s => s.key === c.key)).map(c => ({ key: c.key, visible: false })),
  ];

  const columns = mergedColumns
    .filter((s) => s.visible)
    .map((s) => ALL_COLUMNS.find((c) => c.key === s.key))
    .filter(Boolean) as (typeof ALL_COLUMNS[number])[];

  const handleAddCustom = (col: CustomColumnDef) => {
    setCustomColumns((prev) => ({ ...prev, movies: [...(prev["movies"] ?? []), col] }));
    setMovieColumns((prev) => [...prev, { key: col.key, visible: true }]);
  };

  const handleDeleteCustom = (key: string) => {
    setCustomColumns((prev) => ({ ...prev, movies: (prev["movies"] ?? []).filter((c) => c.key !== key) }));
    setMovieColumns((prev) => prev.filter((s) => s.key !== key));
  };

  return (
    <CollectionPage
      title={t("nav_movies")}
      singular="Movie"
      icon={<IconMovie size={22} />}
      atom={moviesAtom as any}
      kind="movies"
      titleWidth={250}
      columns={columns as any}
      columnSettings={mergedColumns}
      allColumnDefs={ALL_COLUMNS.map((c) => ({ key: c.key, label: c.label }))}
      setColumnSettings={setMovieColumns}
      customColumnDefs={kindCustom}
      onAddCustomColumn={handleAddCustom}
      onDeleteCustomColumn={handleDeleteCustom}
    />
  );
}
