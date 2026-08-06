"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { PillarHero, PillarSectionHeading, CardGrid, PillarCTAs } from "../components/PillarPage";

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

const PROGRAMS: Record<SubTab, { tag: string; title: string; points: string[]; ageBadge?: string }[]> = {
  music: [
    { tag: "Vocal", title: "Carnatic & Hindustani", points: ["Voice training basics", "Ragam & taalam foundations", "Performance-ready repertoire"] },
    { tag: "String", title: "Guitar", points: ["Acoustic & basic electric", "Chords, strumming & songs", "Beginner to intermediate"] },
    { tag: "Keys", title: "Keyboard", points: ["Note reading & theory", "Film & classical pieces", "Exam-track available"] },
    { tag: "String", title: "Violin", points: ["Carnatic & Western styles", "Bowing & posture fundamentals", "Group or solo lessons"] },
  ],
  dance: [
    { tag: "Classical", title: "Bharatanatyam", points: ["Adavus & postures", "Arangetram track available"] },
    { tag: "Modern", title: "Contemporary", points: ["Expression & freestyle", "Choreography basics"] },
    { tag: "Urban", title: "Hip-Hop", points: ["Beat & rhythm training", "Group performance routines"] },
    { tag: "Folk", title: "Folk & Regional", points: ["Bhangra, Garba & more", "Festival & event-ready sets"] },
  ],
  art: [
    { tag: "Drawing", title: "Drawing & Sketching", points: ["Pencil & charcoal basics", "Perspective & shading"] },
    { tag: "Colour", title: "Painting", points: ["Watercolour & acrylic", "Composition & technique"] },
    { tag: "Craft", title: "Arts & Crafts", points: ["DIY & mixed media", "Festival & project-based kits"] },
    { tag: "Digital", title: "Digital Art", points: ["Tablet-based illustration", "Beginner-friendly tools"] },
  ],
  abacus: [
    { tag: "Foundation", title: "Abacus Foundation", points: ["Bead reading & place value"], ageBadge: "Ages 5–7" },
    { tag: "Levels 1–4", title: "Mental Math", points: ["Visualization-based calculation"], ageBadge: "Ages 7–10" },
    { tag: "Levels 5–8", title: "Speed Arithmetic", points: ["Competition-track speed drills"], ageBadge: "Ages 10–13" },
    { tag: "All levels", title: "Abacus Competitions", points: ["Inter-batch & regional meets"] },
  ],
};

const TABS: { key: SubTab; label: string }[] = [
  { key: "music", label: "Music" },
  { key: "dance", label: "Dance" },
  { key: "art", label: "Art" },
  { key: "abacus", label: "Abacus" },
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
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  tab === t.key
                    ? "border-navy bg-navy text-white"
                    : "border-slate-200 text-slate-500 hover:border-navy hover:text-navy"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMS[tab].map((p) => (
              <div key={p.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {p.ageBadge && (
                  <span className="absolute right-4 top-4 rounded-full bg-navy/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-navy/70">
                    {p.ageBadge}
                  </span>
                )}
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">{p.tag}</div>
                <h4 className="mt-1.5 font-heading text-base font-semibold text-navy">{p.title}</h4>
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
