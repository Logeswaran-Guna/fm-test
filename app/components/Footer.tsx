export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy py-14 text-center text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl px-6 sm:px-8">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber">
          <span className="h-px w-4 bg-amber" />
          Learn Today. Lead Tomorrow.
          <span className="h-px w-4 bg-amber" />
        </div>

        <p className="font-heading text-lg font-semibold leading-relaxed text-amber-300 sm:text-xl">
          கற்க கசடறக் கற்பவை கற்றபின்
          <br />
          நிற்க அதற்குத் தக.
        </p>
        <p className="mt-2 font-mono text-[11px] text-white/40">
          திருக்குறள் · குறள் 391 · பால்: பொருட்பால் · அதிகாரம்: கல்வி (40ஆம் அதிகாரம்)
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="mb-2 font-mono text-[10.5px] uppercase tracking-widest text-amber-400">
              English
            </p>
            <p className="text-sm leading-relaxed text-white/80">
              Learn thoroughly whatever is worth learning — and once learned,
              live faithfully by what you have learned.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="mb-2 font-mono text-[10.5px] uppercase tracking-widest text-amber-400">
              हिन्दी
            </p>
            <p className="text-sm leading-relaxed text-white/80">
              जो सीखने योग्य है, उसे पूर्ण और त्रुटिरहित होकर सीखो; और सीखने के
              बाद, उसी अनुसार आचरण करो।
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-[11.5px] text-white/40">
          <span>Future Minds — Learn Today. Lead Tomorrow.</span>
          <span>© {new Date().getFullYear()} Future Minds. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
