import { describe, expect, it } from "vitest";
import { isLikelyBot, MIN_SUBMIT_SECONDS } from "./antiSpam";

describe("isLikelyBot", () => {
  it("flags a filled honeypot field regardless of timing", () => {
    const startedAt = Date.now() - (MIN_SUBMIT_SECONDS + 5) * 1000;
    expect(isLikelyBot("filled-by-bot", startedAt)).toBe(true);
  });

  it("flags a submission that's faster than the minimum fill time", () => {
    const startedAt = Date.now();
    expect(isLikelyBot("", startedAt)).toBe(true);
  });

  it("passes a genuine slow, empty-honeypot submission", () => {
    const startedAt = Date.now() - (MIN_SUBMIT_SECONDS + 2) * 1000;
    expect(isLikelyBot("", startedAt)).toBe(false);
  });

  it("treats a whitespace-only honeypot value as empty", () => {
    const startedAt = Date.now() - (MIN_SUBMIT_SECONDS + 2) * 1000;
    expect(isLikelyBot("   ", startedAt)).toBe(false);
  });
});
