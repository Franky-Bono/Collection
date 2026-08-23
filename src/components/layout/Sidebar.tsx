import { ActionIcon, Box, Modal, Text, TextInput, Button, Group, Tooltip } from "@mantine/core";
import {
  IconBook, IconBook2, IconChevronDown, IconChevronLeft, IconChevronRight,
  IconDeviceGamepad2, IconGripVertical, IconLayoutDashboard, IconMovie, IconMusic,
  IconPlus, IconSettings, IconTrash, IconUpload,
} from "@tabler/icons-react";
import { useAtom, useAtomValue } from "jotai";
import {
  sidebarCollapsedAtom, customTypesAtom, trashedItemsAtom,
  subCollectionsAtom, sidebarExpandedAtom, subCollectionItemsAtom,
  booksAtom, comicsAtom, videoGamesAtom, moviesAtom, musicAtom, customItemsAtom,
  categoryOrderAtom,
} from "@/state/atoms";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import * as styles from "./Sidebar.css";
import { useT } from "@/i18n/useT";
import { CustomTypeIcon } from "@/components/collection/CustomTypeIcon";
import type { CollectionKind } from "@/types";
import { useRef, useState } from "react";

interface CategoryNavItem {
  kind: CollectionKind;
  to: string;
  icon: React.ReactNode;
  labelKey: "nav_movies" | "nav_books" | "nav_music" | "nav_comics" | "nav_videogames";
}

const CATEGORY_ITEMS: CategoryNavItem[] = [
  { kind: "movies",     to: "/movies",     icon: <IconMovie size={18} />,           labelKey: "nav_movies" },
  { kind: "books",      to: "/books",      icon: <IconBook size={18} />,            labelKey: "nav_books" },
  { kind: "music",      to: "/music",      icon: <IconMusic size={18} />,           labelKey: "nav_music" },
  { kind: "comics",     to: "/comics",     icon: <IconBook2 size={18} />,           labelKey: "nav_comics" },
  { kind: "videogames", to: "/videogames", icon: <IconDeviceGamepad2 size={18} />,  labelKey: "nav_videogames" },
];

const BOTTOM_ITEMS = [
  { to: "/settings", icon: <IconSettings size={18} />, labelKey: "nav_settings" as const },
];

export function Sidebar() {
  const t = useT();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);
  const customTypes = useAtomValue(customTypesAtom);
  const [subCollections, setSubCollections] = useAtom(subCollectionsAtom);
  const subCollectionItemsMap = useAtomValue(subCollectionItemsAtom);
  const books = useAtomValue(booksAtom);
  const comics = useAtomValue(comicsAtom);
  const videoGames = useAtomValue(videoGamesAtom);
  const movies = useAtomValue(moviesAtom);
  const music = useAtomValue(musicAtom);
  const customItems = useAtomValue(customItemsAtom);
  const [categoryOrder, setCategoryOrder] = useAtom(categoryOrderAtom);

  const collectionCounts: Record<string, number> = {
    books:      (books      ?? []).length,
    comics:     (comics     ?? []).length,
    videogames: (videoGames ?? []).length,
    movies:     (movies     ?? []).length,
    music:      (music      ?? []).length,
  };
  const location = useLocation();
  const binCount = useAtomValue(trashedItemsAtom).length;

  const [expandedKinds, setExpandedKinds] = useAtom(sidebarExpandedAtom);
  const [newSubOpen, setNewSubOpen] = useState(false);
  const [newSubKind, setNewSubKind] = useState<CollectionKind>("movies");
  const [newSubName, setNewSubName] = useState("");

  // Drag state for category reordering
  const catDragIndex = useRef<number | null>(null);
  // Drag state for sub-collection reordering: "kind:index"
  const subDragKey = useRef<{ kind: CollectionKind; index: number } | null>(null);

  const orderedCategories = CATEGORY_ITEMS.slice().sort((a, b) => {
    const ai = categoryOrder.indexOf(a.kind);
    const bi = categoryOrder.indexOf(b.kind);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const isExpanded = (kind: CollectionKind) => {
    const kindSubs = subCollections.filter((s) => s.kind === kind);
    if (kindSubs.length > 0 && !expandedKinds.includes(`collapsed:${kind}`)) return true;
    return expandedKinds.includes(kind);
  };

  const toggleExpand = (kind: CollectionKind) => {
    const kindSubs = subCollections.filter((s) => s.kind === kind);
    if (kindSubs.length > 0) {
      const collapseKey = `collapsed:${kind}`;
      const expandKey = kind;
      if (isExpanded(kind)) {
        setExpandedKinds([...expandedKinds.filter((k) => k !== expandKey), collapseKey]);
      } else {
        setExpandedKinds(expandedKinds.filter((k) => k !== collapseKey));
      }
    } else {
      setExpandedKinds(
        expandedKinds.includes(kind)
          ? expandedKinds.filter((k) => k !== kind)
          : [...expandedKinds, kind]
      );
    }
  };

  const openNewSub = (kind: CollectionKind) => {
    setNewSubKind(kind);
    setNewSubName("");
    setNewSubOpen(true);
  };

  const handleCreateSub = () => {
    if (!newSubName.trim()) return;
    const id = crypto.randomUUID();
    setSubCollections((prev) => [
      ...prev,
      { id, kind: newSubKind, name: newSubName.trim(), createdAt: new Date().toISOString() },
    ]);
    setNewSubOpen(false);
    navigate({ to: `/${newSubKind}/${id}` });
  };

  // Category drag handlers
  const onCatDragStart = (i: number) => { catDragIndex.current = i; };
  const onCatDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (catDragIndex.current === null || catDragIndex.current === i) return;
    setCategoryOrder((prev) => {
      const ordered = CATEGORY_ITEMS.slice().sort((a, b) => {
        const ai = prev.indexOf(a.kind); const bi = prev.indexOf(b.kind);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      }).map((c) => c.kind);
      const next = [...ordered];
      const [moved] = next.splice(catDragIndex.current!, 1);
      next.splice(i, 0, moved);
      catDragIndex.current = i;
      return next;
    });
  };
  const onCatDragEnd = () => { catDragIndex.current = null; };

  // Sub-collection drag handlers
  const onSubDragStart = (kind: CollectionKind, index: number) => { subDragKey.current = { kind, index }; };
  const onSubDragOver = (e: React.DragEvent, kind: CollectionKind, index: number) => {
    e.preventDefault();
    if (!subDragKey.current || subDragKey.current.kind !== kind || subDragKey.current.index === index) return;
    setSubCollections((prev) => {
      const kindSubs = prev.filter((s) => s.kind === kind);
      const others = prev.filter((s) => s.kind !== kind);
      const next = [...kindSubs];
      const [moved] = next.splice(subDragKey.current!.index, 1);
      next.splice(index, 0, moved);
      subDragKey.current = { kind, index };
      return [...others, ...next];
    });
  };
  const onSubDragEnd = () => { subDragKey.current = null; };

  return (
    <Box className={`${styles.nav} ${collapsed ? styles.navCollapsed : ""}`}>
      {/* Logo / collapse toggle */}
      <Box className={styles.logo} style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && <Text fw={700} size="sm" style={{ color: "var(--mantine-color-blue-4)" }}>Collection</Text>}
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? t("nav_expand") : t("nav_collapse")}
        >
          {collapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
        </ActionIcon>
      </Box>

      {/* Dashboard */}
      <Tooltip label={t("nav_dashboard")} disabled={!collapsed} position="right" withArrow>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Box className={`${styles.link} ${collapsed ? styles.linkCollapsed : ""} ${location.pathname === "/" ? styles.active : ""}`}>
            <IconLayoutDashboard size={18} />
            {!collapsed && <span>{t("nav_dashboard")}</span>}
          </Box>
        </Link>
      </Tooltip>

      {/* Expandable category items */}
      {orderedCategories.map(({ kind, to, icon, labelKey }, catIdx) => {
        const kindSubs = subCollections.filter((s) => s.kind === kind);
        const expanded = isExpanded(kind);
        const isKindActive = location.pathname === to;
        const hasActiveSub = location.pathname.startsWith(`/${kind}/`);

        if (collapsed) {
          return (
            <Tooltip key={kind} label={t(labelKey)} position="right" withArrow>
              <Link to={to} style={{ textDecoration: "none" }}>
                <Box className={`${styles.link} ${styles.linkCollapsed} ${isKindActive || hasActiveSub ? styles.active : ""}`}>
                  {icon}
                </Box>
              </Link>
            </Tooltip>
          );
        }

        return (
          <Box
            key={kind}
            draggable
            onDragStart={() => onCatDragStart(catIdx)}
            onDragOver={(e) => onCatDragOver(e, catIdx)}
            onDragEnd={onCatDragEnd}
          >
            {/* Category row */}
            <Box
              className={`${styles.categoryRow} ${isKindActive && !hasActiveSub ? styles.categoryRowActive : ""}`}
              onClick={() => navigate({ to })}
              style={{ display: "flex", alignItems: "center" }}
            >
              <IconGripVertical size={12} style={{ color: "var(--mantine-color-dimmed)", flexShrink: 0, marginRight: 4, cursor: "grab" }} />
              {icon}
              <span style={{ flex: 1, marginLeft: 6 }}>{t(labelKey)}</span>
              <Text size="xs" c="dimmed" style={{ marginRight: kindSubs.length > 0 ? 0 : 4 }}>
                ({collectionCounts[kind] ?? 0})
              </Text>
              {kindSubs.length > 0 && (
                <Box
                  component="span"
                  onClick={(e) => { e.stopPropagation(); toggleExpand(kind); }}
                  style={{ display: "flex", alignItems: "center", padding: "2px 2px 2px 6px" }}
                >
                  <IconChevronDown
                    size={13}
                    className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
                  />
                </Box>
              )}
            </Box>

            {/* Sub-collection links */}
            {expanded && kindSubs.length > 0 && kindSubs.map((sub, subIdx) => {
              const subTo = `/${kind}/${sub.id}`;
              const isSubActive = location.pathname === subTo;
              return (
                <Box
                  key={sub.id}
                  draggable
                  onDragStart={(e) => { e.stopPropagation(); onSubDragStart(kind, subIdx); }}
                  onDragOver={(e) => { e.stopPropagation(); onSubDragOver(e, kind, subIdx); }}
                  onDragEnd={(e) => { e.stopPropagation(); onSubDragEnd(); }}
                >
                  <Link to={subTo} style={{ textDecoration: "none" }}>
                    <Box className={`${styles.sublink} ${isSubActive ? styles.sublinkActive : ""}`} style={{ display: "flex", alignItems: "center" }}>
                      <IconGripVertical size={11} style={{ color: "var(--mantine-color-dimmed)", flexShrink: 0, marginRight: 4, cursor: "grab" }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {sub.name}
                      </span>
                      <Text size="xs" c="dimmed">({(subCollectionItemsMap?.[sub.id] ?? []).length})</Text>
                    </Box>
                  </Link>
                </Box>
              );
            })}

            {/* + New collection button */}
            {expanded && (
              <button className={styles.newSubBtn} onClick={() => openNewSub(kind)}>
                <IconPlus size={12} />
                {t("sub_new")}
              </button>
            )}

            {/* Show + New when no subs yet but category is the active page */}
            {!expanded && kindSubs.length === 0 && isKindActive && (
              <button className={styles.newSubBtn} onClick={() => openNewSub(kind)}>
                <IconPlus size={12} />
                {t("sub_new")}
              </button>
            )}
          </Box>
        );
      })}

      {/* Custom collection types */}
      {customTypes.length > 0 && (
        <>
          {!collapsed && (
            <Text size="xs" c="dimmed" px="xs" pt="md" pb={4} fw={600} style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("nav_custom_section")}
            </Text>
          )}
          {customTypes.map((ct) => {
            const to = `/custom/${ct.id}`;
            const isActive = location.pathname === to;
            return (
              <Tooltip key={ct.id} label={ct.name} disabled={!collapsed} position="right" withArrow>
                <Link to={to} style={{ textDecoration: "none" }}>
                  <Box className={`${styles.link} ${collapsed ? styles.linkCollapsed : ""} ${isActive ? styles.active : ""}`}>
                    <CustomTypeIcon iconName={ct.icon} size={18} />
                    {!collapsed && <span style={{ flex: 1 }}>{ct.name}</span>}
                    {!collapsed && <Text size="xs" c="dimmed">({(customItems?.[ct.id] ?? []).length})</Text>}
                  </Box>
                </Link>
              </Tooltip>
            );
          })}
        </>
      )}

      {/* Bottom nav */}
      <Box style={{ marginTop: "auto" }}>
        <Tooltip label={t("nav_bin")} disabled={!collapsed} position="right" withArrow>
          <Link to="/bin" style={{ textDecoration: "none" }}>
            <Box className={`${styles.link} ${collapsed ? styles.linkCollapsed : ""} ${location.pathname === "/bin" ? styles.active : ""}`} style={{ position: "relative" }}>
              <IconTrash size={18} />
              {!collapsed && <span style={{ flex: 1 }}>{t("nav_bin")}</span>}
              {binCount > 0 && (
                <span className={styles.indicator}>{binCount > 99 ? "99+" : binCount}</span>
              )}
            </Box>
          </Link>
        </Tooltip>
        <Tooltip label={t("nav_import")} disabled={!collapsed} position="right" withArrow>
          <Link to="/import" style={{ textDecoration: "none" }}>
            <Box className={`${styles.link} ${collapsed ? styles.linkCollapsed : ""} ${location.pathname === "/import" ? styles.active : ""}`}>
              <IconUpload size={18} />
              {!collapsed && <span>{t("nav_import")}</span>}
            </Box>
          </Link>
        </Tooltip>
        {BOTTOM_ITEMS.map(({ to, icon, labelKey }) => {
          const isActive = location.pathname === to;
          return (
            <Tooltip key={to} label={t(labelKey)} disabled={!collapsed} position="right" withArrow>
              <Link to={to} style={{ textDecoration: "none" }}>
                <Box className={`${styles.link} ${collapsed ? styles.linkCollapsed : ""} ${isActive ? styles.active : ""}`}>
                  {icon}
                  {!collapsed && <span>{t(labelKey)}</span>}
                </Box>
              </Link>
            </Tooltip>
          );
        })}
      </Box>

      {/* New sub-collection modal */}
      <Modal opened={newSubOpen} onClose={() => setNewSubOpen(false)} title={t("sub_new_title")} centered size="sm">
        <TextInput
          label={t("sub_name_label")}
          placeholder={t("sub_name_placeholder")}
          value={newSubName}
          onChange={(e) => setNewSubName(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateSub()}
          data-autofocus
        />
        <Group justify="flex-end" mt="md" gap="xs">
          <Button variant="default" size="xs" onClick={() => setNewSubOpen(false)}>{t("sub_cancel")}</Button>
          <Button size="xs" onClick={handleCreateSub} disabled={!newSubName.trim()}>{t("sub_create")}</Button>
        </Group>
      </Modal>
    </Box>
  );
}
