import { ICONS } from "@/lib/icons";
import type { IconKey } from "@/lib/types";

// Ցուցադրում է SVG icon-ը ըստ բանալու
export default function Icon({ name, size = 22 }: { name: IconKey; size?: number }) {
  const def = ICONS[name] || ICONS.box;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}
      style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}>
      {def.p.map((d, i) => <path key={i} d={d} />)}
      {def.c.map((c, i) => <circle key={`c${i}`} cx={c.x} cy={c.y} r={c.r} />)}
    </svg>
  );
}
