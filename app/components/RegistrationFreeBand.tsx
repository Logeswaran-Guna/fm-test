// A dark-teal scrolling divider between Perks & Benefits and Testimonials —
// same marquee technique as LearnLeadBand, reinforcing the "one fee, only
// when matched" message right after the perks pitch.
const ITEMS = Array.from({ length: 12 });

export default function RegistrationFreeBand() {
  return (
    <div className="overflow-hidden bg-[#0B4F45] py-3" aria-hidden="true">
      <div className="flex w-max" style={{ animation: "marquee-scroll 38s linear infinite" }}>
        {ITEMS.map((_, i) => (
          <span key={i} className="flex shrink-0 items-center gap-5 pr-5">
            <span className="font-heading text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
              Registration is Free
            </span>
            <span className="text-[#4FE5D7]/60">&#10022;</span>
            <span className="font-heading text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
              Pay Only When You&apos;re Matched
            </span>
            <span className="text-[#4FE5D7]/60">&#10022;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
