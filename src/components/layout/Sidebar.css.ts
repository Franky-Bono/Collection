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

export const categoryRow = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "9px 12px",
  borderRadius: 10,
  color: "#7a8fa6",
  fontWeight: 500,
  fontSize: "0.875rem",
  transition: "background 150ms ease, color 150ms ease",
  marginBottom: 2,
  width: "100%",
  cursor: "pointer",
  userSelect: "none",
  ":hover": {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#c9d1e0",
  },
});

export const categoryRowActive = style({
  backgroundColor: "#2563eb",
  color: "#ffffff",
  ":hover": {
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
  },
});

export const chevron = style({
  marginLeft: "auto",
  transition: "transform 200ms ease",
  flexShrink: 0,
});

export const chevronOpen = style({
  transform: "rotate(180deg)",
});

export const sublink = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 12px 7px 36px",
  borderRadius: 8,
  textDecoration: "none",
  color: "#7a8fa6",
  fontWeight: 400,
  fontSize: "0.82rem",
  transition: "background 150ms ease, color 150ms ease",
  marginBottom: 1,
  width: "100%",
  ":hover": {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#c9d1e0",
  },
});

export const sublinkActive = style({
  backgroundColor: "rgba(37,99,235,0.18)",
  color: "#93c5fd",
  ":hover": {
    backgroundColor: "rgba(37,99,235,0.25)",
    color: "#bfdbfe",
  },
});

export const newSubBtn = style({
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 12px 5px 36px",
  borderRadius: 8,
  color: "#4b6a8a",
  fontWeight: 400,
  fontSize: "0.78rem",
  transition: "background 150ms ease, color 150ms ease",
  marginBottom: 4,
  width: "100%",
  cursor: "pointer",
  background: "none",
  border: "none",
  ":hover": {
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#93c5fd",
  },
});
