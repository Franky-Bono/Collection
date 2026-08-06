import { IconDeviceGamepad2 } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, StatusBadge } from "@/components/collection/CollectionPage";
import { videoGamesAtom } from "@/state/atoms";
import type { VideoGame } from "@/types";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/videogames")({
  component: VideoGamesPage,
});

function VideoGamesPage() {
  const t = useT();
  return (
    <CollectionPage
      title={t("nav_videogames")}
      singular="Video Game"
      icon={<IconDeviceGamepad2 size={22} />}
      atom={videoGamesAtom}
      kind="videogames"
      columns={[
        { key: "studio",   label: t("col_studio"),   width: 140 },
        { key: "genre",    label: t("col_genre"),    width: 120 },
        { key: "year",     label: t("col_year"),     width: 80  },
        { key: "platform", label: t("col_platform"), width: 120 },
        { key: "status",   label: t("col_status"),   width: 120, render: (item) => <StatusBadge value={(item as VideoGame).status} /> },
        { key: "rating",   label: t("col_rating"),   width: 90  },
      ]}
    />
  );
}
