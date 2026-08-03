export type MatchStatus =
  | "PROPOSED"
  | "DEMO_PROPOSED"
  | "DEMO_SCHEDULED"
  | "CONFIRMED"
  | "DECLINED";

export type MyMatch = {
  id: string;
  display_id: string;
  requirement_id: string;
  teacher_id: string;
  match_score: number | null;
  status: MatchStatus;
  demo_date: string | null;
  demo_time_slot: string | null;
  parent_accepted_demo: boolean;
  teacher_accepted_demo: boolean;
  scheduled_at: string | null;
  declined_by: string | null;
  decline_reason: string | null;
  parent_approved_at: string | null;
  created_at: string;
  subject: string;
  location: string | null;
  schedule_pref: string | null;
  student_name: string | null;
  student_grade: string | null;
  parent_name: string;
  parent_phone: string;
};

export type SessionStatus =
  | "LOGGED"
  | "PARENT_CONFIRMED"
  | "DISPUTED"
  | "ADMIN_VALIDATED";

export type MySession = {
  id: string;
  display_id: string;
  match_id: string;
  match_label: string;
  date: string;
  time_slot: string | null;
  duration_hours: number | null;
  status: SessionStatus;
  amount: number | null;
  payment_released: boolean;
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  LOGGED: "Logged — awaiting parent",
  PARENT_CONFIRMED: "Parent confirmed — awaiting admin",
  DISPUTED: "Disputed by parent",
  ADMIN_VALIDATED: "Validated",
};
