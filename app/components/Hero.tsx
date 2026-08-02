import Link from "next/link";

const stats = [
  { value: "4 hrs", label: "Avg. time to first match" },
  { value: "96%", label: "Attendance verified on time" },
  { value: "18+", label: "Learning categories live" },
];

export default function Hero() {
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

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 md:py-28">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
          <span className="h-px w-4 bg-amber" />
          Managed Learning Ecosystem
        </div>

        <h1 className="mt-5 max-w-2xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
          Every family&apos;s tutor search,{" "}
          <span className="bg-gradient-to-r from-amber to-amber/70 bg-clip-text text-transparent">
            personally guided
          </span>{" "}
          — not just listed.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          Future Minds gets to know what your child needs, hand-picks the
          right educator, sits in on the demo, and only releases payment once
          you&apos;ve confirmed the class actually happened.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/find-tutor"
            className="rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5"
          >
            Post a Requirement →
          </Link>
          <a
            href="#academy"
            className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Explore the Academy
          </a>
        </div>

        <div className="mt-12 flex flex-wrap gap-10">
          {stats.map((stat) => (
            <div key={stat.label}>
              <b className="block font-heading text-2xl text-white">
                {stat.value}
              </b>
              <span className="text-xs text-white/50">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
