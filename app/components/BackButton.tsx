"use client";

import { useRouter } from "next/navigation";

export default function BackButton({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      className={`fixed left-4 top-[4.75rem] z-40 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all hover:-translate-x-0.5 sm:left-6 ${
        variant === "dark"
          ? "border border-white/20 bg-white/10 text-white hover:bg-white/20"
          : "border border-slate-200 bg-white text-navy shadow-sm hover:border-navy hover:bg-navy hover:text-white"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
