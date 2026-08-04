// Decorative-only background for the login page: thin line-art icons for
// Future Minds' actual business areas, arranged as two flowing "learning
// journey" paths that converge on the brand mark. Pure CSS animation (no
// Framer Motion) — these are all opacity/transform loops, which CSS handles
// without a new runtime dependency. Respects prefers-reduced-motion via the
// .login-bg-motion rule in globals.css. Every element is aria-hidden.
//
// Opacity note: SVG/CSS opacity is multiplicative down the tree, so the
// "faint" value lives on exactly one node per icon — either a static
// opacity attribute (icons that only move via transform) or the animation's
// own keyframe values (icons whose motion IS an opacity pulse/blink).
// Nothing here ever stacks two opacity sources, or the faint one would
// crush the other to invisible.
import Image from "next/image";
import fmIcon from "../../public/images/fm-icon-mark.png";

const INK = "#081B4B";
const ACCENT = "#FF9933";

const iconProps = {
  viewBox: "0 0 40 40",
  fill: "none" as const,
  stroke: INK,
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type Motion = { kind: "transform"; anim: string } | { kind: "opacity"; anim: string };

type PathNode = {
  key: string;
  x: number;
  y: number;
  tier: "core" | "extra";
  motion: Motion;
  icon: React.ReactNode;
};

const FLOAT_OPACITY = 0.09;

const LEFT_NODES: PathNode[] = [
  {
    key: "school",
    x: 8,
    y: 8,
    tier: "core",
    motion: { kind: "transform", anim: "bg-float 7s ease-in-out 0s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <path d="M20 10L4 17l16 7 16-7z" />
        <path d="M11 20.5V28c0 2.2 4 4 9 4s9-1.8 9-4v-7.5" />
        <path d="M32 17v8" />
      </svg>
    ),
  },
  {
    key: "coding",
    x: 8,
    y: 25,
    tier: "core",
    motion: { kind: "opacity", anim: "bg-blink 3s ease-in-out 0.3s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <rect x="6" y="10" width="28" height="18" rx="2" />
        <path d="M4 32h32" />
        <path d="M15 15l-4 5 4 5" />
        <path d="M25 15l4 5-4 5" />
        <rect x="19.2" y="14.5" width="1.6" height="4" fill={ACCENT} stroke="none" />
      </svg>
    ),
  },
  {
    key: "ai",
    x: 8,
    y: 42,
    tier: "core",
    motion: { kind: "opacity", anim: "bg-blink 2.6s ease-in-out 0s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <rect x="10" y="14" width="20" height="16" rx="4" />
        <circle cx="16" cy="21" r="1.5" />
        <circle cx="24" cy="21" r="1.5" />
        <path d="M16 26h8" />
        <path d="M20 14V8" />
        <path d="M10 19H6M34 19h-4" />
        <circle cx="20" cy="6.3" r="1.6" fill={ACCENT} stroke="none" />
      </svg>
    ),
  },
  {
    key: "abacus",
    x: 8,
    y: 60,
    tier: "extra",
    motion: { kind: "transform", anim: "bg-float 8.5s ease-in-out 0.6s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <rect x="6" y="8" width="28" height="24" rx="1.5" />
        <path d="M6 16h28M6 24h28" />
        <circle cx="12" cy="16" r="1.5" fill={INK} stroke="none" />
        <circle cx="18" cy="16" r="1.5" fill={INK} stroke="none" />
        <circle cx="26" cy="24" r="1.5" fill={INK} stroke="none" />
        <circle cx="14" cy="24" r="1.5" fill={INK} stroke="none" />
      </svg>
    ),
  },
  {
    key: "music",
    x: 8,
    y: 78,
    tier: "core",
    motion: { kind: "transform", anim: "bg-float 9s ease-in-out 0.3s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <ellipse cx="16" cy="27" rx="9" ry="7" />
        <path d="M20 21L28 8" />
        <rect x="25" y="6" width="5" height="4" rx="1" transform="rotate(25 27.5 8)" />
        <circle cx="16" cy="27" r="3" />
      </svg>
    ),
  },
];

const RIGHT_NODES: PathNode[] = [
  {
    key: "creative",
    x: 92,
    y: 6,
    tier: "extra",
    motion: { kind: "transform", anim: "bg-float 7.2s ease-in-out 0.1s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <path d="M20 6C10 6 4 13 4 20c0 5 4 8 8 8 2 0 2-2 1-3-1-1-1-3 1-3h8c4 0 7-3 7-8 0-4-4-8-9-8z" />
        <circle cx="12" cy="16" r="1.4" fill={INK} stroke="none" />
        <circle cx="18" cy="12" r="1.4" fill={ACCENT} stroke="none" />
        <circle cx="24" cy="15" r="1.4" fill={INK} stroke="none" />
        <path d="M28 26l6 6" />
      </svg>
    ),
  },
  {
    key: "dance",
    x: 92,
    y: 20,
    tier: "extra",
    motion: { kind: "transform", anim: "bg-float 8.2s ease-in-out 0.5s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <circle cx="20" cy="8" r="3" />
        <path d="M20 11v8l-7 5M20 19l8 3M20 19l-3 10M20 19l5 9" />
      </svg>
    ),
  },
  {
    key: "languages",
    x: 92,
    y: 34,
    tier: "extra",
    motion: { kind: "transform", anim: "bg-bounce 6.5s ease-in-out 0.2s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <path d="M6 10a3 3 0 013-3h12a3 3 0 013 3v7a3 3 0 01-3 3H12l-4 3v-3H9a3 3 0 01-3-3z" />
        <path d="M22 17h8a3 3 0 013 3v6a3 3 0 01-3 3h-1v3l-4-3h-6a3 3 0 01-3-3" opacity="0.75" />
      </svg>
    ),
  },
  {
    key: "communication",
    x: 92,
    y: 48,
    tier: "core",
    motion: { kind: "opacity", anim: "bg-blink 5s ease-in-out 0s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <rect x="16" y="6" width="8" height="16" rx="4" />
        <path d="M11 18a9 9 0 0018 0" />
        <path d="M20 27v6M15 33h10" />
      </svg>
    ),
  },
  {
    key: "online",
    x: 92,
    y: 62,
    tier: "core",
    motion: { kind: "opacity", anim: "bg-blink 3.2s ease-in-out 0.5s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <rect x="5" y="8" width="30" height="20" rx="2" />
        <path d="M14 33h12M20 28v5" />
        <circle cx="20" cy="12" r="1.4" fill={ACCENT} stroke="none" />
      </svg>
    ),
  },
  {
    key: "home",
    x: 92,
    y: 76,
    tier: "extra",
    motion: { kind: "transform", anim: "bg-float 8.8s ease-in-out 0.3s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <path d="M6 18L20 7l14 11" />
        <path d="M9 16v14h22V16" />
        <path d="M17 30v-8h6v8" />
        <path d="M28 22v-3a2 2 0 012-2h1" opacity="0.7" />
      </svg>
    ),
  },
  {
    key: "career",
    x: 92,
    y: 90,
    tier: "core",
    motion: { kind: "transform", anim: "bg-float 7s ease-in-out 0.2s infinite" },
    icon: (
      <svg {...iconProps} width="38" height="38">
        <path d="M20 4c5 3 7 9 6 16l-4 4h-4l-4-4c-1-7 1-13 6-16z" />
        <circle cx="20" cy="14" r="2.5" />
        <path d="M13 24l-3 7 6-3M27 24l3 7-6-3" />
        <path d="M18 30l2 4 2-4" opacity="0.8" />
      </svg>
    ),
  },
];

const CORNER_ICONS: { key: string; className: string; motion: Motion; icon: React.ReactNode }[] = [
  {
    key: "corner-book",
    className: "left-4 top-4",
    motion: { kind: "transform", anim: "bg-float 7s ease-in-out 0s infinite" },
    icon: (
      <svg {...iconProps} width="30" height="30">
        <path d="M6 10c4-2 8-2 12 0v20c-4-2-8-2-12 0z" />
        <path d="M32 10c-4-2-8-2-12 0v20c4-2 8-2 12 0z" />
      </svg>
    ),
  },
  {
    key: "corner-laptop",
    className: "right-4 top-4",
    motion: { kind: "transform", anim: "bg-float 7.6s ease-in-out 0.3s infinite" },
    icon: (
      <svg {...iconProps} width="30" height="30">
        <rect x="6" y="10" width="28" height="18" rx="2" />
        <path d="M4 32h32" />
        <path d="M15 15l-4 5 4 5M25 15l4 5-4 5" />
      </svg>
    ),
  },
  {
    key: "corner-robot",
    className: "left-4 bottom-4",
    motion: { kind: "opacity", anim: "bg-blink 2.8s ease-in-out 0.2s infinite" },
    icon: (
      <svg {...iconProps} width="30" height="30">
        <rect x="10" y="14" width="20" height="16" rx="4" />
        <circle cx="16" cy="21" r="1.5" />
        <circle cx="24" cy="21" r="1.5" />
        <path d="M16 26h8M20 14V8" />
        <circle cx="20" cy="6.3" r="1.6" fill={ACCENT} stroke="none" />
      </svg>
    ),
  },
  {
    key: "corner-target",
    className: "right-4 bottom-4",
    motion: { kind: "opacity", anim: "bg-blink 4.5s ease-in-out 0s infinite" },
    icon: (
      <svg {...iconProps} width="30" height="30">
        <circle cx="20" cy="20" r="12" />
        <circle cx="20" cy="20" r="7" />
        <circle cx="20" cy="20" r="2" fill={INK} stroke="none" />
      </svg>
    ),
  },
  {
    key: "corner-music",
    className: "left-1/2 top-4 -translate-x-1/2",
    motion: { kind: "transform", anim: "bg-float 9s ease-in-out 0.1s infinite" },
    icon: (
      <svg {...iconProps} width="26" height="26">
        <ellipse cx="16" cy="27" rx="9" ry="7" />
        <path d="M20 21L28 8" />
        <circle cx="16" cy="27" r="3" />
      </svg>
    ),
  },
];

function buildPath(nodes: PathNode[], side: "left" | "right"): string {
  const amp = side === "left" ? 4 : -4;
  let d = `M${nodes[0].x},${nodes[0].y}`;
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const cur = nodes[i];
    const midY = (prev.y + cur.y) / 2;
    d += ` C${prev.x + amp},${midY - 4} ${cur.x + amp},${midY + 4} ${cur.x},${cur.y}`;
  }
  const last = nodes[nodes.length - 1];
  const cx = side === "left" ? 46 : 54;
  d += ` C${last.x + amp},${last.y + 8} ${cx - amp * 2},94 ${cx},96`;
  return d;
}

// Always include a static low-opacity fallback alongside the animation —
// a running keyframe overrides it each frame, but if the animation never
// ticks for any reason (reduced motion, a slow first paint), the icon
// still renders faint instead of snapping to full opacity.
function nodeStyle(motion: Motion): React.CSSProperties {
  return motion.kind === "transform"
    ? { animation: motion.anim, opacity: FLOAT_OPACITY }
    : { animation: motion.anim, opacity: 0.09 };
}

export default function LoginBackground() {
  return (
    <div aria-hidden className="login-bg-motion pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-navy/[0.05] blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-amber/[0.06] blur-3xl" />
      <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#DCEAF8]/40 blur-3xl" />

      <svg className="absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={buildPath(LEFT_NODES, "left")}
          fill="none"
          stroke={INK}
          strokeWidth="0.35"
          strokeOpacity="0.14"
          strokeLinecap="round"
          strokeDasharray="0.3 2.4"
          style={{ animation: "path-flow 9s linear infinite" }}
        />
        <path
          d={buildPath(RIGHT_NODES, "right")}
          fill="none"
          stroke={ACCENT}
          strokeWidth="0.35"
          strokeOpacity="0.12"
          strokeLinecap="round"
          strokeDasharray="0.3 2.4"
          style={{ animation: "path-flow 9s linear infinite" }}
        />
      </svg>

      {[...LEFT_NODES, ...RIGHT_NODES].map((node) => (
        <div
          key={node.key}
          className={`absolute hidden -translate-x-1/2 -translate-y-1/2 ${node.tier === "core" ? "md:block" : "lg:block"}`}
          style={{ left: `${node.x}%`, top: `${node.y}%`, ...nodeStyle(node.motion) }}
        >
          {node.icon}
        </div>
      ))}

      <div className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 opacity-[0.07] md:block">
        <Image src={fmIcon} alt="" className="h-10 w-auto" />
      </div>

      {CORNER_ICONS.map((c) => (
        <div key={c.key} className={`absolute md:hidden ${c.className}`} style={nodeStyle(c.motion)}>
          {c.icon}
        </div>
      ))}
    </div>
  );
}
