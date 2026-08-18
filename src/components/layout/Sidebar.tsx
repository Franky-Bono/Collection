import { ActionIcon, Box, NavLink, Text, Tooltip } from "@mantine/core";
import {
  IconBook, IconBook2, IconChevronLeft, IconChevronRight,
  IconDeviceGamepad2, IconLayoutDashboard, IconMovie, IconMusic,
  IconSettings, IconTrash, IconUpload,
} from "@tabler/icons-react";
import { useAtom, useAtomValue } from "jotai";
import { sidebarCollapsedAtom, customTypesAtom, trashedItemsAtom } from "@/state/atoms";
import { Link, useLocation } from "@tanstack/react-router";
import * as styles from "./Sidebar.css";
import { useT } from "@/i18n/useT";
import { CustomTypeIcon } from "@/components/collection/CustomTypeIcon";

const NAV_ITEMS = [
  { to: "/",           icon: <IconLayoutDashboard size={18} />, labelKey: "nav_dashboard" as const },
  { to: "/movies",     icon: <IconMovie size={18} />,           labelKey: "nav_movies" as const },
  { to: "/books",      icon: <IconBook size={18} />,            labelKey: "nav_books" as const },
  { to: "/music",      icon: <IconMusic size={18} />,           labelKey: "nav_music" as const },
  { to: "/comics",     icon: <IconBook2 size={18} />,           labelKey: "nav_comics" as const },
  { to: "/videogames", icon: <IconDeviceGamepad2 size={18} />,  labelKey: "nav_videogames" as const },
];

const BOTTOM_ITEMS = [
  { to: "/settings", icon: <IconSettings size={18} />, labelKey: "nav_settings" as const },
];

export function Sidebar() {
  const t = useT();
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);
  const customTypes = useAtomValue(customTypesAtom);
  const location = useLocation();
  const binCount = useAtomValue(trashedItemsAtom).length;

  return (
    <Box className={`${styles.nav} ${collapsed ? styles.navCollapsed : ""}`}>
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

      {NAV_ITEMS.map(({ to, icon, labelKey }) => {
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
    </Box>
  );
}
