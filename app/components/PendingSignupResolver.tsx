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

type PendingTeacherProfile = {
  qualification: string;
  experience: string;
  subjects: string[];
  preferredLocations: string[];
  teachingMode: string[];
  rateExpectation: number | null;
  bankUpiRef: string | null;
  bankIfsc: string | null;
  bankHolderName: string | null;
  bankBranch: string | null;
  whatsapp: string;
  address: string;
  pincode: string;
  areaCity: string;
  tutoringFor: string[];
  boards: string[];
  schedulePref: string | null;
  timePreference: string | null;
  languages: {
    language: string;
    canRead: boolean;
    canWrite: boolean;
    canSpeak: boolean;
  }[];
};

// Mounted once in the root layout so it runs no matter which page/device
// someone lands on after confirming their email. Both drafts (a parent's
// requirement, a tutor's application) live in the account's own auth
// metadata (set at signup time in find-tutor/page.tsx and
// become-a-tutor/page.tsx), not the browser — a localStorage-based version
// of this broke the moment someone confirmed on a different device than
// the one they filled the form out on, since the draft never existed on
// that device's browser.
export default function PendingSignupResolver() {
  const [banner, setBanner] = useState<string | null>(null);
  // Guards against double-submission: onAuthStateChange can fire more than
  // once for the same session (e.g. INITIAL_SESSION then SIGNED_IN right
  // after a confirmation-link redirect), and each firing re-triggers a
  // check. Claimed synchronously before any await, so overlapping calls
  // can't both slip through and each create their own duplicate rows.
  const resolvingRef = useRef(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function tryResolve() {
      if (resolvingRef.current) return;
      resolvingRef.current = true;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active || !user) {
        resolvingRef.current = false;
        return;
      }

      const pendingRequirement = user.user_metadata?.pending_requirement as
        | PendingRequirement
        | undefined;
      const pendingTeacherProfile = user.user_metadata
        ?.pending_teacher_profile as PendingTeacherProfile | undefined;

      if (!pendingRequirement && !pendingTeacherProfile) {
        resolvingRef.current = false;
        return;
      }

      const profile = await getCurrentProfile(supabase);
      if (!active || !profile) {
        resolvingRef.current = false;
        return;
      }

      try {
        if (pendingRequirement && profile.role === "PARENT") {
          let studentId: string | null = null;
          for (const subject of pendingRequirement.subjects) {
            const { data, error } = await supabase.rpc("submit_requirement", {
              p_subject: subject,
              p_mode: pendingRequirement.modes,
              p_consent: true,
              p_location: pendingRequirement.location,
              p_address: pendingRequirement.address,
              p_pincode: pendingRequirement.pincode,
              p_schedule_pref: pendingRequirement.schedulePref,
              p_time_preference: pendingRequirement.timePreference,
              p_pricing_type: pendingRequirement.pricingType,
              p_budget: pendingRequirement.budget,
              p_preferred_teacher_gender: pendingRequirement.preferredGender,
              p_student_id: studentId ?? undefined,
              p_student_name: studentId ? undefined : pendingRequirement.studentName,
              p_age_grade: studentId ? undefined : pendingRequirement.ageGrade,
              p_whatsapp: pendingRequirement.whatsapp,
              p_notes: pendingRequirement.notes,
              p_prior_tutoring_experience: pendingRequirement.priorExperience,
            });
            if (error) throw error;
            if (!studentId) studentId = data.student_id as string;
          }
          if (!active) return;
          // Clear it from the account so a future login never resubmits
          // the same requirement a second time.
          await supabase.auth.updateUser({ data: { pending_requirement: null } });
          setBanner(
            `Welcome back — your requirement for ${pendingRequirement.studentName} has been submitted.`
          );
        } else if (pendingTeacherProfile && profile.role === "TEACHER") {
          const { error } = await supabase.rpc("upsert_teacher_profile", {
            p_qualification: pendingTeacherProfile.qualification,
            p_experience: pendingTeacherProfile.experience,
            p_subjects: pendingTeacherProfile.subjects,
            p_preferred_locations: pendingTeacherProfile.preferredLocations,
            p_teaching_mode: pendingTeacherProfile.teachingMode,
            p_rate_expectation: pendingTeacherProfile.rateExpectation,
            p_bank_upi_ref: pendingTeacherProfile.bankUpiRef,
            p_bank_ifsc: pendingTeacherProfile.bankIfsc,
            p_bank_holder_name: pendingTeacherProfile.bankHolderName,
            p_bank_branch: pendingTeacherProfile.bankBranch,
            p_whatsapp: pendingTeacherProfile.whatsapp,
            p_address: pendingTeacherProfile.address,
            p_pincode: pendingTeacherProfile.pincode,
            p_area_city: pendingTeacherProfile.areaCity,
            p_tutoring_for: pendingTeacherProfile.tutoringFor,
            p_boards: pendingTeacherProfile.boards,
            p_schedule_pref: pendingTeacherProfile.schedulePref,
            p_time_preference: pendingTeacherProfile.timePreference,
          });
          if (error) throw error;

          if (pendingTeacherProfile.languages.length > 0) {
            const { error: langError } = await supabase.rpc("set_teacher_languages", {
              p_languages: pendingTeacherProfile.languages.map((l) => ({
                language: l.language,
                can_read: l.canRead,
                can_write: l.canWrite,
                can_speak: l.canSpeak,
              })),
            });
            if (langError) throw langError;
          }

          if (!active) return;
          await supabase.auth.updateUser({ data: { pending_teacher_profile: null } });
          setBanner(
            "Welcome back — your tutor application has been submitted. If you attached an ID document, please re-upload it from your Teacher Profile page."
          );
        } else {
          // Role doesn't match either pending draft (e.g. an admin looking
          // at their own account) — nothing to do, and nothing to retry.
          resolvingRef.current = false;
        }
      } catch {
        // Leave the draft on the account and allow a later retry — either
        // another auth event on this same page load, or the next page load.
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
