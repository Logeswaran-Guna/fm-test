import { BOARDS, SOFT_SKILLS_ITEMS } from "@/lib/categories";
import { ChipRow } from "./PillarPage";

const categories = [
  ...BOARDS,
  "Academics (Pre-Primary – Higher Secondary (K-12))",
  "Music & Instruments",
  "Dance",
  "Art",
  "Abacus",
  ...SOFT_SKILLS_ITEMS,
];

export default function LearningCategories() {
  return (
    <section className="bg-white pt-6 pb-6 sm:pb-8">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            <span className="h-px w-6 bg-amber-700" aria-hidden />
            What you can learn
          </span>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-navy sm:text-3xl">
            Learning categories
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Academic, creative and future-skills categories live today.
          </p>
        </div>
        <div className="rounded-3xl border border-amber/20 bg-amber/5 p-6 sm:p-8">
          <ChipRow items={categories} />
        </div>
      </div>
    </section>
  );
}
