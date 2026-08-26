"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profile";

type PendingRequirement = {
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
};

// Mounted once in the root layout so it runs no matter which page/device a
// parent lands on after confirming their email. The draft lives in the
// account's own auth metadata (set at signup time in find-tutor/page.tsx),
// not the browser — a localStorage-based version of this broke the moment
// someone confirmed on a different device than the one they filled the
// form out on, since the draft never existed on that device's browser.
export default function PendingRequirementResolver() {
  const [banner, setBanner] = useState<string | null>(null);
  // Guards against double-submission: onAuthStateChange can fire more than
  // once for the same session (e.g. INITIAL_SESSION then SIGNED_IN right
  // after a confirmation-link redirect), and each firing re-triggers a
  // check. Claimed before the RPC loop starts, released again on failure
  // so a later event can still retry.
  const resolvingRef = useRef(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function tryResolve() {
      // Claimed synchronously, before any `await`, so that two calls fired
      // back-to-back (the direct call plus INITIAL_SESSION/SIGNED_IN, all
      // within the same tick) can't both pass this check — the previous
      // version set this flag only after two awaits, which left a window
      // where multiple overlapping calls each independently created their
      // own duplicate student + requirement rows.
      if (resolvingRef.current) return;
      resolvingRef.current = true;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active || !user) {
        resolvingRef.current = false;
        return;
      }

      const pending = user.user_metadata?.pending_requirement as
        | PendingRequirement
        | undefined;
      if (!pending) {
        resolvingRef.current = false;
        return;
      }

      const profile = await getCurrentProfile(supabase);
      if (!active || !profile || profile.role !== "PARENT") {
        resolvingRef.current = false;
        return;
      }

      try {
        let studentId: string | null = null;
        for (const subject of pending.subjects) {
          const { data, error } = await supabase.rpc("submit_requirement", {
            p_subject: subject,
            p_mode: pending.modes,
            p_consent: true,
            p_location: pending.location,
            p_address: pending.address,
            p_pincode: pending.pincode,
            p_schedule_pref: pending.schedulePref,
            p_time_preference: pending.timePreference,
            p_pricing_type: pending.pricingType,
            p_budget: pending.budget,
            p_preferred_teacher_gender: pending.preferredGender,
            p_student_id: studentId ?? undefined,
            p_student_name: studentId ? undefined : pending.studentName,
            p_age_grade: studentId ? undefined : pending.ageGrade,
            p_whatsapp: pending.whatsapp,
            p_notes: pending.notes,
            p_prior_tutoring_experience: pending.priorExperience,
          });
          if (error) throw error;
          if (!studentId) studentId = data.student_id as string;
        }
        if (!active) return;
        // Clear it from the account so a future login never resubmits the
        // same requirement a second time.
        await supabase.auth.updateUser({ data: { pending_requirement: null } });
        setBanner(`Welcome back — your requirement for ${pending.studentName} has been submitted.`);
      } catch {
        // Leave it on the account and allow a later retry — either another
        // auth event on this same page load, or the next page load.
        resolvingRef.current = false;
      }
    }

    // Covers the common case: the session already exists by the time this
    // mounts (e.g. a normal logged-in page load).
    tryResolve();

    // Covers the confirmation-link race: this component can mount before
    // the Supabase client finishes detecting/exchanging the session from
    // the redirect URL, so the call above sees no user yet. These events
    // fire once that's actually settled.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        tryResolve();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!banner) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-amber px-4 py-2.5 text-center text-sm font-semibold text-navy shadow-md">
      <span>{banner}</span>
      <button
        type="button"
        onClick={() => setBanner(null)}
        className="rounded-full border border-navy/20 px-2.5 py-0.5 text-xs underline"
      >
        Dismiss
      </button>
    </div>
  );
}
