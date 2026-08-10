import type { ComponentType } from "react";
import {
  type IconProps,
  GraduationCapIcon,
  LaptopIcon,
  BooksStackIcon,
  OpenBookIcon,
  LightBulbIcon,
  GlobeIcon,
  HeadphonesIcon,
  CertificateIcon,
  PencilIcon,
  NotebookIcon,
  CalendarIcon,
  TargetIcon,
  AtomIcon,
  FlaskIcon,
  RocketIcon,
  MagnifyingGlassIcon,
  MusicNoteIcon,
  ChalkboardIcon,
  StarIcon,
  DotIcon,
} from "./eduIllustrations";

// Art-directed decorative frame for the find-tutor / become-a-tutor
// registration cards — NOT a random icon scatter. Fixed, hand-placed
// composition (graduation cap upper-left, laptop+books lower-left,
// headphones upper-right, certificate center-right, etc.), sized/rotated/
// opacity-tiered so it reads as a designed illustration, not clutter.
//
// Deliberately only shown at xl+ (>=1280px): below that the registration
// card is full-width with no safe gutter to place anything without
// risking an overlap, so mobile/tablet get the plain #FAFBFC background
// only — usability over decoration.

type Placement = {
  Icon: ComponentType<IconProps>;
  size: number;
  top: number;
  side: "left" | "right";
  offset: number;
  rotate: number;
  opacity: number;
  delay: number;
  duration: number;
};

// The first ~750px is the "hero" composition (framing the top of the
// card, matching the reference). Real signup forms run much longer than
// that (many fields, chip groups) — without a second pass the decoration
// stopped at 750px and left everything from there down to the bottom
// wave completely blank. This second band keeps decoration going the
// whole way down, at a calmer density/opacity since it's now a
// background rhythm rather than the primary framing moment.
const LEFT: Placement[] = [
  { Icon: GraduationCapIcon, size: 112, top: 48, side: "left", offset: 28, rotate: -8, opacity: 1, delay: 0, duration: 6 },
  { Icon: StarIcon, size: 22, top: 36, side: "left", offset: 232, rotate: 0, opacity: 0.55, delay: 0.6, duration: 5 },
  { Icon: LightBulbIcon, size: 62, top: 248, side: "left", offset: 172, rotate: 6, opacity: 0.85, delay: 1.1, duration: 6.5 },
  { Icon: DotIcon, size: 14, top: 206, side: "left", offset: 58, rotate: 0, opacity: 0.4, delay: 0.3, duration: 5.5 },
  { Icon: MusicNoteIcon, size: 34, top: 338, side: "left", offset: 250, rotate: -10, opacity: 0.5, delay: 1.8, duration: 5 },
  { Icon: LaptopIcon, size: 122, top: 428, side: "left", offset: 14, rotate: -4, opacity: 1, delay: 0.4, duration: 7 },
  { Icon: BooksStackIcon, size: 74, top: 408, side: "left", offset: 178, rotate: 5, opacity: 0.85, delay: 2, duration: 6 },
  { Icon: MagnifyingGlassIcon, size: 30, top: 558, side: "left", offset: 232, rotate: 10, opacity: 0.5, delay: 0.9, duration: 5.5 },
  { Icon: GlobeIcon, size: 68, top: 598, side: "left", offset: 68, rotate: 0, opacity: 0.8, delay: 1.4, duration: 6 },
  { Icon: OpenBookIcon, size: 80, top: 676, side: "left", offset: 28, rotate: -6, opacity: 0.85, delay: 0.2, duration: 6.5 },
  { Icon: DotIcon, size: 12, top: 700, side: "left", offset: 222, rotate: 0, opacity: 0.35, delay: 2.3, duration: 5 },
  // --- continuation band (750px+) ---
  { Icon: StarIcon, size: 20, top: 820, side: "left", offset: 190, rotate: 0, opacity: 0.45, delay: 0.5, duration: 5 },
  { Icon: NotebookIcon, size: 58, top: 870, side: "left", offset: 34, rotate: 6, opacity: 0.7, delay: 1.2, duration: 6.5 },
  { Icon: DotIcon, size: 12, top: 980, side: "left", offset: 224, rotate: 0, opacity: 0.35, delay: 2, duration: 5 },
  { Icon: PencilIcon, size: 54, top: 1040, side: "left", offset: 150, rotate: -15, opacity: 0.65, delay: 0.8, duration: 6 },
  { Icon: MusicNoteIcon, size: 26, top: 1100, side: "left", offset: 240, rotate: 8, opacity: 0.45, delay: 1.6, duration: 5.5 },
  { Icon: BooksStackIcon, size: 62, top: 1220, side: "left", offset: 30, rotate: -4, opacity: 0.7, delay: 0.3, duration: 6 },
  { Icon: DotIcon, size: 14, top: 1180, side: "left", offset: 210, rotate: 0, opacity: 0.35, delay: 2.4, duration: 5 },
  { Icon: LightBulbIcon, size: 48, top: 1360, side: "left", offset: 170, rotate: 8, opacity: 0.6, delay: 1, duration: 6.5 },
  { Icon: StarIcon, size: 20, top: 1420, side: "left", offset: 50, rotate: 0, opacity: 0.45, delay: 1.9, duration: 5 },
  { Icon: OpenBookIcon, size: 66, top: 1520, side: "left", offset: 150, rotate: 5, opacity: 0.68, delay: 0.6, duration: 6 },
  { Icon: DotIcon, size: 12, top: 1600, side: "left", offset: 34, rotate: 0, opacity: 0.35, delay: 2.2, duration: 5 },
  { Icon: GraduationCapIcon, size: 66, top: 1680, side: "left", offset: 190, rotate: -10, opacity: 0.6, delay: 0.4, duration: 6.5 },
  { Icon: MagnifyingGlassIcon, size: 28, top: 1760, side: "left", offset: 44, rotate: 0, opacity: 0.45, delay: 1.4, duration: 5.5 },
  { Icon: LaptopIcon, size: 74, top: 1860, side: "left", offset: 130, rotate: 5, opacity: 0.65, delay: 0.9, duration: 6 },
  { Icon: DotIcon, size: 14, top: 1980, side: "left", offset: 220, rotate: 0, opacity: 0.35, delay: 2.6, duration: 5 },
  { Icon: BooksStackIcon, size: 50, top: 2040, side: "left", offset: 36, rotate: 8, opacity: 0.55, delay: 0.7, duration: 6.5 },
  { Icon: StarIcon, size: 18, top: 2140, side: "left", offset: 180, rotate: 0, opacity: 0.4, delay: 1.7, duration: 5 },
  { Icon: GlobeIcon, size: 44, top: 2220, side: "left", offset: 74, rotate: 0, opacity: 0.5, delay: 0.5, duration: 6 },
];

const RIGHT: Placement[] = [
  { Icon: HeadphonesIcon, size: 112, top: 44, side: "right", offset: 34, rotate: 8, opacity: 1, delay: 0.2, duration: 6 },
  { Icon: StarIcon, size: 24, top: 28, side: "right", offset: 212, rotate: 0, opacity: 0.6, delay: 1, duration: 5 },
  { Icon: RocketIcon, size: 78, top: 138, side: "right", offset: 118, rotate: 14, opacity: 0.92, delay: 0.7, duration: 6.5 },
  { Icon: DotIcon, size: 14, top: 178, side: "right", offset: 40, rotate: 0, opacity: 0.4, delay: 1.6, duration: 5.5 },
  { Icon: BooksStackIcon, size: 72, top: 258, side: "right", offset: 24, rotate: -5, opacity: 0.85, delay: 0.5, duration: 6 },
  { Icon: CertificateIcon, size: 96, top: 246, side: "right", offset: 164, rotate: 4, opacity: 0.9, delay: 1.3, duration: 7 },
  { Icon: MusicNoteIcon, size: 30, top: 398, side: "right", offset: 100, rotate: 8, opacity: 0.5, delay: 2.1, duration: 5 },
  { Icon: NotebookIcon, size: 66, top: 420, side: "right", offset: 206, rotate: -6, opacity: 0.8, delay: 1.9, duration: 6 },
  { Icon: PencilIcon, size: 68, top: 468, side: "right", offset: 54, rotate: 20, opacity: 0.85, delay: 0.4, duration: 6.5 },
  { Icon: CalendarIcon, size: 70, top: 558, side: "right", offset: 186, rotate: 5, opacity: 0.8, delay: 0.9, duration: 6 },
  { Icon: AtomIcon, size: 58, top: 604, side: "right", offset: 118, rotate: 0, opacity: 0.6, delay: 1.5, duration: 5.5 },
  { Icon: TargetIcon, size: 52, top: 640, side: "right", offset: 40, rotate: 0, opacity: 0.75, delay: 2.2, duration: 5 },
  { Icon: FlaskIcon, size: 66, top: 700, side: "right", offset: 56, rotate: -8, opacity: 0.85, delay: 0.6, duration: 6.5 },
  // --- continuation band (750px+) ---
  { Icon: StarIcon, size: 20, top: 800, side: "right", offset: 200, rotate: 0, opacity: 0.45, delay: 0.8, duration: 5 },
  { Icon: ChalkboardIcon, size: 60, top: 860, side: "right", offset: 30, rotate: -5, opacity: 0.7, delay: 1.1, duration: 6.5 },
  { Icon: DotIcon, size: 12, top: 960, side: "right", offset: 210, rotate: 0, opacity: 0.35, delay: 2.1, duration: 5 },
  { Icon: CalendarIcon, size: 56, top: 1030, side: "right", offset: 160, rotate: 6, opacity: 0.65, delay: 0.6, duration: 6 },
  { Icon: MusicNoteIcon, size: 26, top: 1090, side: "right", offset: 40, rotate: -8, opacity: 0.45, delay: 1.5, duration: 5.5 },
  { Icon: FlaskIcon, size: 58, top: 1210, side: "right", offset: 190, rotate: -6, opacity: 0.68, delay: 0.3, duration: 6 },
  { Icon: DotIcon, size: 14, top: 1170, side: "right", offset: 50, rotate: 0, opacity: 0.35, delay: 2.4, duration: 5 },
  { Icon: PencilIcon, size: 50, top: 1350, side: "right", offset: 34, rotate: 18, opacity: 0.6, delay: 0.9, duration: 6.5 },
  { Icon: StarIcon, size: 20, top: 1410, side: "right", offset: 200, rotate: 0, opacity: 0.45, delay: 1.8, duration: 5 },
  { Icon: NotebookIcon, size: 60, top: 1510, side: "right", offset: 150, rotate: -5, opacity: 0.65, delay: 0.5, duration: 6 },
  { Icon: DotIcon, size: 12, top: 1590, side: "right", offset: 220, rotate: 0, opacity: 0.35, delay: 2.3, duration: 5 },
  { Icon: TargetIcon, size: 48, top: 1670, side: "right", offset: 40, rotate: 0, opacity: 0.6, delay: 0.4, duration: 6.5 },
  { Icon: AtomIcon, size: 50, top: 1750, side: "right", offset: 180, rotate: 0, opacity: 0.5, delay: 1.3, duration: 5.5 },
  { Icon: RocketIcon, size: 62, top: 1850, side: "right", offset: 120, rotate: 10, opacity: 0.62, delay: 0.8, duration: 6 },
  { Icon: DotIcon, size: 14, top: 1970, side: "right", offset: 34, rotate: 0, opacity: 0.35, delay: 2.5, duration: 5 },
  { Icon: BooksStackIcon, size: 48, top: 2030, side: "right", offset: 200, rotate: 6, opacity: 0.55, delay: 0.6, duration: 6.5 },
  { Icon: StarIcon, size: 18, top: 2130, side: "right", offset: 40, rotate: 0, opacity: 0.4, delay: 1.6, duration: 5 },
  { Icon: HeadphonesIcon, size: 46, top: 2210, side: "right", offset: 160, rotate: 0, opacity: 0.5, delay: 0.5, duration: 6 },
];

const PLACEMENTS = [...LEFT, ...RIGHT];

export default function EducationBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block">
      {/* Shared gradient defs, referenced by every icon via url(#id) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="eduGradNavyTeal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#081B4B" />
            <stop offset="100%" stopColor="#18D4C5" />
          </linearGradient>
          <linearGradient id="eduGradTealAqua" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#18D4C5" />
            <stop offset="100%" stopColor="#4FE5D7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Atmosphere: soft radial glows */}
      <div
        className="absolute -left-24 -top-24 h-[520px] w-[520px] rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(79,229,215,0.16) 0%, rgba(79,229,215,0) 70%)" }}
      />
      <div
        className="absolute -right-24 top-20 h-[560px] w-[560px] rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(24,212,197,0.14) 0%, rgba(24,212,197,0) 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[420px] w-[900px] -translate-x-1/2 opacity-50"
        style={{ background: "radial-gradient(ellipse, rgba(255,153,51,0.08) 0%, rgba(255,153,51,0) 70%)" }}
      />

      {/* Soft wave near the bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-[0.06]"
        height="180"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
      >
        <path
          d="M0 100 C 240 40, 480 160, 720 100 C 960 40, 1200 160, 1440 100 L1440 180 L0 180 Z"
          fill="#18D4C5"
        />
      </svg>

      {/* Dotted learning-path curves */}
      <svg className="absolute left-0 top-0 h-[820px] w-64 opacity-[0.28]" viewBox="0 0 260 820">
        <path
          d="M60 90 C 20 160, 140 200, 110 280"
          fill="none"
          stroke="#18D4C5"
          strokeWidth="2"
          strokeDasharray="1 9"
          strokeLinecap="round"
        />
      </svg>
      <svg className="absolute right-0 top-0 h-[820px] w-64 opacity-[0.28]" viewBox="0 0 260 820">
        <path
          d="M200 90 C 240 170, 130 210, 160 300"
          fill="none"
          stroke="#18D4C5"
          strokeWidth="2"
          strokeDasharray="1 9"
          strokeLinecap="round"
        />
      </svg>

      {PLACEMENTS.map((pl, i) => (
        <div
          key={i}
          className="edu-float absolute"
          style={{
            top: pl.top,
            [pl.side]: pl.offset,
            opacity: pl.opacity,
            // @ts-expect-error -- CSS custom property, not a standard style key
            "--edu-rotate": `${pl.rotate}deg`,
            animationDelay: `${pl.delay}s`,
            animationDuration: `${pl.duration}s`,
          }}
        >
          <pl.Icon size={pl.size} />
        </div>
      ))}

      <style>{`
        .edu-float {
          animation-name: eduFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          transform: rotate(var(--edu-rotate, 0deg));
        }
        @keyframes eduFloat {
          0%, 100% { transform: translateY(0) rotate(var(--edu-rotate, 0deg)); }
          50% { transform: translateY(-9px) rotate(var(--edu-rotate, 0deg)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .edu-float { animation: none; }
        }
      `}</style>
    </div>
  );
}
