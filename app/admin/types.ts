export type MatchStatus =
  | "PROPOSED"
  | "DEMO_PROPOSED"
  | "DEMO_SCHEDULED"
  | "CONFIRMED"
  | "DECLINED";

export type { EntityStatus } from "@/lib/status";
export { STATUS_COLORS } from "@/lib/status";
import type { EntityStatus } from "@/lib/status";

export type RequirementRow = {
  id: string;
  display_id: string;
  subject: string;
  mode: string[];
  location: string | null;
  schedule_pref: string | null;
  budget: number | null;
  preferred_teacher_gender: string | null;
  status: "open" | "assigned";
  created_at: string;
  parent_display_id: string;
  parent_name: string;
  parent_phone: string;
  student_display_id: string | null;
  student_name: string | null;
  student_grade: string | null;
  match_id: string | null;
  match_label: string | null;
  match_status: MatchStatus | null;
  match_score: number | null;
  demo_date: string | null;
  demo_time_slot: string | null;
  parent_accepted_demo: boolean | null;
  teacher_accepted_demo: boolean | null;
  teacher_id: string | null;
  teacher_display_id: string | null;
  teacher_name: string | null;
  parent_onetime_fee_amount: number | null;
  parent_fee_collected: boolean | null;
};

export type TutorLanguage = {
  language: string;
  can_read: boolean;
  can_write: boolean;
  can_speak: boolean;
};

export type TutorRow = {
  id: string;
  display_id: string;
  name: string;
  phone: string;
  email: string | null;
  qualification: string | null;
  experience: string | null;
  subjects: string[] | null;
  preferred_locations: string[] | null;
  teaching_mode: string[] | null;
  availability: string[] | null;
  rate_expectation: number | null;
  bank_upi_ref: string | null;
  kyc_status: string;
  kyc_document_path: string | null;
  photo_url: string | null;
  tutoring_for: string[] | null;
  boards: string[] | null;
  rating: number | null;
  languages: TutorLanguage[] | null;
  total_hours: number | null;
  students_trained: number | null;
  active_batches: number | null;
  rating_avg: number | null;
  rating_count: number | null;
  user_id: string;
  status: EntityStatus;
};

export type ParentStudent = {
  id: string;
  display_id: string;
  student_name: string | null;
  age_grade: string | null;
  status: EntityStatus;
};

export type ParentRow = {
  id: string;
  display_id: string;
  name: string;
  phone: string;
  email: string | null;
  status: EntityStatus;
  created_at: string;
  students: ParentStudent[];
};

export type PoolingGroupStatus = "FORMING" | "ACTIVE" | "CLOSED";

export type PoolingMember = {
  match_id: string;
  match_display_id: string;
  parent_name: string;
  student_name: string | null;
  pool_amount: number | null;
  commission_owed: number | null;
  collected: boolean;
};

export type PoolingGroupRow = {
  id: string;
  display_id: string;
  subject: string;
  location: string | null;
  status: PoolingGroupStatus;
  notes: string | null;
  created_at: string;
  teacher_id: string | null;
  teacher_display_id: string | null;
  teacher_name: string | null;
  member_count: number;
  unpaid_gross: number;
  suggested_commission_percent: number | null;
  total_pool_amount: number;
  total_parent_commission_owed: number;
  total_parent_commission_collected: number;
  members: PoolingMember[];
};

export type AcademyCourseStatus = "OPEN" | "COMING_SOON" | "CLOSED";

export type AcademyCourseRow = {
  id: string;
  display_id: string;
  title: string;
  age_range: string | null;
  format: string | null;
  description: string | null;
  duration: string | null;
  price: number | null;
  status: AcademyCourseStatus;
  display_order: number;
  image_url: string | null;
  enrollment_count: number;
};

export type AcademyEnrollmentStatus = "NEW" | "CONTACTED" | "ENROLLED" | "DECLINED";

export type AcademyEnrollmentRow = {
  id: string;
  display_id: string;
  course_id: string;
  course_title: string;
  enrollee_name: string;
  student_name: string | null;
  student_age: string | null;
  contact_phone: string;
  contact_email: string | null;
  notes: string | null;
  status: AcademyEnrollmentStatus;
  created_at: string;
};

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  PROPOSED: "Match Proposed",
  DEMO_PROPOSED: "Demo Proposed",
  DEMO_SCHEDULED: "Demo Scheduled",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function fuzzyOverlap(a: string[], b: string[]): boolean {
  return a.some((itemA) => {
    const na = normalize(itemA);
    if (!na) return false;
    return b.some((itemB) => {
      const nb = normalize(itemB);
      return nb.length > 0 && (na.includes(nb) || nb.includes(na));
    });
  });
}

export function findMatchingTutors(
  requirement: RequirementRow,
  tutors: TutorRow[]
): { exact: TutorRow[]; subjectOnly: TutorRow[] } {
  const reqSubjects = [requirement.subject];
  const reqLocations = requirement.location ? [requirement.location] : [];

  const subjectMatches = tutors.filter((tutor) =>
    fuzzyOverlap(reqSubjects, tutor.subjects ?? [])
  );

  const exact = subjectMatches.filter((tutor) =>
    fuzzyOverlap(reqLocations, tutor.preferred_locations ?? [])
  );

  const subjectOnly = subjectMatches.filter(
    (tutor) => !exact.some((match) => match.id === tutor.id)
  );

  const byScore = (a: TutorRow, b: TutorRow) =>
    computeMatchScore(requirement, b) - computeMatchScore(requirement, a);

  return { exact: [...exact].sort(byScore), subjectOnly: [...subjectOnly].sort(byScore) };
}

// Weighted 0-100 match score surfaced to admins when choosing a tutor for a
// requirement. Weights reflect what actually determines whether a match
// works out in practice: subject fit matters most, then mode/location/
// availability logistics, then rating and rate fit as tie-breakers.
const SCORE_WEIGHTS = {
  subject: 35,
  mode: 20,
  location: 15,
  availability: 10,
  rating: 10,
  rateFit: 10,
} as const;

function normalizeList(values: string[] | null | undefined): string[] {
  return (values ?? []).map((v) => v.trim().toLowerCase()).filter(Boolean);
}

// Fraction of `want` covered by `have`, fuzzily. Neutral (not zero) credit
// when either side hasn't specified, since an unfilled optional field
// shouldn't tank a tutor's score the same way an actual mismatch should.
function overlapRatio(want: string[], have: string[]): number {
  const w = normalizeList(want);
  if (w.length === 0) return 0.7;
  const h = normalizeList(have);
  if (h.length === 0) return 0.3;
  const matched = w.filter((item) => h.some((hv) => hv.includes(item) || item.includes(hv))).length;
  return matched / w.length;
}

export function computeMatchScore(requirement: RequirementRow, tutor: TutorRow): number {
  const subjectScore = fuzzyOverlap([requirement.subject], tutor.subjects ?? []) ? 1 : 0;

  const modeScore = overlapRatio(requirement.mode ?? [], tutor.teaching_mode ?? []);

  const locationRelevant = (requirement.mode ?? []).some((m) => m !== "Online");
  const locationScore = !locationRelevant
    ? 1
    : requirement.location
      ? overlapRatio([requirement.location], tutor.preferred_locations ?? [])
      : 0.7;

  const availabilityScore = overlapRatio(
    requirement.schedule_pref ? [requirement.schedule_pref] : [],
    tutor.availability ?? []
  );

  const ratingScore = tutor.rating_avg != null ? Math.min(tutor.rating_avg, 5) / 5 : 0.6;

  let rateFitScore = 0.7;
  if (requirement.budget != null && tutor.rate_expectation != null && requirement.budget > 0) {
    rateFitScore =
      tutor.rate_expectation <= requirement.budget
        ? 1
        : Math.max(0, 1 - (tutor.rate_expectation - requirement.budget) / requirement.budget);
  }

  const weighted =
    subjectScore * SCORE_WEIGHTS.subject +
    modeScore * SCORE_WEIGHTS.mode +
    locationScore * SCORE_WEIGHTS.location +
    availabilityScore * SCORE_WEIGHTS.availability +
    ratingScore * SCORE_WEIGHTS.rating +
    rateFitScore * SCORE_WEIGHTS.rateFit;

  return Math.round(weighted);
}
