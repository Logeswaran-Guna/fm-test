"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      // Fixed at a constant viewport position, but pages scroll from a
      // short navy hero band into a white/slate-50 body — a translucent
      // white-on-navy style (the old "dark" variant) disappeared entirely
      // once scrolled past the hero. Solid amber has real contrast
      // against both navy and white, so it stays visible regardless of
      // scroll position or which background happens to be underneath it.
      className={`fixed left-4 top-[4.75rem] z-40 flex h-10 w-10 items-center justify-center rounded-full bg-amber text-navy shadow-lg shadow-amber/30 transition-all hover:-translate-x-0.5 hover:bg-amber/90 sm:left-6 ${className}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
