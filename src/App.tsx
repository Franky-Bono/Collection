import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/styles/theme";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { useAtomValue } from "jotai";
import { colorSchemeAtom, appPasswordHashAtom } from "@/state/atoms";
import { LockScreen } from "@/components/auth/LockScreen";

const router = createRouter({ routeTree });

function AppInner() {
  const passwordHash = useAtomValue(appPasswordHashAtom);
  if (passwordHash) return <LockScreen hash={passwordHash} />;
  return <RouterProvider router={router} />;
}

export default function App() {
  const colorScheme = useAtomValue(colorSchemeAtom);
  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      <ColorSchemeScript forceColorScheme={colorScheme} />
      <Notifications />
      <AppInner />
    </MantineProvider>
  );
}
