"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  computeMatchScore,
  findMatchingTutors,
  MATCH_STATUS_LABELS,
  type RequirementRow,
  type TutorRow,
} from "./types";

function scoreBadgeClass(score: number): string {
  if (score >= 75) return "bg-emerald-100 text-emerald-700";
  if (score >= 50) return "bg-amber/20 text-amber-800";
  return "bg-slate-100 text-slate-500";
}

const TIME_SLOTS = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekend mornings",
  "Weekend afternoons",
  "Weekend evenings",
];

function TutorCard({
  requirement,
  tutor,
  onSelect,
  busy,
}: {
  requirement: RequirementRow;
  tutor: TutorRow;
  onSelect: (tutor: TutorRow, score: number) => void;
  busy: boolean;
}) {
  const score = computeMatchScore(requirement, tutor);

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
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${scoreBadgeClass(score)}`}>
            {score}% match
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSelect(tutor, score)}
            className="rounded-full bg-amber px-3 py-1.5 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create Match
          </button>
        </div>
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

  async function editParentFeeAmount() {
    const value = window.prompt(
      "One-time parent platform fee (Rs)? Defaults to 20% of budget at approval, but you can correct it here.",
      requirement.parent_onetime_fee_amount != null ? String(requirement.parent_onetime_fee_amount) : ""
    );
    if (value === null || value.trim() === "") return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("set_parent_onetime_fee", {
        p_match_id: requirement.match_id,
        p_amount: Number(value) || 0,
      });
      if (rpcError) throw new Error(rpcError.message);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the fee amount.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleParentFeeCollected() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("set_parent_fee_collected", {
        p_match_id: requirement.match_id,
        p_collected: !requirement.parent_fee_collected,
      });
      if (rpcError) throw new Error(rpcError.message);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update collection status.");
    } finally {
      setBusy(false);
    }
  }

  async function createMatch(tutor: TutorRow, score: number) {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("create_match", {
        p_requirement_id: requirement.id,
        p_teacher_id: tutor.id,
        p_match_score: score,
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
              {status && requirement.match_score != null && ` · ${requirement.match_score}% match`}
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
                            requirement={requirement}
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
                            requirement={requirement}
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
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-700">
                This is now a confirmed, ongoing assignment (
                {requirement.match_label}) with{" "}
                <strong>{requirement.teacher_name}</strong>.
              </div>

              <div className="rounded-lg border border-slate-200 px-4 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  One-time parent platform fee
                </h3>
                {requirement.parent_onetime_fee_amount != null ? (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={editParentFeeAmount}
                      className="text-sm text-navy underline decoration-dotted hover:text-amber-700 disabled:cursor-not-allowed"
                    >
                      Rs {requirement.parent_onetime_fee_amount.toLocaleString("en-IN")} (20% of budget)
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={toggleParentFeeCollected}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                        requirement.parent_fee_collected
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {requirement.parent_fee_collected ? "Collected ✓" : "Not yet"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-slate-400">
                      No budget was on file to auto-compute this, or it&apos;s a Community Pooling match (fee
                      handled separately there).
                    </p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={editParentFeeAmount}
                      className="shrink-0 text-xs font-semibold text-amber-700 underline"
                    >
                      Set amount
                    </button>
                  </div>
                )}
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  Paid once, directly to Future Minds, separate from the teacher&apos;s own recurring 10% monthly
                  commission (tracked via Attendance &amp; Payouts).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
