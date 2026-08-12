import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-[#FAFBFC] px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-lg text-center">
          <span className="font-heading text-7xl font-bold text-amber sm:text-8xl">404</span>
          <h1 className="mt-4 font-heading text-2xl font-semibold text-navy sm:text-3xl">
            This page wandered off somewhere.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            The link you followed might be broken, or the page may have moved. Let&apos;s get you back on track.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5"
            >
              Back to Home
            </Link>
            <Link
              href="/find-tutor"
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-navy"
            >
              Find a Tutor
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
