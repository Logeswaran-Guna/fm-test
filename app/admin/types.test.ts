import { describe, expect, it } from "vitest";
import {
  computeMatchScore,
  findMatchingTutors,
  fuzzyOverlap,
  type RequirementRow,
  type TutorRow,
} from "./types";

function makeRequirement(overrides: Partial<RequirementRow> = {}): RequirementRow {
  return {
    id: "req-1",
    display_id: "FMREQ1",
    subject: "Mathematics",
    mode: ["Online"],
    location: "Coimbatore",
    schedule_pref: "Weekday evenings",
    budget: 5000,
    preferred_teacher_gender: null,
    status: "open",
    created_at: new Date().toISOString(),
    parent_display_id: "FMPAR1",
    parent_name: "Parent",
    parent_phone: "9999999999",
    student_display_id: null,
    student_name: "Student",
    student_grade: "8th",
    match_id: null,
    match_label: null,
    match_status: null,
    match_score: null,
    demo_date: null,
    demo_time_slot: null,
    parent_accepted_demo: null,
    teacher_accepted_demo: null,
    teacher_id: null,
    teacher_display_id: null,
    teacher_name: null,
    parent_onetime_fee_amount: null,
    parent_fee_collected: null,
    ...overrides,
  };
}

function makeTutor(overrides: Partial<TutorRow> = {}): TutorRow {
  return {
    id: "tutor-1",
    display_id: "FMTEACH1",
    name: "Teacher",
    phone: "8888888888",
    email: null,
    qualification: "M.Sc",
    experience: "5 years",
    subjects: ["Mathematics"],
    preferred_locations: ["Coimbatore"],
    teaching_mode: ["Online"],
    availability: ["Weekday evenings"],
    rate_expectation: 4000,
    bank_upi_ref: null,
    kyc_status: "APPROVED",
    kyc_document_path: null,
    photo_url: null,
    tutoring_for: ["Academics"],
    boards: ["State Board"],
    rating: 4.5,
    languages: null,
    total_hours: 100,
    students_trained: 10,
    active_batches: 2,
    rating_avg: 4.5,
    rating_count: 10,
    user_id: "user-1",
    status: "ACTIVE",
    ...overrides,
  };
}

describe("fuzzyOverlap", () => {
  it("matches on substring, case-insensitively", () => {
    expect(fuzzyOverlap(["Math"], ["Mathematics"])).toBe(true);
    expect(fuzzyOverlap(["MATHEMATICS"], ["mathematics"])).toBe(true);
  });

  it("returns false when nothing overlaps", () => {
    expect(fuzzyOverlap(["Physics"], ["Mathematics", "Chemistry"])).toBe(false);
  });

  it("returns false for empty inputs", () => {
    expect(fuzzyOverlap([], ["Mathematics"])).toBe(false);
    expect(fuzzyOverlap(["Mathematics"], [])).toBe(false);
  });

  it("ignores blank strings", () => {
    expect(fuzzyOverlap([""], ["Mathematics"])).toBe(false);
  });
});

describe("computeMatchScore", () => {
  it("scores a fully-aligned tutor near the top of the range", () => {
    const score = computeMatchScore(makeRequirement(), makeTutor());
    expect(score).toBeGreaterThanOrEqual(90);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("penalizes a subject mismatch heavily (subject is the largest weight)", () => {
    const withMatch = computeMatchScore(makeRequirement(), makeTutor());
    const withoutMatch = computeMatchScore(
      makeRequirement(),
      makeTutor({ subjects: ["Physics"] })
    );
    expect(withoutMatch).toBeLessThan(withMatch);
    // Subject is worth 35 of 100 points — losing it should drop the score
    // by roughly that much, not just a token amount.
    expect(withMatch - withoutMatch).toBeGreaterThanOrEqual(30);
  });

  it("reduces the rate-fit component when the tutor's rate exceeds budget", () => {
    const withinBudget = computeMatchScore(makeRequirement({ budget: 5000 }), makeTutor({ rate_expectation: 4000 }));
    const overBudget = computeMatchScore(makeRequirement({ budget: 5000 }), makeTutor({ rate_expectation: 10000 }));
    expect(overBudget).toBeLessThan(withinBudget);
  });

  it("never returns a negative score even for a maximally mismatched tutor", () => {
    const score = computeMatchScore(
      makeRequirement({ subject: "Physics", location: "Chennai", mode: ["Home Tuition"], budget: 1000 }),
      makeTutor({
        subjects: ["Music"],
        preferred_locations: ["Delhi"],
        teaching_mode: ["Teacher Location"],
        rate_expectation: 100000,
        rating_avg: null,
      })
    );
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("doesn't crash and stays in range when optional fields are missing", () => {
    const score = computeMatchScore(
      makeRequirement({ location: null, schedule_pref: null, budget: null }),
      makeTutor({ rating_avg: null, rate_expectation: null, availability: [] })
    );
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("findMatchingTutors", () => {
  it("buckets subject+location matches as exact, subject-only elsewhere", () => {
    const requirement = makeRequirement({ subject: "Mathematics", location: "Coimbatore" });
    const exactTutor = makeTutor({ id: "t-exact", subjects: ["Mathematics"], preferred_locations: ["Coimbatore"] });
    const subjectOnlyTutor = makeTutor({ id: "t-subject", subjects: ["Mathematics"], preferred_locations: ["Chennai"] });
    const noMatchTutor = makeTutor({ id: "t-none", subjects: ["Physics"] });

    const { exact, subjectOnly } = findMatchingTutors(requirement, [exactTutor, subjectOnlyTutor, noMatchTutor]);

    expect(exact.map((t) => t.id)).toEqual(["t-exact"]);
    expect(subjectOnly.map((t) => t.id)).toEqual(["t-subject"]);
  });

  it("sorts each bucket by match score, highest first", () => {
    const requirement = makeRequirement({ subject: "Mathematics", location: "Coimbatore", budget: 5000 });
    const strongTutor = makeTutor({ id: "t-strong", rating_avg: 5, rate_expectation: 3000 });
    const weakTutor = makeTutor({ id: "t-weak", rating_avg: 1, rate_expectation: 9000 });

    const { exact } = findMatchingTutors(requirement, [weakTutor, strongTutor]);

    expect(exact.map((t) => t.id)).toEqual(["t-strong", "t-weak"]);
  });
});
