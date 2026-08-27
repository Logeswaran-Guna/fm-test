"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/profile";

type NotificationRow = {
  id: string;
  display_id: string;
  title: string;
  body: string;
  created_at: string;
  is_unread: boolean;
};

type MyNotificationRow = NotificationRow & { scope: "GENERAL" | "PERSONAL" };

const ANON_SEEN_KEY = "fm_general_notifications_last_seen";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationList({ items }: { items: NotificationRow[] }) {
  if (items.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</p>;
  }
  return (
    <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
      {items.map((n) => (
        <div key={n.id} className={`px-4 py-3 ${n.is_unread ? "bg-amber/5" : ""}`}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
              {n.is_unread && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-label="Unread" />
              )}
              {n.title}
            </p>
            <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(n.created_at)}</span>
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{n.body}</p>
        </div>
      ))}
    </div>
  );
}

export default function NotificationBell({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"GENERAL" | "PERSONAL">("GENERAL");
  const [general, setGeneral] = useState<NotificationRow[]>([]);
  const [personal, setPersonal] = useState<NotificationRow[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = general.filter((n) => n.is_unread).length + personal.filter((n) => n.is_unread).length;

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  async function load() {
    const supabase = createClient();
    if (profile) {
      const { data } = await supabase.rpc("my_notifications");
      const rows = (data as MyNotificationRow[]) ?? [];
      setGeneral(rows.filter((r) => r.scope === "GENERAL"));
      setPersonal(rows.filter((r) => r.scope === "PERSONAL"));
    } else {
      const { data } = await supabase.rpc("general_notifications");
      const rows = (data as Omit<NotificationRow, "is_unread">[]) ?? [];
      const lastSeen = typeof window !== "undefined" ? window.localStorage.getItem(ANON_SEEN_KEY) : null;
      const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
      setGeneral(rows.map((r) => ({ ...r, is_unread: new Date(r.created_at).getTime() > lastSeenTime })));
    }
  }

  useEffect(() => {
    Promise.resolve().then(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (!next) return;

    // Fetch fresh data (with accurate is_unread flags) BEFORE marking as
    // seen, so the panel still shows what was unread as of opening —
    // marking seen only affects the *next* time the bell is opened.
    await load();
    if (profile) {
      const supabase = createClient();
      await supabase.rpc("mark_notifications_seen");
    } else if (typeof window !== "undefined") {
      window.localStorage.setItem(ANON_SEEN_KEY, new Date().toISOString());
    }
  }

  const generalUnread = general.filter((n) => n.is_unread).length;
  const personalUnread = personal.filter((n) => n.is_unread).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy/70 transition-colors hover:bg-slate-100 hover:text-navy"
      >
        <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 12.5 6 8Z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        // Anchored to the viewport edge (fixed), not this button's own small
        // relative container — right-0 against the container overflowed off
        // the left edge of the screen on narrower widths, since the bell
        // isn't flush against the true page edge (a hamburger button and/or
        // the Log out control sit to its right). max-w caps it further for
        // very narrow devices where even the viewport-anchored version
        // wouldn't fully fit.
        <div className="fixed right-4 top-[76px] z-20 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg">
          {profile && (
            <div className="flex border-b border-slate-100">
              <button
                type="button"
                onClick={() => setTab("GENERAL")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  tab === "GENERAL" ? "border-b-2 border-amber text-navy" : "text-slate-400 hover:text-navy"
                }`}
              >
                General
                {generalUnread > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
              </button>
              <button
                type="button"
                onClick={() => setTab("PERSONAL")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  tab === "PERSONAL" ? "border-b-2 border-amber text-navy" : "text-slate-400 hover:text-navy"
                }`}
              >
                {profile.name}
                {personalUnread > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
              </button>
            </div>
          )}
          <NotificationList items={!profile || tab === "GENERAL" ? general : personal} />
        </div>
      )}
    </div>
  );
}
