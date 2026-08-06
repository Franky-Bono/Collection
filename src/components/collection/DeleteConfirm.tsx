import { Button, Group, Modal, Text } from "@mantine/core";
import { useT } from "@/i18n/useT";

interface Props {
  opened: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({ opened, title, onConfirm, onCancel }: Props) {
  const t = useT();
  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title={t("delete_title")}
      centered
      size="sm"
    >
      <Text size="sm" mb="md">
        {t("delete_message", { title })}
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>{t("delete_cancel")}</Button>
        <Button color="red" onClick={onConfirm}>{t("delete_confirm")}</Button>
      </Group>
    </Modal>
  );
}
