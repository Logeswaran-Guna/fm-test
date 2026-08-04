import Image from "next/image";
import fmIcon from "../../public/images/fm-icon-mark.png";

interface ParticleStyle extends React.CSSProperties {
  "--dx"?: string;
  "--dy"?: string;
}

type Domain = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

const iconProps = {
  viewBox: "0 0 24 24",
  width: 20,
  height: 20,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DOMAINS: Domain[] = [
  {
    key: "ai",
    label: "AI & Robotics",
    icon: (
      <svg {...iconProps}>
        <rect x="4" y="8" width="16" height="11" rx="3" />
        <circle cx="9" cy="13.2" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="15" cy="13.2" r="1.3" fill="currentColor" stroke="none" />
        <path d="M12 8V4" />
        <circle cx="12" cy="3" r="1.1" />
        <path d="M4 12.5H2M22 12.5h-2" />
      </svg>
    ),
  },
  {
    key: "coding",
    label: "Coding",
    icon: (
      <svg {...iconProps}>
        <path d="M8.5 6.5l-5.5 5.5 5.5 5.5M15.5 6.5l5.5 5.5-5.5 5.5" />
      </svg>
    ),
  },
  {
    key: "academics",
    label: "School Academics",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3L2 8l10 5 8-3.6V15h2V8z" />
        <path d="M6 12.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-3.5" />
      </svg>
    ),
  },
  {
    key: "exams",
    label: "Competitive Exams",
    icon: (
      <svg {...iconProps}>
        <path d="M8 4h8v4a4 4 0 01-4 4 4 4 0 01-4-4V4z" />
        <path d="M6 5H4.5a2 2 0 001.9 3.4M18 5h1.5a2 2 0 01-1.9 3.4" />
        <path d="M12 12v3M9 20h6M10 17h4v3h-4z" />
      </svg>
    ),
  },
  {
    key: "music",
    label: "Music",
    icon: (
      <svg {...iconProps}>
        <path d="M9 3v9.28A3.5 3.5 0 108.5 15V6h9V3z" />
      </svg>
    ),
  },
  {
    key: "dance",
    label: "Dance",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="4.5" r="2" />
        <path d="M12 6.5v5l-4 3M12 11.5l5 2M12 11.5l-2 6M12 11.5l3 5.5" />
      </svg>
    ),
  },
  {
    key: "communication",
    label: "Communication",
    icon: (
      <svg {...iconProps}>
        <path d="M4 6.5a3 3 0 013-3h10a3 3 0 013 3v6a3 3 0 01-3 3H10l-4.5 3.5v-3.5A3 3 0 014 12.5z" />
      </svg>
    ),
  },
  {
    key: "languages",
    label: "Languages",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M4 12h16M12 4c2.4 2.4 2.4 13.6 0 16M12 4c-2.4 2.4-2.4 13.6 0 16" />
        <path d="M6.2 7.5c3.4 1.4 8.2 1.4 11.6 0M6.2 16.5c3.4-1.4 8.2-1.4 11.6 0" />
      </svg>
    ),
  },
  {
    key: "tutors",
    label: "Verified Tutors",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M8.5 12.2l2.3 2.3 4.7-4.8" />
      </svg>
    ),
  },
];

const RING_RADIUS = 38;
const START_ANGLE = -90;
// When a pillar lights up more than one node, each one lands a beat after
// the last — a cascade rather than everything flashing on at once.
const CASCADE_STEP_MS = 220;
const STEP = 360 / DOMAINS.length;

const NODE_POSITIONS = DOMAINS.map((domain, i) => {
  const theta = ((START_ANGLE + i * STEP) * Math.PI) / 180;
  return {
    key: domain.key,
    x: 50 + RING_RADIUS * Math.cos(theta),
    y: 50 + RING_RADIUS * Math.sin(theta),
  };
});

const PARTICLES = [
  { top: "14%", left: "26%", dx: "10px", dy: "-14px", duration: "5.5s", delay: "0s" },
  { top: "22%", left: "76%", dx: "-8px", dy: "12px", duration: "6.2s", delay: "0.8s" },
  { top: "50%", left: "8%", dx: "9px", dy: "10px", duration: "5s", delay: "1.6s" },
  { top: "78%", left: "30%", dx: "-10px", dy: "-9px", duration: "6.8s", delay: "0.4s" },
  { top: "70%", left: "82%", dx: "-9px", dy: "-11px", duration: "5.8s", delay: "1.2s" },
  { top: "38%", left: "50%", dx: "8px", dy: "-10px", duration: "6.4s", delay: "2s" },
];

export default function HeroEcosystem({
  activeDomainKeys,
  stats,
}: {
  activeDomainKeys: string[];
  stats: { tutors: number; classes: number } | null;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[440px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-amber/10 via-transparent to-white/5 blur-2xl"
      />

      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          className="stroke-white/10"
          strokeWidth="0.3"
          strokeDasharray="0.6 1.6"
        />
        {NODE_POSITIONS.map((pos) => {
          const activeOrder = activeDomainKeys.indexOf(pos.key);
          const isActive = activeOrder !== -1;
          const delayMs = isActive ? activeOrder * CASCADE_STEP_MS : 0;
          return (
            <line
              key={pos.key}
              x1={50}
              y1={50}
              x2={pos.x}
              y2={pos.y}
              className={isActive ? "stroke-amber transition-colors" : "stroke-white/15 transition-colors"}
              strokeWidth={isActive ? 0.7 : 0.4}
              strokeDasharray="1.5 2.5"
              style={{
                animation: `dash-flow ${isActive ? "1.3s" : "3s"} linear ${delayMs}ms infinite`,
                transitionDelay: `${delayMs}ms`,
              }}
            />
          );
        })}
      </svg>

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-amber/50 blur-[1px]"
          style={
            {
              top: p.top,
              left: p.left,
              "--dx": p.dx,
              "--dy": p.dy,
              animation: `particle-drift ${p.duration} ease-in-out ${p.delay} infinite`,
            } as ParticleStyle
          }
        />
      ))}

      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div
          aria-hidden
          className="absolute inset-0 -m-4 rounded-full bg-amber/25 blur-xl"
          style={{ animation: "pulse-soft 3s ease-in-out infinite" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -m-6 rounded-full border border-dashed border-white/15"
          style={{ animation: "spin-slow 40s linear infinite" }}
        />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white shadow-xl sm:h-16 sm:w-16 lg:h-20 lg:w-20">
          <Image src={fmIcon} alt="Future Minds" className="h-8 w-auto sm:h-9 lg:h-11" priority />
        </div>
      </div>

      {DOMAINS.map((domain, i) => {
        const pos = NODE_POSITIONS[i];
        const activeOrder = activeDomainKeys.indexOf(domain.key);
        const isActive = activeOrder !== -1;
        const delayMs = isActive ? activeOrder * CASCADE_STEP_MS : 0;
        return (
          <div
            key={domain.key}
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-amber group-hover:bg-amber/15 group-hover:text-amber sm:h-11 sm:w-11 lg:h-12 lg:w-12 ${
                isActive
                  ? "border-amber bg-amber/20 text-amber shadow-lg shadow-amber/30"
                  : "border-white/15 bg-white/8 text-white/60"
              }`}
              style={{
                transitionDelay: `${delayMs}ms`,
                ...(isActive ? { animation: `pulse-soft 2.2s ease-in-out ${delayMs}ms infinite` } : {}),
              }}
            >
              {domain.icon}
            </div>
            <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-200 group-hover:opacity-100">
              {domain.label}
            </span>
          </div>
        );
      })}

      <div
        aria-hidden={!stats}
        className="absolute -left-1 top-2 hidden rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-md sm:block"
        style={{ animation: "float-slow 5s ease-in-out infinite" }}
      >
        <b className="block font-heading text-sm text-white">{stats ? stats.tutors : "—"}</b>
        <span className="text-[10px] text-white/60">Verified tutors</span>
      </div>
      <div
        aria-hidden={!stats}
        className="absolute -right-1 bottom-4 hidden rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-md sm:block"
        style={{ animation: "float-slower 6s ease-in-out infinite" }}
      >
        <b className="block font-heading text-sm text-white">{stats ? stats.classes : "—"}</b>
        <span className="text-[10px] text-white/60">Classes completed</span>
      </div>
    </div>
  );
}
