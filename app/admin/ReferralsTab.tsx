"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LedgerRow = {
  id: string;
  display_id: string;
  referrer_display_id: string;
  referrer_name: string;
  referred_display_id: string;
  referred_name: string;
  referred_role: "PARENT" | "TEACHER";
  points: number;
  created_at: string;
};

type Setting = {
  key: string;
  value: string;
  updated_by: string | null;
  updated_at: string;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReferralsTab() {
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [rate, setRate] = useState<string>("0.50");
  const [rateInput, setRateInput] = useState<string>("0.50");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const supabase = createClient();
    const [ledgerRes, settingsRes] = await Promise.all([
      supabase.rpc("admin_referral_ledger"),
      supabase.rpc("admin_referral_settings"),
    ]);
    if (ledgerRes.error || settingsRes.error) {
      setError(ledgerRes.error?.message || settingsRes.error?.message || "Failed to load referral data.");
    } else {
      setError(null);
      setLedger((ledgerRes.data as LedgerRow[]) ?? []);
      const rateSetting = ((settingsRes.data as Setting[]) ?? []).find(
        (s) => s.key === "referral_rate_rupees_per_point"
      );
      if (rateSetting) {
        setRate(rateSetting.value);
        setRateInput(rateSetting.value);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    Promise.resolve().then(load);
  }, []);

  async function saveRate() {
    if (!rateInput.trim() || Number.isNaN(Number(rateInput))) {
      setError("Enter a valid rate (rupees per point).");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("admin_update_setting", {
      p_key: "referral_rate_rupees_per_point",
      p_value: rateInput.trim(),
    });
    if (rpcError) setError(rpcError.message);
    else await load();
    setBusy(false);
  }

  return (
    <div className="space-y-8 p-5">
      <div>
        <h3 className="font-heading text-sm font-semibold text-navy">Referral Rate</h3>
        <p className="mt-1 text-xs text-slate-400">
          Rupees paid out per point when a parent or teacher redeems points into a discount code.
          Currently {rate} per point (100 points = ₹{(Number(rate) * 100).toFixed(2)}). Applied discounts are
          still capped per-fee (50% of a parent&apos;s one-time fee) or per-payout (2 months of a teacher&apos;s
          stated monthly rate at commission) regardless of this rate.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="number"
            step="0.01"
            min="0"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <button
            type="button"
            disabled={busy || rateInput === rate}
            onClick={saveRate}
            className="rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save Rate"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      <div>
        <h3 className="mb-3 font-heading text-sm font-semibold text-navy">
          Referral Ledger ({ledger.length})
        </h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : ledger.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No referrals credited yet — points are only awarded once a referred parent or teacher&apos;s
            own match is confirmed.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3">Referred</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Points</th>
                  <th className="px-4 py-3">Credited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium text-navy">
                      {row.referrer_name}
                      <span className="block text-xs font-normal text-slate-400">{row.referrer_display_id}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.referred_name}
                      <span className="block text-xs text-slate-400">{row.referred_display_id}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.referred_role}</td>
                    <td className="px-4 py-3 font-semibold text-navy">{row.points}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
