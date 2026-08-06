import { createTheme } from "@mantine/core";
import { themeToVars } from "@mantine/vanilla-extract";

export const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  defaultRadius: "md",
  colors: {
    dark: [
      "#b8c7d8",
      "#8899b4",
      "#566a8a",
      "#3d5272",
      "#2a3650",
      "#1e2840",
      "#1a2235",
      "#111827",
      "#0d1420",
      "#090e17",
    ],
  },
});

export const vars = themeToVars(theme);
