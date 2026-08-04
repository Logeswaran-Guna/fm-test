export type EntityStatus = "ACTIVE" | "IDLE" | "REMOVED" | "DELETED";

export const STATUS_COLORS: Record<EntityStatus, string> = {
  ACTIVE: "text-emerald-600",
  IDLE: "text-amber-600",
  REMOVED: "text-red-600",
  DELETED: "text-purple-600",
};
