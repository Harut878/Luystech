import type { IconKey } from "./types";

// SVG icon-ների սահմանումներ (path-եր + circle-ներ), 24x24 viewBox, stroke-based
export type IconDef = { p: string[]; c: { x: number; y: number; r: number }[] };

export const ICONS: Record<IconKey, IconDef> = {
  patient: { p: ["M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8"], c: [{ x: 12, y: 8, r: 4 }] },
  calendar: { p: ["M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M8 2v4M16 2v4M3 10h18"], c: [] },
  chart: { p: ["M4 18L8 12l4 4 3.5-6L20 18", "M3 21h18"], c: [] },
  shield: { p: ["M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z", "M9 12l2 2 4-4"], c: [] },
  heart: { p: ["M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z"], c: [] },
  activity: { p: ["M3 12h4l2-7 4 14 2-7h6"], c: [] },
  stethoscope: { p: ["M5 3v6a4 4 0 0 0 8 0V3", "M9 15v2a5 5 0 0 0 10 0v-2"], c: [{ x: 19, y: 11, r: 2 }] },
  pill: { p: ["M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7z", "M8 8l8 8"], c: [] },
  lab: { p: ["M9 3v7l-4 7a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-4-7V3", "M8 3h8", "M7.5 15h9"], c: [] },
  records: { p: ["M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z", "M14 2v6h6", "M9 13h6M9 17h4"], c: [] },
  hub: { p: ["M12 4v4M12 16v4M4 12h4M16 12h4"], c: [{ x: 12, y: 12, r: 3 }, { x: 12, y: 3, r: 1.2 }, { x: 12, y: 21, r: 1.2 }, { x: 3, y: 12, r: 1.2 }, { x: 21, y: 12, r: 1.2 }] },
  bolt: { p: ["M13 2L4 13h6l-1 9 9-13h-6z"], c: [] },
  lock: { p: ["M5 11h14v10H5z", "M8 11V7a4 4 0 0 1 8 0v4"], c: [{ x: 12, y: 16, r: 1.4 }] },
  clock: { p: ["M12 7v5l3 2"], c: [{ x: 12, y: 12, r: 9 }] },
  target: { p: [], c: [{ x: 12, y: 12, r: 9 }, { x: 12, y: 12, r: 5 }, { x: 12, y: 12, r: 1.4 }] },
  ruler: { p: ["M3 15L15 3l6 6L9 21z", "M8 8l2 2M11 5l2 2M5 11l2 2M14 14l2 2"], c: [] },
  bell: { p: ["M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6", "M10 20a2 2 0 0 0 4 0"], c: [] },
  cloud: { p: ["M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9a4 4 0 0 1 0 9z"], c: [] },
};

export const ICON_KEYS: IconKey[] = Object.keys(ICONS) as IconKey[];
