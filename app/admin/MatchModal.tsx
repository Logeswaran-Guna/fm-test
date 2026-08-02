"use client";

import { findMatchingTutors, type RequirementRow, type TutorRow } from "./types";

function TutorCard({ tutor }: { tutor: TutorRow }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-sm font-semibold text-navy">
            {tutor.full_name || "Unnamed Tutor"}
          </p>
          <p className="text-xs text-slate-500">
            {tutor.qualifications || "Qualifications not listed"} ·{" "}
            {tutor.years_experience || "Experience not listed"}
          </p>
        </div>
        {tutor.phone_number && (
          <a
            href={`tel:${tutor.phone_number}`}
            className="shrink-0 rounded-full bg-amber px-3 py-1.5 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5"
          >
            Call
          </a>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(tutor.subjects_handled ?? []).map((subject) => (
          <span
            key={subject}
            className="rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-medium text-navy"
          >
            {subject}
          </span>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {(tutor.preferred_locations ?? []).map((location) => (
          <span
            key={location}
            className="rounded-full bg-amber/10 px-2.5 py-1 text-[11px] font-medium text-amber-700"
          >
            {location}
          </span>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Mode: {tutor.teaching_mode || "Not specified"}
      </p>
    </div>
  );
}

export default function MatchModal({
  requirement,
  tutors,
  onClose,
}: {
  requirement: RequirementRow;
  tutors: TutorRow[];
  onClose: () => void;
}) {
  const { exact, subjectOnly } = findMatchingTutors(requirement, tutors);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-navy px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber">
              Quick Match
            </p>
            <h2 className="mt-1 font-heading text-lg font-semibold text-white">
              Candidates for {requirement.student_name || "this student"}
            </h2>
            <p className="mt-1 text-xs text-white/60">
              {requirement.subjects_needed || "Subjects not specified"} ·{" "}
              {requirement.location_address || "Location not specified"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5">
          {exact.length === 0 && subjectOnly.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No tutors currently match this subject or location. Try
              broadening the requirement or check back once more tutors
              apply.
            </p>
          ) : (
            <div className="space-y-6">
              {exact.length > 0 && (
                <div>
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Matches by subject &amp; location ({exact.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {exact.map((tutor) => (
                      <TutorCard key={tutor.id} tutor={tutor} />
                    ))}
                  </div>
                </div>
              )}

              {subjectOnly.length > 0 && (
                <div>
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Subject match, location may not align (
                    {subjectOnly.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {subjectOnly.map((tutor) => (
                      <TutorCard key={tutor.id} tutor={tutor} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
