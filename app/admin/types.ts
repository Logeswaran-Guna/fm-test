export type MatchStatus =
  | "PROPOSED"
  | "DEMO_PROPOSED"
  | "DEMO_SCHEDULED"
  | "CONFIRMED"
  | "DECLINED";

export type RequirementRow = {
  id: string;
  display_id: string;
  subject: string;
  mode: string;
  location: string | null;
  schedule_pref: string | null;
  budget: number | null;
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
  teaching_mode: string | null;
  availability: string[] | null;
  rate_expectation: number | null;
  bank_upi_ref: string | null;
  kyc_status: string;
  rating: number | null;
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

  return { exact, subjectOnly };
}
