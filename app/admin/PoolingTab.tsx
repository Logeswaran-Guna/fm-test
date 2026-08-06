"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PoolingGroupRow, RequirementRow, TutorRow } from "./types";

const STATUS_STYLES: Record<PoolingGroupRow["status"], string> = {
  FORMING: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-200 text-slate-500",
};

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function MembersList({
  group,
  busy,
  onUpdated,
}: {
  group: PoolingGroupRow;
  busy: boolean;
  onUpdated: () => void;
}) {
  const [busyMatchId, setBusyMatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (group.members.length === 0) return null;

  async function toggleCollected(matchId: string, collected: boolean) {
    setBusyMatchId(matchId);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("set_pool_commission_collected", {
      p_match_id: matchId,
      p_collected: collected,
    });
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setBusyMatchId(null);
  }

  async function editAmount(matchId: string, currentAmount: number | null) {
    const value = window.prompt(
      "This household's pool amount (Rs)?",
      currentAmount != null ? String(currentAmount) : ""
    );
    if (value === null || value.trim() === "") return;
    setBusyMatchId(matchId);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("set_pool_amount", {
      p_match_id: matchId,
      p_pool_amount: Number(value) || 0,
    });
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setBusyMatchId(null);
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full min-w-[560px] text-left text-xs">
        <thead className="bg-slate-50 text-slate-400">
          <tr>
            <th className="px-3 py-2 font-semibold">Household</th>
            <th className="px-3 py-2 font-semibold">Pool amount</th>
            <th className="px-3 py-2 font-semibold">FM surcharge (10%)</th>
            <th className="px-3 py-2 font-semibold">Collected?</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {group.members.map((m) => (
            <tr key={m.match_id}>
              <td className="px-3 py-2 text-navy">
                {m.student_name ?? m.parent_name}
                <span className="ml-1 text-slate-400">({m.parent_name})</span>
              </td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  disabled={busy || busyMatchId === m.match_id}
                  onClick={() => editAmount(m.match_id, m.pool_amount)}
                  className="text-navy underline decoration-dotted hover:text-amber-700 disabled:cursor-not-allowed"
                >
                  {m.pool_amount != null ? formatCurrency(m.pool_amount) : "Set amount…"}
                </button>
              </td>
              <td className="px-3 py-2 text-navy">
                {m.commission_owed != null ? formatCurrency(m.commission_owed) : "—"}
              </td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  disabled={busy || busyMatchId === m.match_id || m.pool_amount == null}
                  onClick={() => toggleCollected(m.match_id, !m.collected)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    m.collected
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {m.collected ? "Collected ✓" : "Not yet"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p className="px-3 py-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function GroupCard({
  group,
  eligibleRequirements,
  eligibleTeachers,
  onUpdated,
}: {
  group: PoolingGroupRow;
  eligibleRequirements: RequirementRow[];
  eligibleTeachers: TutorRow[];
  onUpdated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherPick, setTeacherPick] = useState("");
  const [memberPick, setMemberPick] = useState("");

  async function run(fn: () => PromiseLike<{ error: { message: string } | null }>) {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await fn();
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setBusy(false);
  }

  async function assignTeacher() {
    if (!teacherPick) return;
    const supabase = createClient();
    await run(() =>
      supabase.rpc("assign_pooling_teacher", { p_group_id: group.id, p_teacher_id: teacherPick })
    );
    setTeacherPick("");
  }

  async function addMember() {
    if (!memberPick) return;
    const amountInput = window.prompt(
      "How much does this household pay for the pooled batch (Rs)? Future Minds will separately collect 10% of this from them.",
      ""
    );
    if (amountInput === null) return;
    const supabase = createClient();
    await run(() =>
      supabase.rpc("add_requirement_to_pooling_group", {
        p_group_id: group.id,
        p_requirement_id: memberPick,
        p_pool_amount: amountInput.trim() === "" ? null : Number(amountInput) || 0,
      })
    );
    setMemberPick("");
  }

  async function closeGroup() {
    const supabase = createClient();
    await run(() => supabase.rpc("close_pooling_group", { p_group_id: group.id }));
  }

  async function releasePayout() {
    const suggested = group.suggested_commission_percent;
    const pct = window.prompt(
      `Commission percentage for the teacher's payout on this pooled batch? (Flat suggestion: ${suggested}% — parents' 10% surcharges are tracked and collected separately, above.)`,
      suggested != null ? String(suggested) : "10"
    );
    if (pct === null || pct.trim() === "") return;
    const supabase = createClient();
    await run(() =>
      supabase.rpc("release_payout", {
        p_pooling_group_id: group.id,
        p_commission_percent: Number(pct) || 0,
      })
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{group.display_id}</p>
          <h4 className="font-heading text-base font-semibold text-navy">
            {group.subject} {group.location && `· ${group.location}`}
          </h4>
          {group.notes && <p className="mt-1 text-xs text-slate-500">{group.notes}</p>}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[group.status]}`}>
          {group.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <span>
          Teacher: <strong className="text-navy">{group.teacher_name ?? "Not assigned"}</strong>
        </span>
        <span>
          Members: <strong className="text-navy">{group.member_count}</strong>
        </span>
        <span>
          Pool amount: <strong className="text-navy">{formatCurrency(group.total_pool_amount)}</strong>
        </span>
        <span>
          Parent surcharge owed: <strong className="text-navy">{formatCurrency(group.total_parent_commission_owed)}</strong>
          {" "}
          (<strong className="text-emerald-700">{formatCurrency(group.total_parent_commission_collected)}</strong> collected)
        </span>
        <span>
          Unpaid teacher gross: <strong className="text-navy">{formatCurrency(group.unpaid_gross)}</strong>
        </span>
      </div>

      <MembersList group={group} busy={busy} onUpdated={onUpdated} />

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      {group.status !== "CLOSED" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1">
            <select
              value={teacherPick}
              onChange={(e) => setTeacherPick(e.target.value)}
              disabled={eligibleTeachers.length === 0}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-amber/50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {eligibleTeachers.length === 0
                  ? "No registered teachers yet"
                  : group.teacher_id
                    ? "Reassign teacher…"
                    : "Assign a teacher…"}
              </option>
              {eligibleTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={busy || !teacherPick}
            onClick={assignTeacher}
            className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Set Teacher
          </button>

          <div className="flex flex-col gap-1">
            <select
              value={memberPick}
              onChange={(e) => setMemberPick(e.target.value)}
              disabled={eligibleRequirements.length === 0}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-amber/50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {eligibleRequirements.length === 0 ? "No open requirements yet" : "Add a household…"}
              </option>
              {eligibleRequirements.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.student_name ?? r.parent_name} · {r.subject}
                  {(r.mode ?? []).includes("Community Pooling") ? "" : " (not marked pooling)"}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={busy || !memberPick || !group.teacher_id}
            onClick={addMember}
            className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            title={!group.teacher_id ? "Assign a teacher to this group first" : undefined}
          >
            Add Member
          </button>

          <button
            type="button"
            disabled={busy || group.unpaid_gross <= 0 || !group.teacher_id}
            onClick={releasePayout}
            className="rounded-full bg-amber px-3 py-1.5 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            title={
              !group.teacher_id
                ? "Assign a teacher first"
                : group.unpaid_gross <= 0
                  ? "Nothing to pay out yet — classes need to be logged, parent-confirmed and admin-validated first"
                  : undefined
            }
          >
            Release Teacher Payout
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={closeGroup}
            className="ml-auto rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-navy hover:text-navy disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close Group
          </button>
        </div>
      )}
    </div>
  );
}

export default function PoolingTab({
  groups,
  requirements,
  tutors,
  onUpdated,
}: {
  groups: PoolingGroupRow[];
  requirements: RequirementRow[];
  tutors: TutorRow[];
  onUpdated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Admin decides who goes into a pooled batch — not restricted to only
  // households/teachers that happened to tick "Community Pooling" as a
  // mode, since that would silently block a manual assignment the admin
  // clearly wants to make. Pooling-mode requirements are just sorted first
  // as a helpful default, not a hard filter.
  const eligibleRequirements = [...requirements]
    .filter((r) => !r.match_status)
    .sort((a, b) => {
      const aPool = (a.mode ?? []).includes("Community Pooling") ? 0 : 1;
      const bPool = (b.mode ?? []).includes("Community Pooling") ? 0 : 1;
      return aPool - bPool;
    });
  const eligibleTeachers = [...tutors].sort((a, b) => {
    const aPool = (a.teaching_mode ?? []).includes("Community Pooling") ? 0 : 1;
    const bPool = (b.teaching_mode ?? []).includes("Community Pooling") ? 0 : 1;
    return aPool - bPool;
  });

  async function createGroup() {
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("create_pooling_group", {
      p_subject: subject.trim(),
      p_location: location.trim() || null,
      p_notes: notes.trim() || null,
    });
    if (rpcError) setError(rpcError.message);
    else {
      setSubject("");
      setLocation("");
      setNotes("");
      onUpdated();
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber/30 bg-amber/5 p-5">
        <h3 className="font-heading text-sm font-semibold text-navy">New Pooling Group</h3>
        <p className="mt-1 text-xs text-slate-500">
          Group nearby households onto one shared batch. Future Minds takes a flat 10% from each parent&apos;s
          payment (tracked here, collected manually) plus a flat 10% deducted from the teacher&apos;s payout — a
          20% total take on the pooled batch.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. Mathematics)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location / community"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <button
            type="button"
            disabled={busy}
            onClick={createGroup}
            className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create Group"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      {groups.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No pooling groups yet.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              eligibleRequirements={eligibleRequirements}
              eligibleTeachers={eligibleTeachers}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
