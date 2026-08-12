import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider, ColorSchemeScript, useMantineColorScheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/styles/theme";
import { RouterProvider, createRouter, createHashHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { useAtomValue } from "jotai";
import { useState, useEffect } from "react";
import { colorSchemeAtom, appPasswordHashAtom } from "@/state/atoms";
import { LockScreen } from "@/components/auth/LockScreen";

const router = createRouter({ routeTree, history: createHashHistory() });

function AppInner() {
  const passwordHash = useAtomValue(appPasswordHashAtom);
  const [unlocked, setUnlocked] = useState(!passwordHash);

  if (passwordHash && !unlocked) return <LockScreen hash={passwordHash} onUnlock={() => setUnlocked(true)} />;
  return <RouterProvider router={router} />;
}

function ColorSchemeSync() {
  const colorScheme = useAtomValue(colorSchemeAtom);
  const { setColorScheme } = useMantineColorScheme();
  useEffect(() => { setColorScheme(colorScheme); }, [colorScheme]);
  return null;
}

export default function App() {
  const colorScheme = useAtomValue(colorSchemeAtom);
  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <ColorSchemeScript defaultColorScheme={colorScheme} />
      <ColorSchemeSync />
      <Notifications />
      <AppInner />
    </MantineProvider>
  );
}
