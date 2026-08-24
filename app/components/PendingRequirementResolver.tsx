"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { loadPendingRequirement, clearPendingRequirement } from "@/lib/pendingRequirement";

// Mounted once in the root layout so it runs no matter where a parent
// lands after confirming their email (find-tutor, the homepage, wherever
// Supabase's Site URL redirect sends them) — see lib/pendingRequirement.ts
// for why this exists.
export default function PendingRequirementResolver() {
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const pending = loadPendingRequirement();
      if (!pending) return;

      const supabase = createClient();
      const profile = await getCurrentProfile(supabase);
      if (!active) return;
      // Only resume for the same parent who saved the draft — a shared
      // browser shouldn't hand one family's requirement to another login.
      if (!profile || profile.role !== "PARENT" || profile.email !== pending.email) return;

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
        clearPendingRequirement();
        setBanner(`Welcome back — your requirement for ${pending.studentName} has been submitted.`);
      } catch {
        // Leave the draft in storage. It'll retry next time this component
        // mounts (next page load) rather than being lost silently.
      }
    })();
    return () => {
      active = false;
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
