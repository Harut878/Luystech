// LuysTech գունային պալիտրա — dark / light
export type Palette = Record<string, string>;

export function palette(theme: "dark" | "light"): Palette {
  if (theme === "light") {
    return {
      bg: "#ffffff", bg2: "#f3f5fa", card: "#ffffff", cardSolid: "#ffffff",
      border: "#e5e8f0", text: "#141b2e", dim: "#4c5673", faint: "#8891a6",
      blue: "#4f63c4", cyan: "#4f84b8", emerald: "#059669", yellow: "#d9a300",
      glow: "rgba(79,99,196,0.10)", navbg: "rgba(255,255,255,0.85)",
    };
  }
  return {
    bg: "#0c1020", bg2: "#121829", card: "rgba(255,255,255,0.035)", cardSolid: "#141b2e",
    border: "rgba(255,255,255,0.09)", text: "#f6f8fc", dim: "#9aa3bd", faint: "#636c86",
    blue: "#6475e8", cyan: "#6aa6d6", emerald: "#34d399", yellow: "#f0c75e",
    glow: "rgba(100,117,232,0.26)", navbg: "rgba(12,16,32,0.74)",
  };
}
