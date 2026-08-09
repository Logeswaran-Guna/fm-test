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

// Full liberty on wording here by design — these are the actual messages
// sent on the referrer's behalf when they tap Share, not internal copy.
const SHARE_MESSAGES: Record<"parent" | "tutor", string> = {
  parent:
    "We found a genuinely good tutor for our child through Future Minds — they actually match and vet tutors instead of just listing them, and it's worked out really well for us. If you're tutor-hunting too, give them a try:",
  tutor:
    "I've been earning solid extra income tutoring through Future Minds — real, vetted student matches, no cold outreach or bidding required. If you're a tutor too, it's worth a look:",
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
  const [shareAudience, setShareAudience] = useState<"parent" | "tutor">("parent");

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

  function buildShareParts(kind: "parent" | "tutor") {
    const path = kind === "parent" ? "/find-tutor" : "/become-a-tutor";
    const url = `${window.location.origin}${path}?ref=${encodeURIComponent(summary!.referral_code)}`;
    const message = SHARE_MESSAGES[kind];
    return { message, url, combined: `${message}\n\n${url}` };
  }

  async function copyCombined(kind: "parent" | "tutor", combined: string) {
    try {
      await navigator.clipboard.writeText(combined);
      setCopiedLink(kind);
      setTimeout(() => setCopiedLink(null), 2500);
    } catch {
      // Clipboard access can fail too (permissions, insecure context) —
      // the code chip above is still there to copy by hand either way.
    }
  }

  // Explicit per-platform buttons instead of relying only on the OS share
  // sheet (navigator.share) — that sheet only lists apps actually
  // installed *and registered as a share target* on the current device.
  // On desktop Windows in particular, WhatsApp/Telegram/Instagram web
  // essentially never show up there even if you use them daily, so the
  // generic "Share" button alone was missing them entirely.
  async function shareVia(platform: "whatsapp" | "telegram" | "facebook" | "instagram" | "more") {
    if (!summary || typeof window === "undefined") return;
    const kind = shareAudience;
    const { message, url, combined } = buildShareParts(kind);

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(combined)}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (platform === "telegram") {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }
    if (platform === "facebook") {
      // Facebook's own sharer only ever accepts a URL — it deliberately
      // ignores custom text (anti-spam) and pulls its preview from the
      // page's Open Graph tags instead, so there's no message to pass here.
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }
    if (platform === "instagram") {
      // Instagram has no share-intent URL of any kind — copying is the
      // only thing that works, so the visitor can paste it into a DM,
      // story, or bio link themselves.
      await copyCombined(kind, combined);
      return;
    }

    // "more" — the native OS share sheet, useful on mobile for whatever
    // isn't covered above (SMS, Mail, Signal, etc.); falls back to copy.
    if (navigator.share) {
      try {
        await navigator.share({ title: "Future Minds", text: combined });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    await copyCombined(kind, combined);
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

      <div className="mt-3">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setShareAudience("parent")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              shareAudience === "parent" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
            }`}
          >
            Share for a parent
          </button>
          <button
            type="button"
            onClick={() => setShareAudience("tutor")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              shareAudience === "tutor" ? "bg-navy text-white" : "text-slate-500 hover:text-navy"
            }`}
          >
            Share for a tutor
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => shareVia("whatsapp")}
            aria-label="Share on WhatsApp"
            title="WhatsApp"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]/15 text-[#1DA851] transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.27-.29.58-.36.78-.36h.55c.18 0 .42-.03.65.5.24.56.81 1.94.88 2.08.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.38-.43.5-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2.01 1.11 1 2.04 1.31 2.34 1.46.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.63-.14.26.1 1.63.77 1.91.91.29.14.48.21.55.34.07.14.07.79-.17 1.46z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => shareVia("telegram")}
            aria-label="Share on Telegram"
            title="Telegram"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#229ED9]/15 text-[#229ED9] transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
              <path d="M21.5 2.5L2 10.7c-.9.36-.87 1.65.04 1.96l4.5 1.53 1.75 5.6c.24.77 1.23.99 1.78.4l2.5-2.68 4.6 3.4c.7.52 1.7.14 1.9-.72L23 3.6c.2-.9-.7-1.6-1.5-1.1zM7.9 13.4l9.6-6.1c.2-.13.4.14.24.3l-7.8 7.1c-.3.28-.5.66-.55 1.08l-.2 1.9-1-3.9c-.08-.3.03-.63.3-.78z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => shareVia("facebook")}
            aria-label="Share on Facebook"
            title="Facebook"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2]/15 text-[#1877F2] transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
              <path d="M13.5 21v-7.5H16l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46H16.5V4.35A20 20 0 0014.2 4.2c-2.27 0-3.83 1.38-3.83 3.93V10.5H8v3h2.37V21h3.13z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => shareVia("instagram")}
            aria-label="Copy message for Instagram"
            title="Instagram (copies — no direct share)"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-fuchsia-500/15 text-fuchsia-600 transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => shareVia("more")}
            className="rounded-full border border-slate-200 px-3 py-2 text-[11px] font-semibold text-navy transition-colors hover:bg-slate-50"
          >
            {copiedLink === shareAudience ? "Copied!" : "More…"}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">
          Opening the link fills in your code automatically for whoever you send it to. Instagram has no
          pre-filled share option, so that one copies the message instead — paste it into a DM or story.
        </p>
      </div>

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
