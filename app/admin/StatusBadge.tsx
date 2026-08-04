import { STATUS_COLORS, type EntityStatus } from "./types";

const STATUS_OPTIONS: EntityStatus[] = ["ACTIVE", "IDLE", "REMOVED", "DELETED"];

export function StatusBadge({ status }: { status: EntityStatus }) {
  return (
    <span className={`text-xs font-semibold capitalize ${STATUS_COLORS[status]}`}>
      {status.toLowerCase()}
    </span>
  );
}

export function StatusSelect({
  status,
  disabled,
  onChange,
}: {
  status: EntityStatus;
  disabled?: boolean;
  onChange: (next: EntityStatus) => void;
}) {
  return (
    <select
      value={status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as EntityStatus)}
      className={`rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-amber/50 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_COLORS[status]}`}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option} value={option} className="text-navy">
          {option.charAt(0) + option.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}
