"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { PillarHero, PillarSectionHeading, CardGrid, PillarCTAs } from "../components/PillarPage";
import { getCategoryIcon } from "../components/categoryIcons";

const cornerIconProps = {
  viewBox: "0 0 24 24",
  width: 26,
  height: 26,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const cornerIcons = {
  mic: (
    <svg {...cornerIconProps}>
      <path d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3z" />
      <path d="M6 11a6 6 0 0012 0" />
      <path d="M12 17v4M9 21h6" />
    </svg>
  ),
  guitar: (
    <svg {...cornerIconProps}>
      <circle cx="8" cy="17" r="3.2" />
      <path d="M9.8 14.8L17 6M15 4l3 3M13 8l2 2" />
    </svg>
  ),
  keys: (
    <svg {...cornerIconProps}>
      <rect x="3" y="8" width="18" height="10" rx="1.5" />
      <path d="M7 8v6M11 8v6M15 8v6M19 8v6" />
    </svg>
  ),
  violin: (
    <svg {...cornerIconProps}>
      <path d="M11 3v4" />
      <path d="M9 7c0-1 .9-1.6 2-1.6s2 .6 2 1.6c0 1.4-1.6 1.6-2 3-.4-1.4-2-1.6-2-3z" />
      <path d="M11 10v8a2.5 2.5 0 11-2.2-2.5" />
    </svg>
  ),
  classical: (
    <svg {...cornerIconProps}>
      <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 5.5v5M12 7l-4 2M12 7l4 2M12 10.5l-3 6M12 10.5l3 6" />
    </svg>
  ),
  flow: (
    <svg {...cornerIconProps}>
      <circle cx="9" cy="4" r="1.4" fill="currentColor" stroke="none" />
      <path d="M9 5.4c1 2 4 2.5 5 5s-1 6-4 7" />
    </svg>
  ),
  cap: (
    <svg {...cornerIconProps}>
      <path d="M4 14a8 8 0 0116 0" />
      <path d="M4 14h16v2a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  drum: (
    <svg {...cornerIconProps}>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v8a7 3 0 0014 0V7" />
    </svg>
  ),
  pencil: (
    <svg {...cornerIconProps}>
      <path d="M4 20l3.5-1 11-11a2.1 2.1 0 00-3-3l-11 11z" />
      <path d="M14.5 6L18 9.5" />
    </svg>
  ),
  brush: (
    <svg {...cornerIconProps}>
      <path d="M14 3c2 0 4 2 4 4 0 1.5-1 2.5-2 3l-5 5-3-3 5-5c.5-1 1.5-2 3-2z" />
      <path d="M9 15l-4 4 2 2 4-4" />
    </svg>
  ),
  scissors: (
    <svg {...cornerIconProps}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <path d="M7.5 7.5L20 20M7.5 16.5L20 4" />
    </svg>
  ),
  tablet: (
    <svg {...cornerIconProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 21h6" />
      <path d="M14 8l3 3-6 6-3.5.5.5-3.5z" />
    </svg>
  ),
  abacus: (
    <svg {...cornerIconProps}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9h16M4 14h16" />
      <circle cx="8" cy="6.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="13" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  bulb: (
    <svg {...cornerIconProps}>
      <path d="M9 18h6M10 21h4M8 14a4 4 0 118 0c0 2-1 3-1.5 4h-5C8 17 8 16 8 14z" />
      <path d="M12 2v2M6 6l1.5 1.5M18 6l-1.5 1.5" />
    </svg>
  ),
  stopwatch: (
    <svg {...cornerIconProps}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13V8M9 2h6M12 2v2" />
    </svg>
  ),
  trophy: (
    <svg {...cornerIconProps}>
      <path d="M8 4h8v4a4 4 0 01-8 0z" />
      <path d="M8 4H5a3 3 0 003 3M16 4h3a3 3 0 01-3 3" />
      <path d="M12 12v4M9 20h6M10 16h4v4h-4z" />
    </svg>
  ),
};

const formatIcon = {
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const FORMATS = [
  {
    title: "Online Classes",
    description: "Live-streamed sessions, one-to-one or small group.",
    icon: (
      <svg {...formatIcon}>
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "Home / Studio",
    description: "At home, or at the teacher's own practice space.",
    icon: (
      <svg {...formatIcon}>
        <path d="M4 11l8-7 8 7" />
        <path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" />
      </svg>
    ),
  },
  {
    title: "Community Pooling",
    description: "Shared batch at the clubhouse or community hall.",
    unique: true,
    icon: (
      <svg {...formatIcon}>
        <circle cx="8" cy="9" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <path d="M14.5 14.5c2.5.3 4.5 2.6 4.5 5.5" />
      </svg>
    ),
  },
  {
    title: "Recital & Event Support",
    description: "Costume, staging and performance coordination.",
    icon: (
      <svg {...formatIcon}>
        <path d="M12 2l2.6 6.6L22 9l-5.4 4.6L18 22l-6-4-6 4 1.4-8.4L2 9l7.4-.4z" />
      </svg>
    ),
  },
];

type SubTab = "music" | "dance" | "art" | "abacus";

type Program = {
  tag: string;
  title: string;
  points: string[];
  ageBadge?: string;
  cornerIcon: keyof typeof cornerIcons;
};

const PROGRAMS: Record<SubTab, Program[]> = {
  music: [
    { tag: "Vocal", title: "Carnatic & Hindustani", points: ["Voice training basics", "Ragam & taalam foundations", "Performance-ready repertoire"], cornerIcon: "mic" },
    { tag: "String", title: "Guitar", points: ["Acoustic & basic electric", "Chords, strumming & songs", "Beginner to intermediate"], cornerIcon: "guitar" },
    { tag: "Keys", title: "Keyboard", points: ["Note reading & theory", "Film & classical pieces", "Exam-track available"], cornerIcon: "keys" },
    { tag: "String", title: "Violin", points: ["Carnatic & Western styles", "Bowing & posture fundamentals", "Group or solo lessons"], cornerIcon: "violin" },
  ],
  dance: [
    { tag: "Classical", title: "Bharatanatyam", points: ["Adavus & postures", "Arangetram track available"], cornerIcon: "classical" },
    { tag: "Modern", title: "Contemporary", points: ["Expression & freestyle", "Choreography basics"], cornerIcon: "flow" },
    { tag: "Urban", title: "Hip-Hop", points: ["Beat & rhythm training", "Group performance routines"], cornerIcon: "cap" },
    { tag: "Folk", title: "Folk & Regional", points: ["Bhangra, Garba & more", "Festival & event-ready sets"], cornerIcon: "drum" },
  ],
  art: [
    { tag: "Drawing", title: "Drawing & Sketching", points: ["Pencil & charcoal basics", "Perspective & shading"], cornerIcon: "pencil" },
    { tag: "Colour", title: "Painting", points: ["Watercolour & acrylic", "Composition & technique"], cornerIcon: "brush" },
    { tag: "Craft", title: "Arts & Crafts", points: ["DIY & mixed media", "Festival & project-based kits"], cornerIcon: "scissors" },
    { tag: "Digital", title: "Digital Art", points: ["Tablet-based illustration", "Beginner-friendly tools"], cornerIcon: "tablet" },
  ],
  abacus: [
    { tag: "Foundation", title: "Abacus Foundation", points: ["Bead reading & place value"], ageBadge: "Ages 5–7", cornerIcon: "abacus" },
    { tag: "Levels 1–4", title: "Mental Math", points: ["Visualization-based calculation"], ageBadge: "Ages 7–10", cornerIcon: "bulb" },
    { tag: "Levels 5–8", title: "Speed Arithmetic", points: ["Competition-track speed drills"], ageBadge: "Ages 10–13", cornerIcon: "stopwatch" },
    { tag: "All levels", title: "Abacus Competitions", points: ["Inter-batch & regional meets"], cornerIcon: "trophy" },
  ],
};

const TABS: { key: SubTab; label: string; icon: string }[] = [
  { key: "music", label: "Music", icon: "Music & Instruments" },
  { key: "dance", label: "Dance", icon: "Dance" },
  { key: "art", label: "Art", icon: "Art" },
  { key: "abacus", label: "Abacus", icon: "Abacus" },
];

export default function CreativeLearningPage() {
  const [tab, setTab] = useState<SubTab>("music");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BackButton />
      <main className="flex-1 bg-slate-50">
        <PillarHero
          eyebrow="Creative Learning"
          headline="Music, dance, art and abacus — creative development, one educator at a time."
          description="From the first Sa-Re-Ga-Ma to a first stage performance, from a pencil sketch to a mental-math sprint — matched to a teacher whose style fits your child."
          stats={[
            { value: "4", label: "Creative disciplines" },
            { value: "14+", label: "Styles & tracks live" },
            { value: "All ages", label: "Beginner to advanced" },
          ]}
        />

        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <div className="mb-8 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  tab === t.key
                    ? "border-navy bg-navy text-white"
                    : "border-slate-200 text-slate-500 hover:border-navy hover:text-navy"
                }`}
              >
                <span aria-hidden className="opacity-80">
                  {getCategoryIcon(t.icon)}
                </span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMS[tab].map((p, i) => (
              <div key={p.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span
                  aria-hidden
                  className={`absolute right-4 top-4 ${i % 2 === 0 ? "text-amber-600" : "text-navy"}`}
                >
                  {cornerIcons[p.cornerIcon]}
                </span>
                {p.ageBadge && (
                  <span className="absolute bottom-4 right-4 rounded-full bg-navy/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-navy/70">
                    {p.ageBadge}
                  </span>
                )}
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">{p.tag}</div>
                <h4 className="mt-1.5 max-w-[75%] font-heading text-base font-semibold text-navy">{p.title}</h4>
                <ul className="mt-2.5 space-y-1 text-sm leading-relaxed text-slate-500">
                  {p.points.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <PillarSectionHeading title="Formats" />
            <CardGrid items={FORMATS} />
          </div>

          <PillarCTAs
            primary={{ text: "Find a Creative Tutor →", href: "/find-tutor" }}
            secondary={{ text: "Become a Tutor", href: "/become-a-tutor" }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
