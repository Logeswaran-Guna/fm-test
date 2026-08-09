// A thin scrolling divider that separates the navy hero from the navy
// journey band below it — without it the two sections run together with
// no visible seam.
const ITEMS = Array.from({ length: 12 });

export default function LearnLeadBand() {
  return (
    <div className="overflow-hidden bg-amber py-3" aria-hidden="true">
      <div className="flex w-max" style={{ animation: "marquee-scroll 22s linear infinite" }}>
        {ITEMS.map((_, i) => (
          <span key={i} className="flex shrink-0 items-center gap-5 pr-5">
            <span className="font-heading text-lg font-bold uppercase tracking-wide text-navy sm:text-xl">
              Learn Today
            </span>
            <span className="text-navy/40">&#10022;</span>
            <span className="font-heading text-lg font-bold uppercase tracking-wide text-navy sm:text-xl">
              Lead Tomorrow
            </span>
            <span className="text-navy/40">&#10022;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
