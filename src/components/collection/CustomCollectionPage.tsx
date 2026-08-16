import { ActionIcon, Badge, Box, Button, Group, Table, Text, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useAtom, useAtomValue } from "jotai";
import { customTypesAtom, makeCustomItemsAtom, trashedItemsAtom } from "@/state/atoms";
import { useMemo, useState } from "react";
import { DeleteConfirm } from "./DeleteConfirm";
import { useT } from "@/i18n/useT";
import type { CustomItem, CustomField } from "@/types";

interface Props {
  typeId: string;
}

function ItemModal({ fields, initial, onSave, onCancel }: {
  fields: CustomField[];
  initial?: CustomItem;
  onSave: (item: CustomItem) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = { title: initial?.title ?? "" };
    fields.forEach((f) => { v[f.id] = String((initial as Record<string, unknown>)?.[f.id] ?? ""); });
    return v;
  });

  const handleSave = () => {
    const item: CustomItem = {
      id: initial?.id ?? crypto.randomUUID(),
      title: values.title,
      addedAt: initial?.addedAt ?? new Date().toISOString(),
    };
    fields.forEach((f) => {
      if (values[f.id]) {
        (item as Record<string, unknown>)[f.id] = f.type === "number" ? Number(values[f.id]) : values[f.id];
      }
    });
    onSave(item);
  };

  return (
    <Box>
      <TextInput label="Title" value={values.title} onChange={(e) => setValues({ ...values, title: e.currentTarget.value })} required mb="xs" />
      {fields.map((f) => (
        <TextInput key={f.id} label={f.name} value={values[f.id] ?? ""} onChange={(e) => setValues({ ...values, [f.id]: e.currentTarget.value })} mb="xs" required={f.required} />
      ))}
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCancel}>{t("form_cancel")}</Button>
        <Button onClick={handleSave} disabled={!values.title}>{t("form_save")}</Button>
      </Group>
    </Box>
  );
}

export function CustomCollectionPage({ typeId }: Props) {
  const t = useT();
  const customTypes = useAtomValue(customTypesAtom);
  const collectionType = customTypes.find((ct) => ct.id === typeId);
  const itemsAtom = useMemo(() => makeCustomItemsAtom(typeId), [typeId]);
  const [items, setItems] = useAtom(itemsAtom);
  const [trashed, setTrashed] = useAtom(trashedItemsAtom);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<CustomItem | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomItem | null>(null);

  if (!collectionType) return <Text p="xl" c="dimmed">Collection not found.</Text>;

  const visibleItems = items.filter((i) => !trashed.some((e) => e.typeId === typeId && e.item.id === i.id));
  const filtered = visibleItems.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (item: CustomItem) => {
    if (editItem === "new") {
      setItems([...items, item]);
      notifications.show({ message: t("notif_added", { title: item.title }), color: "green" });
    } else {
      setItems(items.map((i) => i.id === item.id ? item : i));
      notifications.show({ message: t("notif_updated"), color: "blue" });
    }
    setEditItem(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setTrashed([...trashed, { item: deleteTarget, kind: typeId, typeId, deletedAt: new Date().toISOString() }]);
    setItems(items.filter((i) => i.id !== deleteTarget.id));
    notifications.show({ message: t("notif_trashed"), color: "orange" });
    setDeleteTarget(null);
  };

  return (
    <Box p="xl" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <Title order={3}>{collectionType.name}</Title>
          <Badge variant="light" color="blue" size="lg">{filtered.length}</Badge>
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setEditItem("new")}>
          {t("collection_add", { singular: collectionType.name })}
        </Button>
      </Group>

      <TextInput
        placeholder={t("collection_search_placeholder")}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
        style={{ maxWidth: 300 }}
      />

      {editItem !== null && (
        <Box mb="md" p="md" style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}>
          <Text fw={600} mb="sm">{editItem === "new" ? t("form_add") : t("form_edit")}</Text>
          <ItemModal
            fields={collectionType.fields}
            initial={editItem === "new" ? undefined : editItem}
            onSave={handleSave}
            onCancel={() => setEditItem(null)}
          />
        </Box>
      )}

      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("col_title")}</Table.Th>
            {collectionType.fields.map((f) => <Table.Th key={f.id}>{f.name}</Table.Th>)}
            <Table.Th style={{ width: 80 }} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filtered.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={collectionType.fields.length + 2}>
                <Text c="dimmed" size="sm" ta="center" py="xl">
                  {visibleItems.length === 0 ? t("collection_no_items", { title: collectionType.name }) : t("collection_no_results")}
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            filtered.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td><Text size="sm" fw={500}>{item.title}</Text></Table.Td>
                {collectionType.fields.map((f) => (
                  <Table.Td key={f.id}>
                    <Text size="sm">{String((item as Record<string, unknown>)[f.id] ?? "")}</Text>
                  </Table.Td>
                ))}
                <Table.Td>
                  <ActionIcon size="sm" variant="subtle" onClick={() => setEditItem(item)}><IconEdit size={14} /></ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      <DeleteConfirm
        opened={!!deleteTarget}
        title={deleteTarget?.title ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
