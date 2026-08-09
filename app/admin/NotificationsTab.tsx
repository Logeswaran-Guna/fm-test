"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Audience = "GENERAL" | "PARENT" | "TEACHER";

type NotificationRow = {
  id: string;
  display_id: string;
  audience: Audience;
  target_profile_id: string | null;
  event_type: string | null;
  title: string;
  body: string;
  created_by_name: string | null;
  created_at: string;
};

const AUDIENCE_LABELS: Record<Audience, string> = {
  GENERAL: "General (Home page)",
  PARENT: "All Parents",
  TEACHER: "All Teachers",
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

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [audience, setAudience] = useState<Audience>("GENERAL");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function load() {
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("admin_notifications_list");
    if (rpcError) setError(rpcError.message);
    else {
      setError(null);
      setNotifications((data as NotificationRow[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    Promise.resolve().then(load);
  }, []);

  async function publish() {
    if (!title.trim() || !body.trim()) {
      setError("Title and message are both required.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("admin_create_notification", {
      p_audience: audience,
      p_title: title.trim(),
      p_body: body.trim(),
    });
    if (rpcError) setError(rpcError.message);
    else {
      setTitle("");
      setBody("");
      await load();
    }
    setBusy(false);
  }

  async function remove(id: string) {
    setBusyId(id);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("admin_delete_notification", { p_id: id });
    if (rpcError) setError(rpcError.message);
    else await load();
    setBusyId(null);
  }

  return (
    <div className="space-y-8 p-5">
      <div>
        <h3 className="font-heading text-sm font-semibold text-navy">Publish a Notification</h3>
        <p className="mt-1 text-xs text-slate-400">
          Status-change notifications (demo proposed, tutor confirmed, KYC reviewed, etc.) are sent
          automatically — this is for one-off announcements only.
        </p>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
            >
              {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((a) => (
                <option key={a} value={a}>
                  Publish to: {AUDIENCE_LABELS[a]}
                </option>
              ))}
            </select>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50 sm:col-span-2"
            />
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message"
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <button
            type="button"
            disabled={busy}
            onClick={publish}
            className="rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Publishing…" : "Publish"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      <div>
        <h3 className="mb-3 font-heading text-sm font-semibold text-navy">
          Recent Notifications ({notifications.length})
        </h3>
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No notifications yet.
          </p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {n.event_type ? "Auto" : "Admin"} · {n.audience}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDate(n.created_at)}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-navy">{n.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>
                    {n.created_by_name && (
                      <p className="mt-1 text-[11px] text-slate-400">By {n.created_by_name}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => remove(n.id)}
                    className="shrink-0 text-xs text-red-600 underline decoration-dotted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
