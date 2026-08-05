// Invisible to real users (positioned off-screen, not display:none —
// some bots skip display:none fields, fewer skip this) and never
// reachable by keyboard/screen reader (tabIndex -1, aria-hidden). A
// script that blindly fills every input on the page will fill this one;
// a human filling out the visible form never sees it. Paired with
// isLikelyBot() in lib/antiSpam.ts.
export default function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor="company-website">Leave this field blank</label>
      <input
        id="company-website"
        name="company-website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
