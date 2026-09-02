// Shared label treatment for form fields across find-tutor and
// become-a-tutor: a red asterisk marks a field as mandatory up front,
// and once validation actually fails on it, the label text plus a small
// red "!" badge join the input's own red border (each Field/ChipGroup
// component still applies that border itself) so the whole field reads
// as invalid at a glance, not just the border.
export default function FieldLabel({
  label,
  required,
  error,
}: {
  label: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${error ? "text-red-600" : ""}`}>
      {label}
      {required && <span className="text-red-500">*</span>}
      {error && (
        <span
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold leading-none text-red-600"
          aria-hidden="true"
        >
          !
        </span>
      )}
    </span>
  );
}
