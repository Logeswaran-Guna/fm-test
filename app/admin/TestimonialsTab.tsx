"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TestimonialRow, TestimonialStatus } from "./types";

const STATUS_STYLES: Record<TestimonialStatus, string> = {
  VISIBLE: "bg-emerald-100 text-emerald-700",
  DISABLED: "bg-slate-200 text-slate-500",
  REMOVED: "bg-red-100 text-red-600",
};

const STATUSES: TestimonialStatus[] = ["VISIBLE", "DISABLED", "REMOVED"];
const RATINGS = [5, 4, 3, 2, 1];

function TestimonialCard({ testimonial, onUpdated }: { testimonial: TestimonialRow; onUpdated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function editField(field: "author_name" | "author_role" | "quote", label: string, current: string) {
    const value = window.prompt(label, current);
    if (value === null) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const payload: Record<string, unknown> = { p_id: testimonial.id };
    if (field === "author_name") {
      if (!value.trim()) {
        setError("Author name is required.");
        setBusy(false);
        return;
      }
      payload.p_author_name = value.trim();
    }
    if (field === "author_role") payload.p_author_role = value.trim() || null;
    if (field === "quote") {
      if (!value.trim()) {
        setError("Quote is required.");
        setBusy(false);
        return;
      }
      payload.p_quote = value.trim();
    }
    const { error: rpcError } = await supabase.rpc("upsert_testimonial", payload);
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setBusy(false);
  }

  async function updateStatus(status: TestimonialStatus) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("upsert_testimonial", { p_id: testimonial.id, p_status: status });
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setBusy(false);
  }

  async function updateRating(rating: number) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("upsert_testimonial", { p_id: testimonial.id, p_rating: rating });
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setBusy(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{testimonial.display_id}</p>
          <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <button
              type="button"
              disabled={busy}
              onClick={() => editField("author_name", "Author name?", testimonial.author_name)}
              className="font-heading font-semibold text-navy underline decoration-dotted hover:text-amber-700 disabled:cursor-not-allowed"
            >
              {testimonial.author_name}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => editField("author_role", "Role (e.g. Parent, Chennai)?", testimonial.author_role ?? "")}
              className="text-slate-500 underline decoration-dotted hover:text-amber-700 disabled:cursor-not-allowed"
            >
              {testimonial.author_role ?? "Add role"}
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <select
            value={testimonial.rating}
            disabled={busy}
            onChange={(e) => updateRating(Number(e.target.value))}
            className="rounded-full border-0 bg-amber/10 px-2.5 py-1 text-xs font-semibold text-amber-700 disabled:cursor-not-allowed"
          >
            {RATINGS.map((r) => (
              <option key={r} value={r}>
                {"★".repeat(r)}
              </option>
            ))}
          </select>
          <select
            value={testimonial.status}
            disabled={busy}
            onChange={(e) => updateStatus(e.target.value as TestimonialStatus)}
            className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold disabled:cursor-not-allowed ${STATUS_STYLES[testimonial.status]}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => editField("quote", "Quote?", testimonial.quote)}
        className="mt-2.5 block w-full text-left text-sm leading-relaxed text-slate-600 underline decoration-dotted hover:text-amber-700 disabled:cursor-not-allowed"
      >
        &ldquo;{testimonial.quote}&rdquo;
      </button>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [quote, setQuote] = useState("");

  async function load() {
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("admin_testimonials");
    if (rpcError) setError(rpcError.message);
    else setTestimonials((data ?? []) as TestimonialRow[]);
    setLoading(false);
  }

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, []);

  async function createTestimonial() {
    if (!authorName.trim()) {
      setError("Author name is required.");
      return;
    }
    if (!quote.trim()) {
      setError("Quote is required.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("upsert_testimonial", {
      p_author_name: authorName.trim(),
      p_author_role: authorRole.trim() || null,
      p_quote: quote.trim(),
      p_display_order: testimonials.length + 1,
    });
    if (rpcError) setError(rpcError.message);
    else {
      setAuthorName("");
      setAuthorRole("");
      setQuote("");
      await load();
    }
    setBusy(false);
  }

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-slate-400">Loading testimonials…</div>;
  }

  return (
    <div className="space-y-8 p-5">
      <div>
        <h3 className="font-heading text-sm font-semibold text-navy">Add a Testimonial</h3>
        <p className="mt-1 text-xs text-slate-500">
          Shown on the homepage, right after Learning Categories. New testimonials default to 5 stars.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Author name (e.g. Parent of Aditya, or Priya R.)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <input
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            placeholder="Role (e.g. Parent, Chennai or Mathematics Tutor)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
        </div>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Quote"
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
        <button
          type="button"
          disabled={busy}
          onClick={createTestimonial}
          className="mt-2 rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Adding…" : "Add Testimonial"}
        </button>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      <div>
        <h3 className="mb-3 font-heading text-sm font-semibold text-navy">Testimonials ({testimonials.length})</h3>
        {testimonials.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No testimonials yet — add one above.
          </p>
        ) : (
          <div className="space-y-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} onUpdated={load} />
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400">
          Visible = shown on the homepage. Disabled = hidden, kept in place. Removed = hidden and sorted to the
          bottom of this list.
        </p>
      </div>
    </div>
  );
}
