import { IconMovie } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, FormatBadge, StatusBadge, getStatusLabel, getFormatLabel } from "@/components/collection/CollectionPage";
import { moviesAtom } from "@/state/atoms";
import type { Movie } from "@/types";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/movies")({
  component: MoviesPage,
});

function MoviesPage() {
  const t = useT();
  return (
    <CollectionPage
      title={t("nav_movies")}
      singular="Movie"
      icon={<IconMovie size={22} />}
      atom={moviesAtom}
      kind="movies"
      titleWidth={250}
      columns={[
        { key: "year",     label: t("col_year"),     width: 80  },
        { key: "director", label: t("col_director"), width: 150 },
        { key: "country",  label: t("col_country"),  width: 110 },
        { key: "duration", label: t("col_duration"), width: 100 },
        { key: "edition",  label: t("col_edition"),  width: 120 },
        { key: "format",   label: t("col_format"),   width: 110, render: (item) => <FormatBadge value={(item as Movie).format} />, getSearchValue: (item) => getFormatLabel((item as Movie).format ?? "", t) },
        { key: "location", label: t("col_location"), width: 120 },
        { key: "genre",    label: t("col_genre"),    width: 120 },
        { key: "status",   label: t("col_status"),   width: 120, render: (item) => <StatusBadge value={(item as Movie).status} />, getSearchValue: (item) => getStatusLabel((item as Movie).status ?? "", t) },
        { key: "rating",   label: t("col_rating"),   width: 90  },
      ]}
    />
  );
}
