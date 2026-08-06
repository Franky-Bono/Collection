import { IconMusic } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, FormatBadge, StatusBadge } from "@/components/collection/CollectionPage";
import { musicAtom } from "@/state/atoms";
import type { MusicAlbum } from "@/types";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/music")({
  component: MusicPage,
});

function MusicPage() {
  const t = useT();
  return (
    <CollectionPage
      title={t("nav_music")}
      singular="Album"
      icon={<IconMusic size={22} />}
      atom={musicAtom}
      kind="music"
      columns={[
        { key: "artist",  label: t("col_artist"),  width: 150 },
        { key: "genre",   label: t("col_genre"),   width: 120 },
        { key: "year",    label: t("col_year"),    width: 80  },
        { key: "format",  label: t("col_format"),  width: 110, render: (item) => <FormatBadge value={(item as MusicAlbum).format} /> },
        { key: "status",  label: t("col_status"),  width: 120, render: (item) => <StatusBadge value={(item as MusicAlbum).status} /> },
        { key: "rating",  label: t("col_rating"),  width: 90  },
      ]}
    />
  );
}
