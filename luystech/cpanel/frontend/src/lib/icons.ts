import type { IconKey } from "./types";

// SVG icon-ների սահմանումներ (path-եր + circle-ներ), 24x24 viewBox, stroke-based
export type IconDef = { p: string[]; c: { x: number; y: number; r: number }[] };

export const ICONS: Record<IconKey, IconDef> = {
  trend: { p: ["M3 16l5-5 3 3 8-8", "M17 6h4v4"], c: [] },
  cart: { p: ["M2 4h2l2.2 11a1 1 0 0 0 1 .8h9a1 1 0 0 0 1-.8L20 7H5"], c: [{ x: 9, y: 20, r: 1.3 }, { x: 17, y: 20, r: 1.3 }] },
  box: { p: ["M12 3l9 5v8l-9 5-9-5V8z", "M3 8l9 5 9-5", "M12 13v8"], c: [] },
  factory: { p: ["M3 21V10l5 3V10l5 3V10l5 3v8z", "M3 21h18", "M8 18h0M12 18h0M16 18h0"], c: [] },
  truck: { p: ["M3 6h11v10H3z", "M14 9h4l3 3v4h-7"], c: [{ x: 7.5, y: 18, r: 1.6 }, { x: 17.5, y: 18, r: 1.6 }] },
  coin: { p: ["M3 3v18h18", "M7 14l4-4 3 3 5-6", "M19 7h-3", "M19 7v3"], c: [] },
  gear: { p: ["M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"], c: [{ x: 12, y: 12, r: 4 }] },
  hub: { p: ["M12 4v3.5M12 16.5v3.5M4 12h3.5M16.5 12h3.5"], c: [{ x: 12, y: 12, r: 2.6 }, { x: 12, y: 3, r: 1 }, { x: 12, y: 21, r: 1 }, { x: 3, y: 12, r: 1 }, { x: 21, y: 12, r: 1 }] },
  chart: { p: ["M3 21V3M3 21h18", "M7 16v-4M12 16V8M17 16v-7"], c: [] },
  shield: { p: ["M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z", "M9 12l2 2 4-4"], c: [] },
  bolt: { p: ["M13 2L4 13h6l-1 9 9-13h-6z"], c: [] },
  store: { p: ["M4 9h16v11H4z", "M3 5h18l-1 4H4z", "M9 20v-6h6v6"], c: [] },
  people: { p: ["M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1", "M21 19v-1a4 4 0 0 0-3-3.85"], c: [{ x: 9.5, y: 8, r: 3.5 }, { x: 17, y: 8, r: 3 }] },
};

export const ICON_KEYS: IconKey[] = Object.keys(ICONS) as IconKey[];
