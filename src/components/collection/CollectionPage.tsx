import { ActionIcon, Badge, Box, Button, Card, Checkbox, Group, Modal, Table, Text, TextInput, Stack, UnstyledButton, Switch, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBarcode, IconChevronDown, IconChevronUp, IconColumns, IconEdit, IconGripVertical, IconPlus, IconSelector, IconTrash, IconX } from "@tabler/icons-react";
import type { WritableAtom } from "jotai";
import { useAtom } from "jotai";
import { useMemo, useRef, useState, useEffect } from "react";
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
import type { MovieColumnSetting } from "@/state/atoms";

type CollectionKind = "books" | "comics" | "videogames" | "movies" | "music";

interface ColumnDef {
  key: string;
  label: string;
  width?: number;
  render?: (item: AnyItem) => React.ReactNode;
  getSearchValue?: (item: AnyItem) => string;
}

interface Props {
  title: string;
  singular: string;
  icon: React.ReactNode;
  atom: WritableAtom<AnyItem[], [AnyItem[]], void>;
  kind: CollectionKind;
  columns: ColumnDef[];
  titleWidth?: number;
  columnSettings?: MovieColumnSetting[];
  allColumnDefs?: { key: string; label: string }[];
  setColumnSettings?: (s: MovieColumnSetting[]) => void;
}

function ColumnsModal({ opened, onClose, settings, allDefs, onChange }: {
  opened: boolean;
  onClose: () => void;
  settings: MovieColumnSetting[];
  allDefs: { key: string; label: string }[];
  onChange: (s: MovieColumnSetting[]) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState<MovieColumnSetting[]>(settings);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => { if (opened) setDraft(settings); }, [opened]);

  const toggle = (key: string) =>
    setDraft((prev) => prev.map((s) => s.key === key ? { ...s, visible: !s.visible } : s));

  const onDragStart = (i: number) => { dragIndex.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === i) return;
    setDraft((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex.current!, 1);
      next.splice(i, 0, moved);
      dragIndex.current = i;
      return next;
    });
  };
  const onDragEnd = () => { dragIndex.current = null; };

  const getLabel = (key: string) => allDefs.find((d) => d.key === key)?.label ?? key;

  return (
    <Modal opened={opened} onClose={onClose} title={t("col_columns_title" as TranslationKey)} centered size="sm">
      <Stack gap="xs">
        <Text size="xs" c="dimmed">{t("col_columns_hint" as TranslationKey)}</Text>
        {draft.map((s, i) => (
          <Group
            key={s.key}
            gap="sm"
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDragEnd={onDragEnd}
            style={{ cursor: "grab", padding: "4px 8px", borderRadius: 6, background: "var(--mantine-color-default-hover)" }}
          >
            <IconGripVertical size={14} style={{ color: "var(--mantine-color-dimmed)", flexShrink: 0 }} />
            <Switch size="sm" checked={s.visible} onChange={() => toggle(s.key)} />
            <Text size="sm" style={{ flex: 1 }}>{getLabel(s.key)}</Text>
          </Group>
        ))}
        <Group justify="flex-end" mt="sm">
          <Button variant="default" size="xs" onClick={onClose}>{t("delete_cancel" as TranslationKey)}</Button>
          <Button size="xs" onClick={() => { onChange(draft); onClose(); }}>{t("common_apply" as TranslationKey)}</Button>
        </Group>
      </Stack>
    </Modal>
  );
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

const STATUS_KEY: Record<string, TranslationKey> = {
  unread: "status_unread", reading: "status_reading", read: "status_read",
  backlog: "status_backlog", playing: "status_playing", completed: "status_completed",
  dropped: "status_dropped", unwatched: "status_unwatched", watched: "status_watched",
  wishlist: "status_wishlist", owned: "status_owned", listened: "status_listened",
};

const FORMAT_KEY: Record<string, TranslationKey> = {
  digital: "format_digital", physical: "format_physical", streaming: "format_streaming",
  vinyl: "format_vinyl", cd: "format_cd", cassette: "format_cassette",
  "e-book": "format_ebook", ebook: "format_ebook", audiobook: "format_audiobook",
};

export function getStatusLabel(value: string, t: (k: TranslationKey) => string): string {
  const key = value.toLowerCase();
  return STATUS_KEY[key] ? t(STATUS_KEY[key]) : value;
}

export function getFormatLabel(value: string, t: (k: TranslationKey) => string): string {
  const key = value.toLowerCase();
  return FORMAT_KEY[key] ? t(FORMAT_KEY[key]) : value;
}

export function StatusBadge({ value }: { value?: string }) {
  const t = useT();
  if (!value) return <Text size="sm" c="dimmed">—</Text>;
  const key = value.toLowerCase();
  const color = STATUS_COLOR[key] ?? "gray";
  const label = STATUS_KEY[key] ? t(STATUS_KEY[key]) : value;
  return <Badge size="sm" color={color} variant="light">{label}</Badge>;
}

export function FormatBadge({ value }: { value?: string }) {
  const t = useT();
  if (!value) return <Text size="sm" c="dimmed">—</Text>;
  const key = value.toLowerCase();
  const color = FORMAT_COLOR[key] ?? "gray";
  const label = FORMAT_KEY[key] ? t(FORMAT_KEY[key]) : value;
  return <Badge size="sm" color={color} variant="dot">{label}</Badge>;
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

function normalize(s: string): string {
  return s
    .replace(/œ/g, "oe").replace(/Œ/g, "oe")
    .replace(/æ/g, "ae").replace(/Æ/g, "ae")
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

type SortKey = { key: string; dir: "asc" | "desc" };

export function CollectionPage({ title, singular, icon, atom, kind, columns, titleWidth, columnSettings, allColumnDefs, setColumnSettings }: Props) {
  const t = useT();
  const { formatNumber } = useFormatting();
  const [items, setItems] = useAtom(atom);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortKeys, setSortKeys] = useState<SortKey[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<AnyItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnyItem | null>(null);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<AnyItem | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [columnsOpen, setColumnsOpen] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const setFilter = (key: string, value: string) => {
    setColumnFilters((prev) => {
      if (!value) { const next = { ...prev }; delete next[key]; return next; }
      return { ...prev, [key]: value };
    });
  };

  const allColumns = [
    { key: "title", label: t("col_title" as TranslationKey), getSearchValue: undefined as ColumnDef["getSearchValue"] },
    ...columns,
  ];

  const filtered = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v.trim() !== "");
    if (activeFilters.length === 0) return items;
    return items.filter((item) => {
      return activeFilters.every(([key, q]) => {
        const col = allColumns.find((c) => c.key === key);
        const searchVal = col?.getSearchValue
          ? col.getSearchValue(item)
          : String(getValue(item, key));
        return normalize(searchVal).includes(normalize(q));
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, columnFilters]);

  const sorted = useMemo(() => sortKeys.length === 0 ? filtered : [...filtered].sort((a, b) => {
    for (const { key, dir } of sortKeys) {
      const av = getValue(a, key);
      const bv = getValue(b, key);
      if (av === bv) continue;
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { sensitivity: "base", ignorePunctuation: true });
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
    observeElementRect: (instance, cb) => {
      const el = instance.scrollElement;
      if (!el) return;
      const ro = new ResizeObserver(() => cb({ width: el.clientWidth, height: el.clientHeight }));
      ro.observe(el);
      cb({ width: el.clientWidth, height: el.clientHeight });
      return () => ro.disconnect();
    },
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
    const removed = items.filter((i) => selected.has(i.id));
    const remaining = items.filter((i) => !selected.has(i.id));
    setItems(remaining);
    setSelected(new Set());
    const notifId = crypto.randomUUID();
    notifications.show({
      id: notifId,
      message: (
        <Group justify="space-between" gap="xs">
          <Text size="sm">{t("collection_delete_selected_body", { count: formatNumber(removed.length) })}</Text>
          <Button size="compact-xs" variant="white" color="red" onClick={() => { setItems([...remaining, ...removed]); notifications.hide(notifId); }}>
            {t("undo")}
          </Button>
        </Group>
      ),
      color: "red",
      autoClose: 5000,
      withCloseButton: true,
    });
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

  const hasFilters = Object.values(columnFilters).some((v) => v.trim() !== "");
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
          {selected.size > 0 && (
            <Button size="xs" color="red" variant="subtle" leftSection={<IconTrash size={13} />} onClick={handleDeleteSelected}>
              {t("collection_delete_selected", { count: formatNumber(selected.size) })}
            </Button>
          )}
        </Group>
        <Group gap="xs">
          {columnSettings && setColumnSettings && allColumnDefs && (
            <Tooltip label={t("col_columns_title" as TranslationKey)}>
              <Button size="xs" variant="default" leftSection={<IconColumns size={14} />} onClick={() => setColumnsOpen(true)}>
                {t("col_columns_title" as TranslationKey)}
              </Button>
            </Tooltip>
          )}
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

      {/* Table */}
      <Card withBorder p={0} style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Box ref={parentRef} style={{ height: "100%", minHeight: 0, overflowY: "auto" }}>
          <Table style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 36 }} />
              <col style={{ width: 48 }} />
              <col style={titleWidth ? { width: titleWidth } : undefined} />
              {columns.map((col) => (
                <col key={col.key} style={{ width: col.width }} />
              ))}
              <col style={{ width: 72 }} />
            </colgroup>
            <Table.Thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--mantine-color-body)" }}>
              {/* Sort header row */}
              <Table.Tr>
                <Table.Th style={{ width: 36 }} />
                <Table.Th style={{ width: 48 }} />
                <Table.Th>
                  <UnstyledButton onClick={() => toggleSort("title")} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Text size="sm" fw={600} c={sortKeys.find(s => s.key === "title") ? "blue" : undefined}>{t("col_title" as TranslationKey)}</Text>
                    {getSortIcon("title")}
                    {sortKeys.findIndex((s) => s.key === "title") >= 0 && (
                      <Text size="xs" c="blue" fw={700}>{sortKeys.findIndex((s) => s.key === "title") + 1}</Text>
                    )}
                  </UnstyledButton>
                </Table.Th>
                {columns.map((col) => (
                  <Table.Th key={col.key} style={{ width: col.width }}>
                    <UnstyledButton onClick={() => toggleSort(col.key)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Text size="sm" fw={600} c={sortKeys.find(s => s.key === col.key) ? "blue" : undefined}>{col.label}</Text>
                      {getSortIcon(col.key)}
                      {sortKeys.findIndex((s) => s.key === col.key) >= 0 && (
                        <Text size="xs" c="blue" fw={700}>{sortKeys.findIndex((s) => s.key === col.key) + 1}</Text>
                      )}
                    </UnstyledButton>
                  </Table.Th>
                ))}
                <Table.Th style={{ width: 72 }} />
              </Table.Tr>
              {/* Per-column filter row */}
              <Table.Tr>
                <Table.Td style={{ width: 36 }} />
                <Table.Td style={{ width: 48 }} />
                <Table.Td>
                  <TextInput
                    size="xs"
                    placeholder={t("col_title" as TranslationKey)}
                    value={columnFilters["title"] ?? ""}
                    onChange={(e) => setFilter("title", e.currentTarget.value)}
                    rightSection={columnFilters["title"] ? <ActionIcon size="xs" variant="subtle" onClick={() => setFilter("title", "")}><IconX size={10} /></ActionIcon> : null}
                  />
                </Table.Td>
                {columns.map((col) => (
                  <Table.Td key={col.key} style={{ width: col.width }}>
                    <TextInput
                      size="xs"
                      placeholder={col.label}
                      value={columnFilters[col.key] ?? ""}
                      onChange={(e) => setFilter(col.key, e.currentTarget.value)}
                      rightSection={columnFilters[col.key] ? <ActionIcon size="xs" variant="subtle" onClick={() => setFilter(col.key, "")}><IconX size={10} /></ActionIcon> : null}
                    />
                  </Table.Td>
                ))}
                <Table.Td style={{ width: 72 }}>
                  {hasFilters && (
                    <ActionIcon size="sm" variant="subtle" color="red" title={t("filter_reset" as TranslationKey)} onClick={() => setColumnFilters({})}>
                      <IconX size={14} />
                    </ActionIcon>
                  )}
                </Table.Td>
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
                        style={{ minHeight: ROW_HEIGHT, cursor: "pointer" }}
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
                          <Text size="sm" fw={600} style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{(item as { title: string }).title}</Text>
                        </Table.Td>
                        {columns.map((col) => (
                          <Table.Td key={col.key} style={{ width: col.width }}>
                            {col.render
                              ? col.render(item)
                              : col.key === "rating"
                                ? <RatingStars rating={(item as unknown as Record<string, unknown>)[col.key] as number} />
                                : <Text size="sm" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{String((item as unknown as Record<string, unknown>)[col.key] ?? "")}</Text>
                            }
                          </Table.Td>
                        ))}
                        <Table.Td style={{ width: 36 }} onClick={(e) => e.stopPropagation()}>
                          <ActionIcon size="sm" variant="subtle" onClick={() => setEditItem(item)}><IconEdit size={14} /></ActionIcon>
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
      <DetailDrawer item={detailItem} opened={!!detailItem} onClose={() => setDetailItem(null)} onEdit={() => setEditItem(detailItem)} />

      {columnSettings && setColumnSettings && allColumnDefs && (
        <ColumnsModal
          opened={columnsOpen}
          onClose={() => setColumnsOpen(false)}
          settings={columnSettings}
          allDefs={allColumnDefs}
          onChange={setColumnSettings}
        />
      )}
    </Box>
  );
}
