// Design tokens shared by web (Tailwind) and mobile (NativeWind). /design replaces these values and documents them in DESIGN.md.
export const tokens = {
  color: {
    background: "#ffffff",
    foreground: "#0a0a0a",
    muted: "#6b7280",
    accent: "#2563eb",
    danger: "#dc2626",
  },
  radius: { sm: 4, md: 8, lg: 16 },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
  motion: { fast: 120, base: 200, slow: 400 },
} as const;
