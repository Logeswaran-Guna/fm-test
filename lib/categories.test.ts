import { describe, expect, it } from "vitest";
import { BOARDS, GRADE_BANDS, MODES } from "./categories";

describe("GRADE_BANDS", () => {
  it("gives every band a non-empty label and at least one subject", () => {
    for (const band of GRADE_BANDS) {
      expect(band.label.length).toBeGreaterThan(0);
      expect(band.subjects.length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate grade-band labels", () => {
    const labels = GRADE_BANDS.map((b) => b.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("BOARDS", () => {
  it("is non-empty and has no duplicates", () => {
    expect(BOARDS.length).toBeGreaterThan(0);
    expect(new Set(BOARDS).size).toBe(BOARDS.length);
  });
});

describe("MODES", () => {
  it("includes Community Pooling, since backend logic keys off this exact label", () => {
    expect(MODES).toContain("Community Pooling");
  });
});
