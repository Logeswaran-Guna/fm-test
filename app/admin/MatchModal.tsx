"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  findMatchingTutors,
  MATCH_STATUS_LABELS,
  type RequirementRow,
  type TutorRow,
} from "./types";

const TIME_SLOTS = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekend mornings",
  "Weekend afternoons",
  "Weekend evenings",
];

function TutorCard({
  tutor,
  onSelect,
  busy,
}: {
  tutor: TutorRow;
  onSelect: (tutor: TutorRow) => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-sm font-semibold text-navy">
            {tutor.name || "Unnamed Tutor"}
          </p>
          <p className="text-xs text-slate-500">
            {tutor.qualification || "Qualifications not listed"} ·{" "}
            {tutor.experience || "Experience not listed"}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => onSelect(tutor)}
          className="shrink-0 rounded-full bg-amber px-3 py-1.5 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create Match
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(tutor.subjects ?? []).map((subject) => (
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
        Mode:{" "}
        {(tutor.teaching_mode ?? []).length > 0
          ? tutor.teaching_mode!.join(", ")
          : "Not specified"}
      </p>
    </div>
  );
}

export default function MatchModal({
  requirement,
  tutors,
  onClose,
  onUpdated,
}: {
  requirement: RequirementRow;
  tutors: TutorRow[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoDate, setDemoDate] = useState("");
  const [demoSlot, setDemoSlot] = useState(TIME_SLOTS[0]);

  async function createMatch(tutor: TutorRow) {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("create_match", {
        p_requirement_id: requirement.id,
        p_teacher_id: tutor.id,
      });
      if (rpcError) throw new Error(rpcError.message);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create match.");
    } finally {
      setBusy(false);
    }
  }

  async function proposeDemo() {
    if (!demoDate) {
      setError("Pick a date first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("propose_demo", {
        p_match_id: requirement.match_id,
        p_date: demoDate,
        p_time_slot: demoSlot,
      });
      if (rpcError) throw new Error(rpcError.message);
      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not propose the demo."
      );
    } finally {
      setBusy(false);
    }
  }

  const { exact, subjectOnly } = findMatchingTutors(requirement, tutors);
  const status = requirement.match_status;

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
              {status ? MATCH_STATUS_LABELS[status] : "Quick Match"}
            </p>
            <h2 className="mt-1 font-heading text-lg font-semibold text-white">
              {requirement.student_name || "This student"} ·{" "}
              {requirement.subject}
            </h2>
            <p className="mt-1 text-xs text-white/60">
              {requirement.location || "Location not specified"}
              {requirement.match_id && ` · ${requirement.match_label}`}
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
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {!status && (
            <>
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
                          <TutorCard
                            key={tutor.id}
                            tutor={tutor}
                            onSelect={createMatch}
                            busy={busy}
                          />
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
                          <TutorCard
                            key={tutor.id}
                            tutor={tutor}
                            onSelect={createMatch}
                            busy={busy}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {status === "PROPOSED" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Matched with <strong>{requirement.teacher_name}</strong>.
                Propose a demo date and time slot to both sides.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">
                    Demo Date
                  </label>
                  <input
                    type="date"
                    value={demoDate}
                    onChange={(event) => setDemoDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-navy">
                    Time Slot
                  </label>
                  <select
                    value={demoSlot}
                    onChange={(event) => setDemoSlot(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={proposeDemo}
                className="w-full rounded-xl bg-amber px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-amber/30 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Proposing…" : "Propose Demo"}
              </button>
            </div>
          )}

          {(status === "DEMO_PROPOSED" || status === "DEMO_SCHEDULED") && (
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Demo proposed with <strong>{requirement.teacher_name}</strong>{" "}
                on {requirement.demo_date} ({requirement.demo_time_slot}).
              </p>
              <div className="flex gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    requirement.parent_accepted_demo
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Parent {requirement.parent_accepted_demo ? "accepted" : "pending"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    requirement.teacher_accepted_demo
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Teacher {requirement.teacher_accepted_demo ? "accepted" : "pending"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Once both sides accept, the parent gives final approval from
                their own account — no admin action needed here.
              </p>
            </div>
          )}

          {status === "CONFIRMED" && (
            <div className="rounded-lg bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-700">
              This is now a confirmed, ongoing assignment (
              {requirement.match_label}) with{" "}
              <strong>{requirement.teacher_name}</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
