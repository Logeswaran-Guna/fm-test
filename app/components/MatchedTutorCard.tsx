"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MatchedTutor = {
  teacher_id: string;
  display_id: string;
  name: string;
  photo_url: string | null;
  subjects: string[] | null;
  rate_expectation: number | null;
  rating_avg: number | null;
  rating_count: number;
  area_city: string | null;
};

// Self-contained: fetches its own data and renders nothing while loading
// or if there's no >=60% match yet, so it never disturbs the card it's
// dropped into. Purely informational — no "select" action here, admin's
// own Find-Matching-Tutors -> create_match -> propose_demo flow is the
// only path that actually creates a match.
export default function MatchedTutorCard({ requirementId }: { requirementId: string }) {
  const [tutors, setTutors] = useState<MatchedTutor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      const supabase = createClient();
      const { data } = await supabase.rpc("parent_matched_tutors", {
        p_requirement_id: requirementId,
      });
      if (active) {
        setTutors((data as MatchedTutor[]) ?? []);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [requirementId]);

  if (loading || tutors.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Tutors who match your request ({tutors.length})
      </p>
      <div className="space-y-2">
        {tutors.map((t) => (
          <div
            key={t.teacher_id}
            className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
          >
            {t.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.photo_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-semibold text-navy">
                {(t.name || "?").charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-navy">{t.name}</p>
              <p className="truncate text-[11px] text-slate-500">
                {(t.subjects ?? []).slice(0, 3).join(", ") || "Subjects not listed"}
                {t.area_city ? ` · ${t.area_city}` : ""}
              </p>
            </div>
            <div className="shrink-0 text-right text-[11px] text-slate-500">
              {t.rate_expectation != null && <p>₹{t.rate_expectation.toLocaleString("en-IN")}/mo</p>}
              {t.rating_avg != null && (
                <p>
                  ★ {t.rating_avg} ({t.rating_count})
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
