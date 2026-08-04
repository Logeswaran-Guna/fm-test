function FmPreSchoolsLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden>
        <rect width="40" height="40" rx="10" fill="#0a192f" />
        <circle cx="20" cy="16" r="5" fill="#f59e0b" />
        <path d="M10 30c0-6 4.5-10 10-10s10 4 10 10" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <div className="leading-tight">
        <p className="font-heading text-sm font-bold text-navy">FM Pre Schools</p>
        <p className="text-[10px] uppercase tracking-wide text-slate-400">Early learning</p>
      </div>
    </div>
  );
}

function FmAcademyLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden>
        <rect width="40" height="40" rx="10" fill="#0a192f" />
        <path d="M20 12l13 6-13 6-13-6z" fill="#f59e0b" />
        <path d="M13 20v6c0 2.2 3.1 4 7 4s7-1.8 7-4v-6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
      <div className="leading-tight">
        <p className="font-heading text-sm font-bold text-navy">FM Academy</p>
        <p className="text-[10px] uppercase tracking-wide text-slate-400">Future skills</p>
      </div>
    </div>
  );
}

function TaprootzLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden>
        <rect width="40" height="40" rx="10" fill="#0f6e56" />
        <path d="M20 10v12M20 22c-4 0-6 3-6 7M20 22c4 0 6 3 6 7M20 22c-2.5 2-3.5 5-3 9M20 22c2.5 2 3.5 5 3 9" stroke="#e1f5ee" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
      <div className="leading-tight">
        <p className="font-heading text-sm font-bold text-navy">Taprootz Technologies</p>
        <p className="text-[10px] uppercase tracking-wide text-slate-400">Learning technology</p>
      </div>
    </div>
  );
}

const PARTNERS = [FmPreSchoolsLogo, FmAcademyLogo, TaprootzLogo];
// Duplicated so the marquee loop is seamless at the -50% mark.
const MARQUEE_ITEMS = [...PARTNERS, ...PARTNERS];

export default function Partners() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
            Growing with trusted partners
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            As Future Minds grows, we&apos;re building relationships with schools, learning academies, and education technology partners.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent"
        />
        <div
          className="flex w-max gap-4"
          style={{ animation: "marquee-scroll 28s linear infinite" }}
        >
          {MARQUEE_ITEMS.map((Logo, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm"
            >
              <Logo />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
