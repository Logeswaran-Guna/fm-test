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

function FloatingAccent({
  className,
  animation,
  delay = "0s",
  children,
}: {
  className: string;
  animation: string;
  delay?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden
      className={`absolute flex items-center justify-center ${className}`}
      style={{ animation: `${animation} ${animation.includes("pulse") ? "2.6s" : "4.5s"} ease-in-out ${delay} infinite` }}
    >
      {children}
    </div>
  );
}

function TutorVisual() {
  return (
    <>
      <svg viewBox="0 0 200 200" className="h-32 w-32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="30" y="130" width="140" height="10" rx="3" opacity="0.5" />
        <circle cx="70" cy="90" r="16" />
        <path d="M50 130c0-14 9-24 20-24s20 10 20 24" />
        <circle cx="140" cy="98" r="12" opacity="0.7" />
        <path d="M122 130c0-11 7-19 18-19s18 8 18 19" opacity="0.7" />
        <rect x="82" y="118" width="46" height="30" rx="4" />
        <path d="M90 128h30M90 136h20" opacity="0.7" />
      </svg>
      <FloatingAccent className="left-2 top-3 h-9 w-9 rounded-xl bg-amber/20 text-amber" animation="float-slow">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3L1 8l11 5 9-4.1V17h2V8z" /><path d="M5 12.5V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-4.5l-7 3.2z" /></svg>
      </FloatingAccent>
      <FloatingAccent className="right-4 top-6 h-8 w-8 rounded-full bg-emerald-400/20 text-emerald-300" animation="pulse-soft" delay="0.6s">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></svg>
      </FloatingAccent>
    </>
  );
}

function AiVisual() {
  return (
    <>
      <svg viewBox="0 0 200 200" className="h-32 w-32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="55" y="65" width="90" height="65" rx="16" />
        <circle cx="80" cy="95" r="6" />
        <circle cx="120" cy="95" r="6" />
        <path d="M80 114h40" />
        <path d="M100 65V45" />
        <circle cx="100" cy="40" r="5" opacity="0.7" />
        <path d="M55 90H38M55 108H38M165 90h-17M165 108h-17" opacity="0.7" />
        <rect x="72" y="140" width="56" height="14" rx="7" opacity="0.5" />
      </svg>
      <FloatingAccent className="right-2 top-4 h-9 w-9 rounded-xl bg-violet-400/20 text-violet-300" animation="spin-slow" delay="0s">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></svg>
      </FloatingAccent>
      <FloatingAccent className="left-4 bottom-16 h-7 w-7 rounded-full bg-amber/20 text-amber" animation="pulse-soft" delay="0.9s">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 16.5l-6.2 4.5 2.4-7.3L2 9.2h7.6z" /></svg>
      </FloatingAccent>
    </>
  );
}

function CreativeVisual() {
  return (
    <>
      <svg viewBox="0 0 200 200" className="h-32 w-32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="80" cy="76" r="14" />
        <path d="M62 130c0-16 8-28 18-28s18 12 18 28" />
        <path d="M96 108c14-4 26-16 30-32 6 2 10 8 8 16-4 16-20 26-34 28z" />
        <circle cx="128" cy="70" r="4" opacity="0.7" />
        <path d="M50 145q0-13 13-13t13 13-13 13-13-13z" />
        <path d="M63 132V80" />
      </svg>
      <FloatingAccent className="right-3 top-6 h-8 w-8 rounded-full bg-pink-400/20 text-pink-300" animation="float-slower" delay="0.3s">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 3v9.28A3.5 3.5 0 108.5 15V6h9V3z" /></svg>
      </FloatingAccent>
      <FloatingAccent className="left-3 bottom-14 h-7 w-7 rounded-full bg-amber/20 text-amber" animation="pulse-soft" delay="0.8s">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="8" cy="8" r="3" /><circle cx="16" cy="9" r="2.4" /><circle cx="12" cy="17" r="2.6" /></svg>
      </FloatingAccent>
    </>
  );
}

function SoftSkillsVisual() {
  return (
    <>
      <svg viewBox="0 0 200 200" className="h-32 w-32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M35 55a10 10 0 0110-10h60a10 10 0 0110 10v38a10 10 0 01-10 10H70l-18 15v-15h-7a10 10 0 01-10-10z" />
        <path d="M105 88h50a10 10 0 0110 10v28a10 10 0 01-10 10h-5v13l-15-13h-30a10 10 0 01-10-10v-6" opacity="0.7" />
        <path d="M52 72h32M52 86h22" />
      </svg>
      <FloatingAccent className="right-3 top-4 h-8 w-8 rounded-full bg-sky-400/20 text-sky-300" animation="float-slow" delay="0.2s">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2l2.6 6.6L22 9l-5.4 4.6L18 22l-6-4-6 4 1.4-8.4L2 9l7.4-.4z" /></svg>
      </FloatingAccent>
      <FloatingAccent className="left-2 bottom-16 h-7 w-7 rounded-full bg-amber/20 text-amber" animation="pulse-soft" delay="1.1s">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 11v5a2 2 0 002 2h6l3 3v-3h1a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2z" /><path d="M10 8V6a2 2 0 012-2 2 2 0 012 2c0 1.5-2 2-2 4" /></svg>
      </FloatingAccent>
    </>
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
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent px-5 py-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                {active.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
