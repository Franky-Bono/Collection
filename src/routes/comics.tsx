import { IconBook2 } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, StatusBadge } from "@/components/collection/CollectionPage";
import { comicsAtom } from "@/state/atoms";
import type { Comic } from "@/types";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/comics")({
  component: ComicsPage,
});

function ComicsPage() {
  const t = useT();
  return (
    <CollectionPage
      title={t("nav_comics")}
      singular="Comic"
      icon={<IconBook2 size={22} />}
      atom={comicsAtom}
      kind="comics"
      columns={[
        { key: "editor",    label: t("col_editor"),    width: 140 },
        { key: "series",    label: t("col_series"),    width: 140 },
        { key: "issue",     label: t("col_issue"),     width: 80  },
        { key: "year",      label: t("col_year"),      width: 80  },
        { key: "condition", label: t("col_condition"), width: 110, render: (item) => <StatusBadge value={(item as Comic).condition} /> },
        { key: "status",    label: t("col_status"),    width: 120, render: (item) => <StatusBadge value={(item as Comic).status} /> },
        { key: "rating",    label: t("col_rating"),    width: 90  },
      ]}
    />
  );
}
