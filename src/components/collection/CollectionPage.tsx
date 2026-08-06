import { ActionIcon, Badge, Box, Button, Card, Checkbox, Group, Modal, Table, Text, TextInput, Select, Stack, UnstyledButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBarcode, IconChevronDown, IconChevronUp, IconEdit, IconPlus, IconSelector, IconTrash, IconX } from "@tabler/icons-react";
import type { WritableAtom } from "jotai";
import { useAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { AnyItem } from "@/types";
import { DeleteConfirm } from "./DeleteConfirm";
import { ItemForm } from "./ItemForm";
import { LookupModal } from "./LookupModal";
import { DetailDrawer } from "./DetailDrawer";
import { useT } from "@/i18n/useT";
import { fetchImageAsBase64 } from "@/lib/imageUtils";
import type { TranslationKey } from "@/i18n/translations";
import { useFormatting } from "@/hooks/useFormatting";

type CollectionKind = "books" | "comics" | "videogames" | "movies" | "music";

interface ColumnDef {
  key: string;
  label: string;
  width?: number;
  render?: (item: AnyItem) => React.ReactNode;
}

interface Props {
  title: string;
  singular: string;
  icon: React.ReactNode;
  atom: WritableAtom<AnyItem[], [AnyItem[]], void>;
  kind: CollectionKind;
  columns: ColumnDef[];
}

const STATUS_COLOR: Record<string, string> = {
  read: "green", reading: "blue", unread: "gray",
  watched: "green", watching: "blue", unwatched: "gray",
  completed: "green", playing: "blue", backlog: "gray",
  listened: "green", owned: "teal", wishlist: "yellow",
  dropped: "red",
};

const FORMAT_COLOR: Record<string, string> = {
  physical: "blue", digital: "grape", streaming: "cyan",
  vinyl: "orange", cd: "teal", cassette: "yellow",
  ebook: "violet", audiobook: "indigo",
};

export function StatusBadge({ value }: { value?: string }) {
  if (!value) return <Text size="sm" c="dimmed">—</Text>;
  const color = STATUS_COLOR[value.toLowerCase()] ?? "gray";
  return <Badge size="sm" color={color} variant="light">{value}</Badge>;
}

export function FormatBadge({ value }: { value?: string }) {
  if (!value) return <Text size="sm" c="dimmed">—</Text>;
  const color = FORMAT_COLOR[value.toLowerCase()] ?? "gray";
  return <Badge size="sm" color={color} variant="dot">{value}</Badge>;
}

function RatingStars({ rating }: { rating?: number }) {
  if (!rating) return <Text size="sm" c="dimmed">—</Text>;
  return <Text size="sm">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</Text>;
}

function getValue(item: AnyItem, key: string): string | number {
  const v = (item as unknown as Record<string, unknown>)[key];
  if (v === undefined || v === null) return "";
  return typeof v === "number" ? v : String(v).toLowerCase();
}

type SortKey = { key: string; dir: "asc" | "desc" };

export function CollectionPage({ title, singular, icon, atom, kind, columns }: Props) {
  const t = useT();
  const { formatNumber } = useFormatting();
  const [items, setItems] = useAtom(atom);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortKeys, setSortKeys] = useState<SortKey[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<AnyItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnyItem | null>(null);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<AnyItem | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteSelected, setDeleteSelected] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => { if ((item as unknown as Record<string, unknown>).status) set.add((item as unknown as Record<string, unknown>).status as string); });
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = !search || (item as unknown as { title: string }).title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || (item as unknown as Record<string, unknown>).status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const sorted = useMemo(() => sortKeys.length === 0 ? filtered : [...filtered].sort((a, b) => {
    for (const { key, dir } of sortKeys) {
      const av = getValue(a, key);
      const bv = getValue(b, key);
      if (av === bv) continue;
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return dir === "asc" ? cmp : -cmp;
    }
    return 0;
  }), [filtered, sortKeys]);

  const ROW_HEIGHT = 48;
  const rowVirtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const toggleSort = (key: string) => {
    setSortKeys((prev) => {
      const existing = prev.find((s) => s.key === key);
      if (!existing) return [...prev, { key, dir: "asc" }];
      if (existing.dir === "asc") return prev.map((s) => s.key === key ? { ...s, dir: "desc" } : s);
      return prev.filter((s) => s.key !== key);
    });
  };

  const getSortIcon = (key: string) => {
    const s = sortKeys.find((x) => x.key === key);
    if (!s) return <IconSelector size={12} />;
    return s.dir === "asc" ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />;
  };

  const handleAdd = async (item: AnyItem) => {
    let finalItem = item;
    if (item.coverUrl && item.coverUrl.startsWith("http")) {
      const base64 = await fetchImageAsBase64(item.coverUrl);
      finalItem = { ...item, coverUrl: base64 };
    }
    setItems([...items, finalItem]);
    notifications.show({ message: t("notif_added", { title: (item as { title: string }).title }), color: "green" });
  };

  const handleEdit = async (item: AnyItem) => {
    let finalItem = item;
    if (item.coverUrl && item.coverUrl.startsWith("http")) {
      const base64 = await fetchImageAsBase64(item.coverUrl);
      finalItem = { ...item, coverUrl: base64 };
    }
    setItems(items.map((i) => i.id === item.id ? finalItem : i));
    notifications.show({ message: t("notif_updated"), color: "blue" });
    setEditItem(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setItems(items.filter((i) => i.id !== deleteTarget.id));
    notifications.show({ message: t("notif_deleted"), color: "red" });
    setDeleteTarget(null);
  };

  const handleDeleteSelected = () => {
    setItems(items.filter((i) => !selected.has(i.id)));
    notifications.show({ message: t("notif_deleted"), color: "red" });
    setSelected(new Set());
    setDeleteSelected(false);
  };

  const handleLookupAdd = (partial: Partial<AnyItem>) => {
    const item: AnyItem = {
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
      title: "",
      ...partial,
    } as AnyItem;
    handleAdd(item);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Two arrays for virtualizer padding trick
  const items2 = rowVirtualizer.getVirtualItems();

  return (
    <Box p="xl" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          {icon}
          <Text fw={700} size="xl">{title}</Text>
          <Badge variant="light" color="blue" size="lg">
            {filtered.length < items.length ? `${formatNumber(filtered.length)} / ${formatNumber(items.length)}` : formatNumber(items.length)}
          </Badge>
        </Group>
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconBarcode size={16} />}
            onClick={() => setLookupOpen(true)}
          >
            {t("collection_search_barcode")}
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setAddOpen(true)}
          >
            {t("collection_add", { singular })}
          </Button>
        </Group>
      </Group>

      {/* Filters */}
      <Group mb="md" gap="sm">
        <TextInput
          placeholder={t("collection_search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: 300 }}
          rightSection={search ? <ActionIcon size="xs" variant="subtle" onClick={() => setSearch("")}><IconX size={12} /></ActionIcon> : null}
        />
        {statuses.length > 0 && (
          <Select
            placeholder={t("collection_all_statuses")}
            value={statusFilter}
            onChange={setStatusFilter}
            data={statuses}
            clearable
            style={{ width: 160 }}
          />
        )}
        {(search || statusFilter) && (
          <Button size="xs" variant="subtle" onClick={() => { setSearch(""); setStatusFilter(null); }}>
            {t("delete_cancel")}
          </Button>
        )}
        {selected.size > 0 && (
          <Button size="xs" color="red" variant="subtle" leftSection={<IconTrash size={13} />} onClick={() => setDeleteSelected(true)}>
            Delete {selected.size} selected
          </Button>
        )}
      </Group>

      {/* Table */}
      <Card withBorder p={0} style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Box ref={parentRef} style={{ height: "100%", overflowY: "auto" }}>
          <Table style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 36 }} />
              <col style={{ width: 48 }} />
              <col />
              {columns.map((col) => (
                <col key={col.key} style={{ width: col.width }} />
              ))}
              <col style={{ width: 72 }} />
            </colgroup>
            <Table.Thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--mantine-color-body)" }}>
              <Table.Tr>
                <Table.Th style={{ width: 36 }}>
                  <Checkbox
                    size="xs"
                    checked={selected.size === sorted.length && sorted.length > 0}
                    indeterminate={selected.size > 0 && selected.size < sorted.length}
                    onChange={() => {
                      if (selected.size === sorted.length) setSelected(new Set());
                      else setSelected(new Set(sorted.map((i) => i.id)));
                    }}
                  />
                </Table.Th>
                <Table.Th style={{ width: 48 }} />
                <Table.Th>
                  <UnstyledButton onClick={() => toggleSort("title")} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Text size="sm" fw={600}>{t("col_title" as TranslationKey)}</Text>
                    {getSortIcon("title")}
                    {sortKeys.findIndex((s) => s.key === "title") >= 0 && (
                      <Badge size="xs" circle variant="filled">{sortKeys.findIndex((s) => s.key === "title") + 1}</Badge>
                    )}
                  </UnstyledButton>
                </Table.Th>
                {columns.map((col) => (
                  <Table.Th key={col.key} style={{ width: col.width }}>
                    <UnstyledButton onClick={() => toggleSort(col.key)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Text size="sm" fw={600}>{col.label}</Text>
                      {getSortIcon(col.key)}
                      {sortKeys.findIndex((s) => s.key === col.key) >= 0 && (
                        <Badge size="xs" circle variant="filled">{sortKeys.findIndex((s) => s.key === col.key) + 1}</Badge>
                      )}
                    </UnstyledButton>
                  </Table.Th>
                ))}
                <Table.Th style={{ width: 72 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length + 4}>
                    <Text c="dimmed" size="sm" ta="center" py="xl">
                      {items.length === 0
                        ? t("collection_no_items", { title })
                        : t("collection_no_results")}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                <>
                  {items2.length > 0 && (
                    <Table.Tr style={{ height: items2[0].start }}>
                      <Table.Td colSpan={columns.length + 4} style={{ padding: 0, border: "none" }} />
                    </Table.Tr>
                  )}
                  {items2.map((vRow) => {
                    const item = sorted[vRow.index];
                    const cover = (item as unknown as Record<string, unknown>).coverUrl as string | undefined;
                    return (
                      <Table.Tr
                        key={item.id}
                        style={{ height: ROW_HEIGHT, cursor: "pointer" }}
                        onClick={() => setDetailItem(item)}
                      >
                        <Table.Td style={{ width: 36 }} onClick={(e) => e.stopPropagation()}>
                          <Checkbox size="xs" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} />
                        </Table.Td>
                        <Table.Td style={{ width: 48 }}>
                          {cover
                            ? <img src={cover} alt="" style={{ width: 28, height: 36, objectFit: "cover", borderRadius: 4 }} />
                            : <Box style={{ width: 28, height: 36, borderRadius: 4, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</Box>
                          }
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600} truncate>{(item as { title: string }).title}</Text>
                        </Table.Td>
                        {columns.map((col) => (
                          <Table.Td key={col.key} style={{ width: col.width }}>
                            {col.render
                              ? col.render(item)
                              : col.key === "rating"
                                ? <RatingStars rating={(item as unknown as Record<string, unknown>)[col.key] as number} />
                                : <Text size="sm" truncate>{String((item as unknown as Record<string, unknown>)[col.key] ?? "")}</Text>
                            }
                          </Table.Td>
                        ))}
                        <Table.Td style={{ width: 72 }} onClick={(e) => e.stopPropagation()}>
                          <Group gap={4}>
                            <ActionIcon size="sm" variant="subtle" onClick={() => setEditItem(item)}><IconEdit size={14} /></ActionIcon>
                            <ActionIcon size="sm" variant="subtle" color="red" onClick={() => setDeleteTarget(item)}><IconTrash size={14} /></ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {items2.length > 0 && (() => {
                    const last = items2[items2.length - 1];
                    const paddingBottom = rowVirtualizer.getTotalSize() - last.end;
                    return paddingBottom > 0 ? (
                      <Table.Tr style={{ height: paddingBottom }}>
                        <Table.Td colSpan={columns.length + 4} style={{ padding: 0, border: "none" }} />
                      </Table.Tr>
                    ) : null;
                  })()}
                </>
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Card>

      <ItemForm kind={kind} opened={addOpen} onClose={() => setAddOpen(false)} onSave={handleAdd} />
      {editItem && <ItemForm kind={kind} initial={editItem} opened={!!editItem} onClose={() => setEditItem(null)} onSave={handleEdit} />}
      <DeleteConfirm opened={!!deleteTarget} title={(deleteTarget as { title: string })?.title ?? ""} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <LookupModal kind={kind} opened={lookupOpen} onClose={() => setLookupOpen(false)} onAdd={handleLookupAdd} />
      <DetailDrawer item={detailItem} opened={!!detailItem} onClose={() => setDetailItem(null)} />

      <Modal opened={deleteSelected} onClose={() => setDeleteSelected(false)} title="Delete selected" centered size="sm">
        <Stack gap="md">
          <Text size="sm">Delete {selected.size} selected items? This cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteSelected(false)}>Cancel</Button>
            <Button color="red" onClick={handleDeleteSelected}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
