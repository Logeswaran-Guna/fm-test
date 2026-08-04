import { STATUS_COLORS, type EntityStatus } from "@/lib/status";

// Read-only — reflects whatever admin has set (or the automatic
// Active/Idle self-heal) in Manage Users. Not editable from here.
export default function StatusBadge({ status }: { status: EntityStatus }) {
  return (
    <span className={`text-xs font-semibold capitalize ${STATUS_COLORS[status]}`}>
      {status.toLowerCase()}
    </span>
  );
}
