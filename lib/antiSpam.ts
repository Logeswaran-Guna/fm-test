// Two lightweight, dependency-free spam signals for public forms:
// a honeypot field real users never see or fill, and a minimum time
// between page load and submit (scripted bots typically fill and submit
// near-instantly). Neither requires an external service or account setup
// — see supabase/migrations/0015_requirement_submission_throttle.sql for
// the server-side layer, which is what actually matters if someone
// bypasses the form and calls the RPC directly.
export const MIN_SUBMIT_SECONDS = 3;

export function isLikelyBot(honeypotValue: string, startedAtMs: number): boolean {
  if (honeypotValue.trim() !== "") return true;
  if (Date.now() - startedAtMs < MIN_SUBMIT_SECONDS * 1000) return true;
  return false;
}
