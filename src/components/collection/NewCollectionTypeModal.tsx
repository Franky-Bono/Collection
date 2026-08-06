import {
  Button, Group, Modal, Select, Stack, Switch, Text, TextInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useT } from "@/i18n/useT";
import type { CustomCollectionType, CustomField } from "@/types";
import { AVAILABLE_ICONS, CustomTypeIcon } from "./CustomTypeIcon";

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (type: CustomCollectionType) => void;
}

function newField(): CustomField {
  return { id: crypto.randomUUID(), name: "", type: "text", required: false };
}

export function NewCollectionTypeModal({ opened, onClose, onSubmit }: Props) {
  const t = useT();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("package");
  const [fields, setFields] = useState<CustomField[]>([]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ id: crypto.randomUUID(), name: name.trim(), icon, fields });
    setName("");
    setIcon("package");
    setFields([]);
  };

  const updateField = (id: string, patch: Partial<CustomField>) => {
    setFields(fields.map((f) => f.id === id ? { ...f, ...patch } : f));
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t("new_type_title")} size="md">
      <Stack gap="md">
        <TextInput
          label={t("new_type_name_label")}
          placeholder={t("new_type_name_placeholder")}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <div>
          <Text size="sm" fw={500} mb={6}>{t("new_type_icon_label")}</Text>
          <Group gap="xs" wrap="wrap">
            {AVAILABLE_ICONS.map((ic) => (
              <Button
                key={ic}
                variant={icon === ic ? "filled" : "default"}
                size="xs"
                p={6}
                onClick={() => setIcon(ic)}
              >
                <CustomTypeIcon iconName={ic} size={16} />
              </Button>
            ))}
          </Group>
        </div>

        <div>
          <Text size="sm" fw={500} mb={4}>{t("new_type_fields_section")}</Text>
          <Text size="xs" c="dimmed" mb={8}>{t("new_type_fields_hint")}</Text>
          <Stack gap="xs">
            {fields.map((f) => (
              <Group key={f.id} align="flex-end" gap="xs">
                <TextInput
                  placeholder={t("new_type_field_name")}
                  value={f.name}
                  onChange={(e) => updateField(f.id, { name: e.currentTarget.value })}
                  style={{ flex: 1 }}
                  size="xs"
                />
                <Select
                  value={f.type}
                  onChange={(v) => updateField(f.id, { type: v as CustomField["type"] })}
                  data={[
                    { value: "text",   label: t("new_type_field_text") },
                    { value: "number", label: t("new_type_field_number") },
                    { value: "select", label: t("new_type_field_select") },
                  ]}
                  style={{ width: 140 }}
                  size="xs"
                />
                {f.type === "select" && (
                  <TextInput
                    placeholder={t("new_type_field_options")}
                    value={f.options?.join(", ") ?? ""}
                    onChange={(e) => updateField(f.id, { options: e.currentTarget.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    style={{ flex: 1 }}
                    size="xs"
                  />
                )}
                <Switch
                  label={t("new_type_field_required")}
                  checked={f.required}
                  onChange={(e) => updateField(f.id, { required: e.currentTarget.checked })}
                  size="xs"
                />
                <Button size="xs" color="red" variant="subtle" p={4} onClick={() => setFields(fields.filter((x) => x.id !== f.id))}>
                  <IconTrash size={13} />
                </Button>
              </Group>
            ))}
          </Stack>
          <Button size="xs" variant="default" leftSection={<IconPlus size={13} />} mt="xs" onClick={() => setFields([...fields, newField()])}>
            {t("new_type_add_field")}
          </Button>
        </div>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>{t("new_type_cancel")}</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>{t("new_type_create")}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
