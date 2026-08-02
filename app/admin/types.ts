export type RecordStatus =
  | "Pending"
  | "Matched"
  | "Demo Scheduled"
  | "Completed";

export const STATUS_OPTIONS: RecordStatus[] = [
  "Pending",
  "Matched",
  "Demo Scheduled",
  "Completed",
];

/**
 * Status values in the database may be stored with different casing or
 * separators (e.g. "pending", "demo_scheduled"). Normalize any incoming
 * value to one of our canonical display statuses so badges, filters, and
 * counts stay correct regardless of how a row was written.
 */
export function normalizeStatus(value: string | null | undefined): RecordStatus {
  const normalized = (value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");
  const match = STATUS_OPTIONS.find(
    (option) => option.toLowerCase() === normalized
  );
  return match ?? "Pending";
}

export type RequirementRow = {
  id: string;
  parent_name: string | null;
  student_name: string | null;
  grade_class: string | null;
  subjects_needed: string | null;
  location_address: string | null;
  phone_number: string | null;
  status: RecordStatus | null;
  created_at: string | null;
};

export type TutorRow = {
  id: string;
  full_name: string | null;
  qualifications: string | null;
  years_experience: string | null;
  subjects_handled: string[] | null;
  preferred_locations: string[] | null;
  teaching_mode: string | null;
  phone_number: string | null;
  status: RecordStatus | null;
  created_at: string | null;
};

export function splitList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

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
  const reqSubjects = splitList(requirement.subjects_needed);
  const reqLocations = splitList(requirement.location_address);

  const subjectMatches = tutors.filter((tutor) =>
    fuzzyOverlap(reqSubjects, tutor.subjects_handled ?? [])
  );

  const exact = subjectMatches.filter((tutor) =>
    fuzzyOverlap(reqLocations, tutor.preferred_locations ?? [])
  );

  const subjectOnly = subjectMatches.filter(
    (tutor) => !exact.some((match) => match.id === tutor.id)
  );

  return { exact, subjectOnly };
}
