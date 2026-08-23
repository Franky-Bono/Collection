import { ActionIcon, Box, Modal, Text, TextInput, Button, Group, Tooltip } from "@mantine/core";
import {
  IconBook, IconBook2, IconChevronDown, IconChevronLeft, IconChevronRight,
  IconDeviceGamepad2, IconLayoutDashboard, IconMovie, IconMusic,
  IconPlus, IconSettings, IconTrash, IconUpload,
} from "@tabler/icons-react";
import { useAtom, useAtomValue } from "jotai";
import {
  sidebarCollapsedAtom, customTypesAtom, trashedItemsAtom,
  subCollectionsAtom, sidebarExpandedAtom,
} from "@/state/atoms";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import * as styles from "./Sidebar.css";
import { useT } from "@/i18n/useT";
import { CustomTypeIcon } from "@/components/collection/CustomTypeIcon";
import type { CollectionKind } from "@/types";
import { useState } from "react";

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
  const location = useLocation();
  const binCount = useAtomValue(trashedItemsAtom).length;

  const [expandedKinds, setExpandedKinds] = useAtom(sidebarExpandedAtom);
  const [newSubOpen, setNewSubOpen] = useState(false);
  const [newSubKind, setNewSubKind] = useState<CollectionKind>("movies");
  const [newSubName, setNewSubName] = useState("");

  const isExpanded = (kind: CollectionKind) => expandedKinds.includes(kind);

  const toggleExpand = (kind: CollectionKind) => {
    setExpandedKinds(
      isExpanded(kind)
        ? expandedKinds.filter((k) => k !== kind)
        : [...expandedKinds, kind]
    );
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
    if (!isExpanded(newSubKind)) {
      setExpandedKinds([...expandedKinds, newSubKind]);
    }
    setNewSubOpen(false);
    navigate({ to: `/${newSubKind}/${id}` });
  };

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
      {CATEGORY_ITEMS.map(({ kind, to, icon, labelKey }) => {
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
          <Box key={kind}>
            {/* Category row */}
            <Box
              className={`${styles.categoryRow} ${isKindActive && !hasActiveSub ? styles.categoryRowActive : ""}`}
              onClick={() => {
                if (kindSubs.length === 0) {
                  navigate({ to });
                } else {
                  toggleExpand(kind);
                }
              }}
            >
              {icon}
              <span style={{ flex: 1 }}>{t(labelKey)}</span>
              {kindSubs.length > 0 && (
                <IconChevronDown
                  size={13}
                  className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
                />
              )}
            </Box>

            {/* Sub-collection links */}
            {expanded && kindSubs.length > 0 && kindSubs.map((sub) => {
              const subTo = `/${kind}/${sub.id}`;
              const isSubActive = location.pathname === subTo;
              return (
                <Link key={sub.id} to={subTo} style={{ textDecoration: "none" }}>
                  <Box className={`${styles.sublink} ${isSubActive ? styles.sublinkActive : ""}`}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sub.name}
                    </span>
                  </Box>
                </Link>
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
                    {!collapsed && <span>{ct.name}</span>}
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
