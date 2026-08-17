"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import HeroEcosystem from "./HeroEcosystem";
import {
  BOARDS,
  CREATIVE_LEARNING_ITEMS,
  GRADE_BANDS,
  SOFT_SKILLS_ITEMS,
} from "@/lib/categories";

const ROTATE_MS = 6000;

// Which ecosystem nodes light up while each pillar tab is active — ties the
// rotating headline directly to the living map on the right.
const PILLAR_DOMAIN_MAP: Record<string, string[]> = {
  tutor: ["tutors", "academics", "exams"],
  ai: ["ai", "coding"],
  creative: ["music", "dance"],
  soft: ["communication", "languages"],
};

// Real, non-fabricated count of what the platform actually offers —
// distinct subjects across every grade band, plus boards, creative
// learning areas, and soft skills. Computed from the same taxonomy the
// forms use, not a made-up round number.
const CATEGORIES_LIVE =
  BOARDS.length +
  new Set(GRADE_BANDS.flatMap((b) => b.subjects)).size +
  CREATIVE_LEARNING_ITEMS.length +
  SOFT_SKILLS_ITEMS.length;

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

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:px-8 md:py-16 lg:grid-cols-2 lg:items-center lg:gap-8">
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

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              {active.lede}
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
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

          <div className="mt-8 flex flex-wrap gap-8">
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
          <p className="mt-3 max-w-md text-[11px] italic text-white/50">
            Live, unedited numbers — we&apos;re early, and growing one verified match at a time.
          </p>
        </div>

        <HeroEcosystem activeDomainKeys={PILLAR_DOMAIN_MAP[active.key] ?? []} />
      </div>
    </section>
  );
}
