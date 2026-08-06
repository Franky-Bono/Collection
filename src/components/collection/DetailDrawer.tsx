import { Badge, Box, Button, Drawer, Group, Image, Stack, Text, Title } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import type { AnyItem, CustomItem } from "@/types";
import { useT } from "@/i18n/useT";
import { useFormatting } from "@/hooks/useFormatting";

interface Props {
  item: (AnyItem | CustomItem) | null;
  opened: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <Group justify="space-between" py={4} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <Text size="sm" c="dimmed">{label}</Text>
      <Text size="sm" fw={500}>{value}</Text>
    </Group>
  );
}

export function DetailDrawer({ item, opened, onClose, onEdit }: Props) {
  const t = useT();
  const { formatDate } = useFormatting();
  if (!item) return null;

  const i = item as Record<string, unknown>;

  return (
    <Drawer opened={opened} onClose={onClose} position="right" size="sm" title={
      <Group justify="space-between" style={{ flex: 1, paddingRight: 8 }}>
        <Title order={4}>{i.title as string}</Title>
        {onEdit && (
          <Button size="xs" variant="light" leftSection={<IconEdit size={13} />} onClick={() => { onClose(); onEdit(); }}>
            {t("form_edit")}
          </Button>
        )}
      </Group>
    }>
      <Stack gap="sm">
        {Boolean(i.coverUrl) && (
          <Box style={{ textAlign: "center" }}>
            <Image src={i.coverUrl as string} alt={i.title as string} mah={240} fit="contain" radius="md" />
          </Box>
        )}
        {Boolean(i.status) && <Badge variant="light">{i.status as string}</Badge>}
        <Field label={t("col_author")}    value={i.author as string} />
        <Field label={t("col_artist")}    value={i.artist as string} />
        <Field label={t("col_director")}  value={i.director as string} />
        <Field label={t("col_studio")}    value={i.studio as string} />
        <Field label={t("col_editor")}    value={i.editor as string} />
        <Field label={t("col_genre")}     value={i.genre as string} />
        <Field label={t("col_year")}      value={i.year as number} />
        <Field label={t("col_format")}    value={i.format as string} />
        <Field label={t("col_platform")}  value={i.platform as string} />
        <Field label={t("col_series")}    value={i.series as string} />
        <Field label={t("col_issue")}     value={i.issue as number} />
        <Field label={t("col_publisher")} value={i.publisher as string} />
        <Field label={t("col_condition")} value={i.condition as string} />
        <Field label={t("col_edition")}   value={i.edition as string} />
        <Field label={t("col_pages")}     value={i.pages as number} />
        <Field label={t("col_label")}     value={i.label as string} />
        <Field label={t("col_duration")}  value={i.duration as string} />
        <Field label={t("col_quality")}   value={i.quality as string} />
        <Field label={t("col_country")}   value={i.country as string} />
        <Field label={t("col_location")}  value={i.location as string} />
        <Field label={t("col_rating")}    value={i.rating as number} />
        {Boolean(i.notes) && (
          <Box pt={4}>
            <Text size="sm" c="dimmed" mb={6}>{t("col_notes")}</Text>
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{i.notes as string}</Text>
          </Box>
        )}
        <Text size="xs" c="dimmed" mt="md">
          {t("dashboard_col_added")}: {formatDate(i.addedAt as string)}
        </Text>
      </Stack>
    </Drawer>
  );
}
