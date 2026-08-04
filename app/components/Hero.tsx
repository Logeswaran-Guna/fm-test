"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  BOARDS,
  CREATIVE_LEARNING_ITEMS,
  GRADE_BANDS,
  SOFT_SKILLS_ITEMS,
} from "@/lib/categories";

const ROTATE_MS = 6000;

// Real, non-fabricated count of what the platform actually offers —
// distinct subjects across every grade band, plus boards, creative
// learning areas, and soft skills. Computed from the same taxonomy the
// forms use, not a made-up round number.
const CATEGORIES_LIVE =
  BOARDS.length +
  new Set(GRADE_BANDS.flatMap((b) => b.subjects)).size +
  CREATIVE_LEARNING_ITEMS.length +
  SOFT_SKILLS_ITEMS.length;

function TutorVisual() {
  return (
    <svg viewBox="0 0 200 200" className="h-24 w-24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 130V70a10 10 0 0110-10h40l20 20h50a10 10 0 0110 10v50a10 10 0 01-10 10H50a10 10 0 01-10-10z" />
      <path d="M70 100h60M70 118h40" />
      <circle cx="150" cy="150" r="22" />
      <path d="M141 150l6 6 12-13" />
    </svg>
  );
}

function AiVisual() {
  return (
    <svg viewBox="0 0 200 200" className="h-24 w-24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="55" y="60" width="90" height="70" rx="14" />
      <circle cx="80" cy="90" r="6" />
      <circle cx="120" cy="90" r="6" />
      <path d="M80 112h40" />
      <path d="M100 60V40M78 40h44" />
      <path d="M55 85H35M55 105H35M165 85h-20M165 105h-20" />
      <circle cx="100" cy="150" r="4" />
    </svg>
  );
}

function CreativeVisual() {
  return (
    <svg viewBox="0 0 200 200" className="h-24 w-24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M130 40c-30 0-55 25-55 55 0 15 10 22 22 22h6a10 10 0 000-20h-2a6 6 0 010-12h4a34 34 0 0034-34c8 0 15 3 20 8" />
      <circle cx="105" cy="72" r="4" />
      <circle cx="125" cy="60" r="4" />
      <circle cx="145" cy="72" r="4" />
      <path d="M55 140q0-14 14-14t14 14-14 14-14-14z" />
      <path d="M69 126V70" />
    </svg>
  );
}

function SoftSkillsVisual() {
  return (
    <svg viewBox="0 0 200 200" className="h-24 w-24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M35 60a10 10 0 0110-10h60a10 10 0 0110 10v40a10 10 0 01-10 10H70l-18 16v-16h-7a10 10 0 01-10-10z" />
      <path d="M105 90h50a10 10 0 0110 10v30a10 10 0 01-10 10h-5v14l-16-14h-29a10 10 0 01-10-10v-8" />
      <path d="M55 78h30M55 92h20" />
    </svg>
  );
}

type Pillar = {
  key: string;
  label: string;
  eyebrow: string;
  headline: string;
  emphasis: string;
  headlineEnd: string;
  lede: string;
  ctaPrimary: { text: string; href: string };
  ctaSecondary: { text: string; href: string };
  Visual: () => React.ReactNode;
};

const PILLARS: Pillar[] = [
  {
    key: "tutor",
    label: "Tutor Platform",
    eyebrow: "Managed Learning Ecosystem",
    headline: "Every family's tutor search, ",
    emphasis: "personally guided",
    headlineEnd: " — not just listed.",
    lede: "Future Minds gets to know what your child needs, hand-picks the right educator, sits in on the demo, and only releases payment once you've confirmed the class actually happened.",
    ctaPrimary: { text: "Post a Requirement →", href: "/find-tutor" },
    ctaSecondary: { text: "Become a Tutor", href: "/become-a-tutor" },
    Visual: TutorVisual,
  },
  {
    key: "ai",
    label: "AI & Robotics",
    eyebrow: "Future Skills",
    headline: "AI and robotics, taught the way kids actually ",
    emphasis: "build",
    headlineEnd: " it.",
    lede: "Project-based coding, robotics kits, and responsible AI usage — age-tiered tracks from first-time builders to teen AI creators.",
    ctaPrimary: { text: "Find an AI & Robotics Tutor →", href: "/find-tutor" },
    ctaSecondary: { text: "Become a Tutor", href: "/become-a-tutor" },
    Visual: AiVisual,
  },
  {
    key: "creative",
    label: "Creative Learning",
    eyebrow: "Music · Dance · Art",
    headline: "Music, dance and art — matched to a teacher whose style actually ",
    emphasis: "fits",
    headlineEnd: " your child.",
    lede: "From classical vocals to guitar, contemporary dance to abstract art — hand-picked educators for creative growth, not just technique.",
    ctaPrimary: { text: "Find a Creative Tutor →", href: "/find-tutor" },
    ctaSecondary: { text: "Become a Tutor", href: "/become-a-tutor" },
    Visual: CreativeVisual,
  },
  {
    key: "soft",
    label: "Soft Skills",
    eyebrow: "Communication · Confidence",
    headline: "Soft skills that stick — built through ",
    emphasis: "practice",
    headlineEnd: ", not lectures.",
    lede: "Public speaking, spoken English, interview skills, and confidence-building — coached one-on-one by educators who make it feel natural.",
    ctaPrimary: { text: "Find a Soft Skills Coach →", href: "/find-tutor" },
    ctaSecondary: { text: "Become a Tutor", href: "/become-a-tutor" },
    Visual: SoftSkillsVisual,
  },
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [stats, setStats] = useState<{ tutors: number; classes: number } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("public_landing_stats").then(({ data, error }) => {
      if (!error && data?.[0]) {
        setStats({ tutors: data[0].tutors_onboarded ?? 0, classes: data[0].classes_completed ?? 0 });
      }
    });
  }, []);

  function goTo(index: number) {
    setActiveIndex(index);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % PILLARS.length);
    }, ROTATE_MS);
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % PILLARS.length);
    }, ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const active = PILLARS[activeIndex];
  const Visual = active.Visual;

  return (
    <section className="relative overflow-hidden bg-navy">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-amber/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            {PILLARS.map((pillar, i) => (
              <button
                key={pillar.key}
                type="button"
                onClick={() => goTo(i)}
                className={`relative overflow-hidden rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  i === activeIndex
                    ? "border-amber text-white"
                    : "border-white/20 text-white/60 hover:text-white"
                }`}
              >
                {i === activeIndex && (
                  <span
                    key={activeIndex}
                    aria-hidden
                    className="absolute inset-0 bg-white/15"
                    style={{ animation: `fill-bar ${ROTATE_MS}ms linear` }}
                  />
                )}
                <span className="relative">{pillar.label}</span>
              </button>
            ))}
          </div>

          <div key={active.key} style={{ animation: "fade-in-up 400ms ease" }}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
              <span className="h-px w-4 bg-amber" />
              {active.eyebrow}
            </div>

            <h1 className="mt-5 max-w-2xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
              {active.headline}
              <span className="bg-gradient-to-r from-amber to-amber/70 bg-clip-text text-transparent">
                {active.emphasis}
              </span>
              {active.headlineEnd}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              {active.lede}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={active.ctaPrimary.href}
                className="rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5"
              >
                {active.ctaPrimary.text}
              </Link>
              <Link
                href={active.ctaSecondary.href}
                className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                {active.ctaSecondary.text}
              </Link>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-10">
            <div>
              <b className="block font-heading text-2xl text-white">
                {stats ? stats.tutors : "—"}
              </b>
              <span className="text-xs text-white/50">Tutors onboarded (KYC verified)</span>
            </div>
            <div>
              <b className="block font-heading text-2xl text-white">
                {stats ? stats.classes : "—"}
              </b>
              <span className="text-xs text-white/50">Classes completed &amp; confirmed</span>
            </div>
            <div>
              <b className="block font-heading text-2xl text-white">{CATEGORIES_LIVE}+</b>
              <span className="text-xs text-white/50">Learning categories live</span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div
            key={active.key}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            style={{ animation: "fade-in-up 450ms ease" }}
          >
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber/20 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="flex h-full flex-col items-center justify-center gap-4 text-amber">
              <Visual />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
                {active.label}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-black/30 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] text-white/60">
                Real photos &amp; videos of our students and educators — coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
