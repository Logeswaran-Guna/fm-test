// Bridges the gap between "form submitted" and "account has a session".
// When email confirmation is required, signUp() returns no session, so the
// find-tutor form can't call submit_requirement yet — but the parent has
// already typed in their kid's info. This stashes that draft locally so
// PendingRequirementResolver can finish the submission automatically the
// moment the parent is actually logged in (wherever they land after
// clicking the confirmation link), instead of silently losing it.

const STORAGE_KEY = "fm_pending_requirement";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type PendingRequirement = {
  email: string;
  studentName: string;
  ageGrade: string;
  subjects: string[];
  modes: string[];
  location: string;
  address: string;
  pincode: string;
  schedulePref: string;
  timePreference?: string;
  pricingType: string;
  budget: number;
  preferredGender: string;
  whatsapp: string;
  notes?: string;
  priorExperience?: string;
  savedAt: number;
};

export function savePendingRequirement(data: Omit<PendingRequirement, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {
    // Storage unavailable (private browsing, quota) — the draft is lost,
    // same as before this feature existed. Not worth surfacing an error for.
  }
}

export function loadPendingRequirement(): PendingRequirement | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingRequirement;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      clearPendingRequirement();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingRequirement(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — worst case the stale entry gets overwritten or
    // expires on its own via the MAX_AGE_MS check above.
  }
}
