import { AppShell } from "@mantine/core";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAtomValue } from "jotai";
import { sidebarCollapsedAtom } from "@/state/atoms";
import { useDriveSync } from "@/hooks/useDriveSync";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const collapsed = useAtomValue(sidebarCollapsedAtom);
  const sidebarWidth = collapsed ? 60 : 240;
  useDriveSync();

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
