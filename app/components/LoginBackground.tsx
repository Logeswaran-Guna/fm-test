// Decorative-only background for the login page: thin line-art icons for
// Future Minds' actual business areas, captioned and arranged as two
// flowing "learning journey" paths that converge on the brand mark and a
// small workspace scene at the bottom. Pure CSS animation (no Framer
// Motion) — these are all opacity/transform loops, which CSS handles
// without a new runtime dependency. Respects prefers-reduced-motion via
// the .login-bg-motion rule in globals.css. Every element is aria-hidden;
// none of it is interactive or part of the tab order.
//
// Opacity note: SVG/CSS opacity is multiplicative down the tree, so the
// "faint" value for each icon lives on exactly one node — either a static
// opacity (icons that only move via transform) or the animation's own
// keyframe values (icons whose motion IS an opacity pulse/blink). Text
// captions sit as siblings of the dimmed icon, never inside it, so they
// stay independently readable.
import Image from "next/image";
import fmLockup from "../../public/images/fm-lockup.png";

const INK = "#081B4B";
const BLUE = "#5D8FD8";
const ACCENT = "#FF9933";
const ICON_OPACITY = 0.22;

const iconProps = {
  viewBox: "0 0 40 40",
  fill: "none" as const,
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
  title: string;
  sub1: string;
  sub2: string;
  icon: React.ReactNode;
};

const LEFT_NODES: PathNode[] = [
  {
    key: "school",
    x: 9,
    y: 5,
    tier: "core",
    motion: { kind: "transform", anim: "bg-float 7s ease-in-out 0s infinite" },
    title: "School Academics",
    sub1: "CBSE · ICSE · State Board",
    sub2: "All Classes",
    icon: (
      <svg {...iconProps} stroke={INK} width="26" height="26">
        <path d="M20 10L4 17l16 7 16-7z" />
        <path d="M11 20.5V28c0 2.2 4 4 9 4s9-1.8 9-4v-7.5" />
        <path d="M32 17v8" />
      </svg>
    ),
  },
  {
    key: "coding",
    x: 9,
    y: 21,
    tier: "core",
    motion: { kind: "opacity", anim: "bg-blink 3s ease-in-out 0.3s infinite" },
    title: "Coding & Programming",
    sub1: "Python · Web Dev",
    sub2: "App Development",
    icon: (
      <svg {...iconProps} stroke={BLUE} width="26" height="26">
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
    x: 9,
    y: 37,
    tier: "core",
    motion: { kind: "opacity", anim: "bg-blink 2.6s ease-in-out 0s infinite" },
    title: "AI & Robotics",
    sub1: "Artificial Intelligence",
    sub2: "Robotics · Automation",
    icon: (
      <svg {...iconProps} stroke={INK} width="26" height="26">
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
    x: 9,
    y: 53,
    tier: "extra",
    motion: { kind: "transform", anim: "bg-float 8.5s ease-in-out 0.6s infinite" },
    title: "Abacus & Math Skills",
    sub1: "Abacus · Vedic Math",
    sub2: "Logical Thinking",
    icon: (
      <svg {...iconProps} stroke={BLUE} width="26" height="26">
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
    x: 9,
    y: 69,
    tier: "core",
    motion: { kind: "transform", anim: "bg-float 9s ease-in-out 0.3s infinite" },
    title: "Music & Instruments",
    sub1: "Vocal · Guitar · Piano",
    sub2: "Violin & More",
    icon: (
      <svg {...iconProps} stroke={INK} width="26" height="26">
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
    x: 91,
    y: 3,
    tier: "core",
    motion: { kind: "transform", anim: "bg-float 7.2s ease-in-out 0.1s infinite" },
    title: "Creative Learning",
    sub1: "Art & Craft · Drawing",
    sub2: "Design · Photography",
    icon: (
      <svg {...iconProps} stroke={INK} width="26" height="26">
        <path d="M20 6C10 6 4 13 4 20c0 5 4 8 8 8 2 0 2-2 1-3-1-1-1-3 1-3h8c4 0 7-3 7-8 0-4-4-8-9-8z" />
        <circle cx="12" cy="16" r="1.4" fill={INK} stroke="none" />
        <circle cx="18" cy="12" r="1.4" fill={ACCENT} stroke="none" />
        <circle cx="24" cy="15" r="1.4" fill={BLUE} stroke="none" />
        <path d="M28 26l6 6" />
      </svg>
    ),
  },
  {
    key: "dance",
    x: 91,
    y: 14,
    tier: "extra",
    motion: { kind: "transform", anim: "bg-float 8.2s ease-in-out 0.5s infinite" },
    title: "Dance",
    sub1: "Bharatanatyam · Western",
    sub2: "Freestyle · Classical",
    icon: (
      <svg {...iconProps} stroke={BLUE} width="26" height="26">
        <circle cx="20" cy="8" r="3" />
        <path d="M20 11v8l-7 5M20 19l8 3M20 19l-3 10M20 19l5 9" />
      </svg>
    ),
  },
  {
    key: "languages",
    x: 91,
    y: 26,
    tier: "core",
    motion: { kind: "transform", anim: "bg-bounce 6.5s ease-in-out 0.2s infinite" },
    title: "Languages",
    sub1: "English · Tamil · Hindi",
    sub2: "French & More",
    icon: (
      <svg {...iconProps} stroke={INK} width="26" height="26">
        <path d="M6 10a3 3 0 013-3h12a3 3 0 013 3v7a3 3 0 01-3 3H12l-4 3v-3H9a3 3 0 01-3-3z" />
        <path d="M22 17h8a3 3 0 013 3v6a3 3 0 01-3 3h-1v3l-4-3h-6a3 3 0 01-3-3" opacity="0.75" />
      </svg>
    ),
  },
  {
    key: "communication",
    x: 91,
    y: 37,
    tier: "core",
    motion: { kind: "opacity", anim: "bg-blink 5s ease-in-out 0s infinite" },
    title: "Communication Skills",
    sub1: "Public Speaking",
    sub2: "Leadership · Confidence",
    icon: (
      <svg {...iconProps} stroke={BLUE} width="26" height="26">
        <rect x="16" y="6" width="8" height="16" rx="4" />
        <path d="M11 18a9 9 0 0018 0" />
        <path d="M20 27v6M15 33h10" />
      </svg>
    ),
  },
  {
    key: "online",
    x: 91,
    y: 48,
    tier: "core",
    motion: { kind: "opacity", anim: "bg-blink 3.2s ease-in-out 0.5s infinite" },
    title: "Live Online Classes",
    sub1: "Interactive · Flexible",
    sub2: "Learn from Anywhere",
    icon: (
      <svg {...iconProps} stroke={INK} width="26" height="26">
        <rect x="5" y="8" width="30" height="20" rx="2" />
        <path d="M14 33h12M20 28v5" />
        <circle cx="20" cy="12" r="1.4" fill={ACCENT} stroke="none" />
      </svg>
    ),
  },
  {
    key: "home",
    x: 91,
    y: 60,
    tier: "extra",
    motion: { kind: "transform", anim: "bg-float 8.8s ease-in-out 0.3s infinite" },
    title: "Home Tutoring",
    sub1: "Personalized · One-to-One",
    sub2: "At Your Convenience",
    icon: (
      <svg {...iconProps} stroke={BLUE} width="26" height="26">
        <path d="M6 18L20 7l14 11" />
        <path d="M9 16v14h22V16" />
        <path d="M17 30v-8h6v8" />
        <path d="M28 22v-3a2 2 0 012-2h1" opacity="0.7" />
      </svg>
    ),
  },
  {
    key: "career",
    x: 91,
    y: 71,
    tier: "core",
    motion: { kind: "transform", anim: "bg-float 7s ease-in-out 0.2s infinite" },
    title: "Career Growth",
    sub1: "Mentorship · Guidance",
    sub2: "Skill Building",
    icon: (
      <svg {...iconProps} stroke={INK} width="26" height="26">
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
      <svg {...iconProps} stroke={INK} width="28" height="28">
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
      <svg {...iconProps} stroke={BLUE} width="28" height="28">
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
      <svg {...iconProps} stroke={INK} width="28" height="28">
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
      <svg {...iconProps} stroke={BLUE} width="28" height="28">
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
      <svg {...iconProps} stroke={INK} width="24" height="24">
        <ellipse cx="16" cy="27" rx="9" ry="7" />
        <path d="M20 21L28 8" />
        <circle cx="16" cy="27" r="3" />
      </svg>
    ),
  },
];

// Small ambient confetti — a dotted square, a couple of hollow circles, a
// diamond, a plus mark — scattered in the gaps between icon columns.
const DECOR_SHAPES: { key: string; x: number; y: number; svg: React.ReactNode }[] = [
  {
    key: "dot-square",
    x: 22,
    y: 15,
    svg: (
      <svg viewBox="0 0 20 20" width="18" height="18">
        <rect x="1" y="1" width="18" height="18" rx="2" fill="none" stroke={INK} strokeWidth="1.2" strokeDasharray="2 2.4" transform="rotate(8 10 10)" />
      </svg>
    ),
  },
  {
    key: "circle-a",
    x: 34,
    y: 8,
    svg: <svg viewBox="0 0 20 20" width="12" height="12"><circle cx="10" cy="10" r="8" fill="none" stroke={BLUE} strokeWidth="1.3" /></svg>,
  },
  {
    key: "diamond",
    x: 66,
    y: 11,
    svg: <svg viewBox="0 0 20 20" width="14" height="14"><rect x="4" y="4" width="12" height="12" fill="none" stroke={ACCENT} strokeWidth="1.3" transform="rotate(45 10 10)" /></svg>,
  },
  {
    key: "plus",
    x: 79,
    y: 41,
    svg: (
      <svg viewBox="0 0 20 20" width="14" height="14">
        <path d="M10 3v14M3 10h14" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "circle-b",
    x: 16,
    y: 52,
    svg: <svg viewBox="0 0 20 20" width="10" height="10"><circle cx="10" cy="10" r="8" fill="none" stroke={ACCENT} strokeWidth="1.3" /></svg>,
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
  d += ` C${last.x + amp},${last.y + 6} ${cx - amp * 2},96 ${cx},97`;
  return d;
}

function midpoints(nodes: PathNode[]): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 1; i < nodes.length; i++) {
    points.push({ x: (nodes[i - 1].x + nodes[i].x) / 2, y: (nodes[i - 1].y + nodes[i].y) / 2 });
  }
  return points;
}

// Always include a static opacity fallback alongside the animation — a
// running keyframe overrides it each frame, but if the animation never
// ticks for any reason (reduced motion, a slow first paint), the icon
// still renders at the intended faint level instead of snapping to 100%.
function nodeStyle(motion: Motion, base: number): React.CSSProperties {
  return { animation: motion.anim, opacity: base };
}

export default function LoginBackground() {
  return (
    <div aria-hidden className="login-bg-motion pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-navy/[0.12] blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-amber/[0.13] blur-3xl" />
      <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#DCEAF8]/70 blur-3xl" />

      <svg className="absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={buildPath(LEFT_NODES, "left")}
          fill="none"
          stroke={INK}
          strokeWidth="0.4"
          strokeOpacity="0.18"
          strokeLinecap="round"
          strokeDasharray="0.3 2.4"
          style={{ animation: "path-flow 9s linear infinite" }}
        />
        <path
          d={buildPath(RIGHT_NODES, "right")}
          fill="none"
          stroke={BLUE}
          strokeWidth="0.4"
          strokeOpacity="0.17"
          strokeLinecap="round"
          strokeDasharray="0.3 2.4"
          style={{ animation: "path-flow 9s linear infinite" }}
        />
        {[...midpoints(LEFT_NODES), ...midpoints(RIGHT_NODES)].map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="0.55"
            fill={ACCENT}
            opacity="0.5"
            style={{ animation: `bg-blink ${4 + (i % 3)}s ease-in-out ${i * 0.3}s infinite` }}
          />
        ))}
      </svg>

      {DECOR_SHAPES.map((d) => (
        <div
          key={d.key}
          className="absolute hidden -translate-x-1/2 -translate-y-1/2 lg:block"
          style={{ left: `${d.x}%`, top: `${d.y}%`, opacity: 0.16, animation: "bg-float 8s ease-in-out infinite" }}
        >
          {d.svg}
        </div>
      ))}

      {[...LEFT_NODES, ...RIGHT_NODES].map((node) => (
        <div
          key={node.key}
          className={`absolute hidden w-32 -translate-x-1/2 -translate-y-1/2 text-center ${
            node.tier === "core" ? "md:block" : "lg:block"
          }`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div className="inline-flex" style={nodeStyle(node.motion, ICON_OPACITY)}>
            {node.icon}
          </div>
          <p className="mt-0.5 text-[10.5px] font-semibold leading-none text-navy/75">{node.title}</p>
          <p className="mt-1 text-[8.5px] leading-none text-navy/40">
            {node.sub1} · {node.sub2}
          </p>
        </div>
      ))}

      {CORNER_ICONS.map((c) => (
        <div key={c.key} className={`absolute md:hidden ${c.className}`} style={nodeStyle(c.motion, 0.22)}>
          {c.icon}
        </div>
      ))}

      <svg
        aria-hidden
        className="absolute bottom-0 left-0 hidden h-16 w-full sm:h-20 md:block"
        viewBox="0 0 500 90"
        preserveAspectRatio="xMidYMax slice"
        style={{ opacity: 0.2 }}
      >
        <path d="M10 78h480" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M40 78V50h30v28" stroke={INK} strokeWidth="1.2" />
        <path d="M42 50h26" stroke={INK} strokeWidth="1.2" />
        <path d="M55 50V30" stroke={BLUE} strokeWidth="1.2" />
        <path d="M55 30c0-6 5-10 12-10" stroke={BLUE} strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="70" cy="18" rx="9" ry="5" fill="none" stroke={BLUE} strokeWidth="1.2" />
        <rect x="120" y="58" width="70" height="20" rx="1.5" stroke={INK} strokeWidth="1.2" />
        <path d="M118 78h74M118 68h74M155 58v20" stroke={INK} strokeWidth="0.9" opacity="0.7" />
        <path d="M215 78V54c8-4 20-4 28 0v24z" stroke={INK} strokeWidth="1.2" />
        <path d="M229 54v24" stroke={INK} strokeWidth="0.9" opacity="0.6" />
        <rect x="285" y="60" width="18" height="18" rx="2" stroke={BLUE} strokeWidth="1.2" />
        <path d="M289 60v-6M294 60v-9M298 60v-5" stroke={BLUE} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M350 78c-2-18 4-28 14-28s16 10 14 28" stroke={INK} strokeWidth="1.2" />
        <ellipse cx="364" cy="78" rx="16" ry="4" stroke={INK} strokeWidth="1.2" />
        <path d="M420 78V38a10 10 0 0120 0v40" stroke={BLUE} strokeWidth="1.2" />
        <path d="M414 78h32" stroke={INK} strokeWidth="1.2" />
      </svg>

      <div className="absolute bottom-16 left-1/2 hidden -translate-x-1/2 sm:bottom-20 md:block">
        <Image src={fmLockup} alt="" className="h-14 w-auto opacity-95" />
      </div>
    </div>
  );
}
