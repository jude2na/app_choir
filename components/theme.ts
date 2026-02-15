// Centralized theme for consistent styling
export const theme = {
  colors: {
    background: "#0D0F14",
    surface: "#141821",
    surfaceAlt: "#1A1F2B",
    primary: "#6C5CE7",
    secondary: "#00D2D3",
    accent: "#F59E0B",
    text: "#EAEAF0",
    muted: "#9AA0A6",
    border: "#202533",
    success: "#10B981",
    danger: "#EF4444",
  },
  spacing: (n: number) => n * 8,
  radius: { sm: 8, md: 14, lg: 20, pill: 999 },
  typography: {
    title: { fontSize: 18, fontWeight: "700" as const },
    subtitle: { fontSize: 14, color: "#9AA0A6" },
    body: { fontSize: 15, color: "#EAEAF0" },
    caption: { fontSize: 12, color: "#9AA0A6" },
    h1: { fontSize: 28, fontWeight: "800" as const, color: "#EAEAF0" },
    h2: { fontSize: 22, fontWeight: "700" as const, color: "#EAEAF0" },
  },
  shadow: {
    md: { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
    lg: { shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 14, elevation: 10 },
  },
};

export function initialsFromName(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts[1]?.[0] ?? "";
  return (first + last || first || "?").toUpperCase();
}

export function colorFromString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 45%)`;
}
