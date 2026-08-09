"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ReferralSummary = {
  referral_code: string;
  points_balance: number;
  points_lifetime_earned: number;
  points_redeemed: number;
  referred_count: number;
};

type DiscountCode = {
  id: string;
  display_id: string;
  points_redeemed: number;
  code_value: number;
  status: "ACTIVE" | "APPLIED" | "EXPIRED";
  applied_amount: number | null;
  created_at: string;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Self-contained (own load()/useEffect), same pattern as NotificationsTab —
// mounted on both the parent and teacher dashboards, same RPCs serve both.
export default function ReferralCard() {
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [redeemInput, setRedeemInput] = useState("100");
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState<"parent" | "tutor" | null>(null);

  async function load() {
    const supabase = createClient();
    const [summaryRes, codesRes] = await Promise.all([
      supabase.rpc("my_referral_summary"),
      supabase.rpc("my_discount_codes"),
    ]);
    if (summaryRes.error || codesRes.error) {
      setError(summaryRes.error?.message || codesRes.error?.message || "Failed to load referral info.");
    } else {
      setError(null);
      setSummary(((summaryRes.data as ReferralSummary[]) ?? [])[0] ?? null);
      setCodes((codesRes.data as DiscountCode[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    Promise.resolve().then(load);
  }, []);

  async function copyCode() {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the
      // code is still visible on screen to copy by hand either way.
    }
  }

  async function shareLink(kind: "parent" | "tutor") {
    if (!summary || typeof window === "undefined") return;
    const path = kind === "parent" ? "/find-tutor" : "/become-a-tutor";
    const url = `${window.location.origin}${path}?ref=${encodeURIComponent(summary.referral_code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(kind);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      // Same clipboard-permission fallback as copyCode() — nothing else to do.
    }
  }

  async function redeem() {
    const points = Number(redeemInput);
    if (!points || points <= 0) {
      setError("Enter a valid number of points.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("redeem_referral_points", { p_points: points });
    if (rpcError) setError(rpcError.message);
    else await load();
    setBusy(false);
  }

  if (loading) return null;
  if (!summary) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-heading text-sm font-semibold text-navy">Refer &amp; Earn</h3>
      <p className="mt-1 text-xs text-slate-500">
        Share your code. When someone you referred gets their first confirmed match, you earn points —
        redeemable as a discount code for your own future fee.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-navy/5 px-3 py-2 font-mono text-sm font-semibold text-navy">
          {summary.referral_code}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
        >
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => shareLink("parent")}
          className="rounded-lg bg-navy/5 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
        >
          {copiedLink === "parent" ? "Link copied!" : "Share link — needs a tutor"}
        </button>
        <button
          type="button"
          onClick={() => shareLink("tutor")}
          className="rounded-lg bg-navy/5 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy/10"
        >
          {copiedLink === "tutor" ? "Link copied!" : "Share link — is a tutor"}
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">
        Opening a shared link fills in your code automatically — or they can just paste the code above by hand.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-slate-50 px-2 py-2.5">
          <p className="font-heading text-lg font-bold text-navy">{summary.points_balance}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Points</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-2.5">
          <p className="font-heading text-lg font-bold text-navy">{summary.referred_count}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Referred</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-2.5">
          <p className="font-heading text-lg font-bold text-navy">{summary.points_lifetime_earned}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Earned</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="number"
          min="1"
          max={summary.points_balance}
          value={redeemInput}
          onChange={(e) => setRedeemInput(e.target.value)}
          className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
        <button
          type="button"
          disabled={busy || summary.points_balance <= 0}
          onClick={redeem}
          className="rounded-lg bg-amber px-4 py-2 text-xs font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Redeeming…" : "Redeem for a discount code"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {codes.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {codes.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
              <span className="font-mono font-semibold text-navy">{c.display_id}</span>
              <span className="text-slate-500">
                ₹{c.code_value.toLocaleString("en-IN")}
                {c.status === "APPLIED" && c.applied_amount != null
                  ? ` · applied (₹${c.applied_amount.toLocaleString("en-IN")})`
                  : c.status === "ACTIVE"
                    ? " · give this to admin toward your next fee"
                    : ""}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  c.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-700"
                    : c.status === "APPLIED"
                      ? "bg-slate-200 text-slate-600"
                      : "bg-red-100 text-red-600"
                }`}
              >
                {c.status}
              </span>
              <span className="text-slate-400">{formatDate(c.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
