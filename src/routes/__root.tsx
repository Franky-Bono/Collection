import { AppShell, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAtomValue } from "jotai";
import { sidebarCollapsedAtom, driveSyncEnabledAtom, drivePendingAtom } from "@/state/atoms";
import { useDriveSync } from "@/hooks/useDriveSync";
import { useEffect, useRef } from "react";

export const Route = createRootRoute({
  component: RootLayout,
});

const NOTIF_ID = "drive-pending-sync";

function RootLayout() {
  const collapsed = useAtomValue(sidebarCollapsedAtom);
  const sidebarWidth = collapsed ? 60 : 240;
  const enabled = useAtomValue(driveSyncEnabledAtom);
  const hasPending = useAtomValue(drivePendingAtom);
  const { syncNow } = useDriveSync();
  const wasShownRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (hasPending && !wasShownRef.current) {
      wasShownRef.current = true;
      notifications.show({
        id: NOTIF_ID,
        title: "Unsaved changes",
        message: <Button size="xs" variant="white" color="orange" onClick={() => { syncNow(); notifications.hide(NOTIF_ID); }}>Sync Now</Button>,
        color: "orange",
        autoClose: false,
      });
    } else if (!hasPending && wasShownRef.current) {
      wasShownRef.current = false;
      notifications.hide(NOTIF_ID);
    }
  }, [hasPending, enabled, syncNow]);

  return (
    <AppShell
      navbar={{ width: sidebarWidth, breakpoint: "sm" }}
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <AppShell.Navbar style={{ width: sidebarWidth, transition: "width 200ms ease" }}>
        <Sidebar />
      </AppShell.Navbar>
      <AppShell.Main style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
