import { style } from "@vanilla-extract/css";

export const nav = style({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  padding: "0 12px",
  overflowX: "hidden",
});

export const navCollapsed = style({
  padding: "0 8px",
  alignItems: "center",
});

export const logo = style({
  padding: "16px 4px 20px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  marginBottom: 8,
  width: "100%",
});

export const link = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "9px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "#7a8fa6",
  fontWeight: 500,
  fontSize: "0.875rem",
  transition: "background 150ms ease, color 150ms ease",
  marginBottom: 2,
  width: "100%",
  ":hover": {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#c9d1e0",
  },
});

export const linkCollapsed = style({
  justifyContent: "center",
  padding: "9px",
  width: 42,
});

export const active = style({
  backgroundColor: "#2563eb",
  color: "#ffffff",
  ":hover": {
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
  },
});

export const indicator = style({
  width: 18,
  height: 18,
  borderRadius: "50%",
  backgroundColor: "#ef4444",
  color: "#fff",
  fontSize: 10,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "auto",
  flexShrink: 0,
});
