"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FunnelRow = {
  total_requirements: number;
  no_match: number;
  matched: number;
  demo_stage: number;
  confirmed: number;
  declined: number;
};

function pct(part: number, of: number): string {
  if (of <= 0) return "—";
  return `${Math.round((part / of) * 100)}%`;
}

// Self-contained load, same pattern as NotificationsTab — a failure here
// can't take down the requirements table it sits above.
export default function FunnelStats() {
  const [stats, setStats] = useState<FunnelRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(async () => {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("admin_funnel_stats");
      if (rpcError) setError(rpcError.message);
      else setStats(((data as FunnelRow[]) ?? [])[0] ?? null);
      setLoading(false);
    });
  }, []);

  if (loading || error || !stats) return null;

  const stages: { label: string; value: number; dropFrom?: number }[] = [
    { label: "Submitted", value: stats.total_requirements },
    { label: "Matched", value: stats.matched + stats.demo_stage + stats.confirmed, dropFrom: stats.total_requirements },
    { label: "Demo Stage", value: stats.demo_stage + stats.confirmed, dropFrom: stats.matched + stats.demo_stage + stats.confirmed },
    { label: "Confirmed", value: stats.confirmed, dropFrom: stats.demo_stage + stats.confirmed },
  ];

  return (
    <div className="border-b border-slate-200 bg-white px-5 py-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Requirement Funnel
      </h3>
      <div className="flex flex-wrap items-stretch gap-3">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center">
              <p className="font-heading text-xl font-bold text-navy">{stage.value}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{stage.label}</p>
            </div>
            {i < stages.length - 1 && (
              <span className="text-xs font-semibold text-slate-300">
                {pct(stages[i + 1].value, stage.value)} →
              </span>
            )}
          </div>
        ))}
        {stats.no_match > 0 && (
          <div className="rounded-xl border border-amber/30 bg-amber/5 px-4 py-2.5 text-center">
            <p className="font-heading text-xl font-bold text-amber-700">{stats.no_match}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700/70">No Match Yet</p>
          </div>
        )}
        {stats.declined > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center">
            <p className="font-heading text-xl font-bold text-red-700">{stats.declined}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-red-700/70">Declined</p>
          </div>
        )}
      </div>
    </div>
  );
}
