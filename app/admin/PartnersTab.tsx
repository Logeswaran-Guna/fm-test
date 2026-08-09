"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PartnerRow, PartnerStatus } from "./types";

const STATUS_STYLES: Record<PartnerStatus, string> = {
  VISIBLE: "bg-emerald-100 text-emerald-700",
  DISABLED: "bg-slate-200 text-slate-500",
  REMOVED: "bg-red-100 text-red-600",
};

const STATUSES: PartnerStatus[] = ["VISIBLE", "DISABLED", "REMOVED"];

function PartnerCard({ partner, onUpdated }: { partner: PartnerRow; onUpdated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function editField(field: "name" | "location", label: string, current: string) {
    const value = window.prompt(label, current);
    if (value === null) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const payload: Record<string, unknown> = { p_id: partner.id };
    if (field === "name") {
      if (!value.trim()) {
        setError("Name is required.");
        setBusy(false);
        return;
      }
      payload.p_name = value.trim();
    }
    if (field === "location") payload.p_location = value.trim() || null;
    const { error: rpcError } = await supabase.rpc("upsert_partner", payload);
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setBusy(false);
  }

  async function updateStatus(status: PartnerStatus) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("upsert_partner", { p_id: partner.id, p_status: status });
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setBusy(false);
  }

  async function uploadLogo(file: File) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "png";
    const path = `${partner.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("partner-logos").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (uploadError) {
      setError(`Could not upload logo: ${uploadError.message}`);
      setBusy(false);
      return;
    }
    const { data: publicUrl } = supabase.storage.from("partner-logos").getPublicUrl(path);
    const { error: rpcError } = await supabase.rpc("upsert_partner", {
      p_id: partner.id,
      p_logo_url: publicUrl.publicUrl,
    });
    if (rpcError) setError(rpcError.message);
    else onUpdated();
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
      {partner.logo_url ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 disabled:cursor-not-allowed"
          title="Click to replace logo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={partner.logo_url} alt={`${partner.name} logo`} className="h-full w-full object-cover" />
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 text-center text-[9px] text-slate-400 hover:border-amber-500 hover:text-amber-700 disabled:cursor-not-allowed"
        >
          Add logo
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadLogo(file);
          e.target.value = "";
        }}
      />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{partner.display_id}</p>
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <button
            type="button"
            disabled={busy}
            onClick={() => editField("name", "Business name?", partner.name)}
            className="font-heading font-semibold text-navy underline decoration-dotted hover:text-amber-700 disabled:cursor-not-allowed"
          >
            {partner.name}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => editField("location", "Location?", partner.location ?? "")}
            className="text-slate-500 underline decoration-dotted hover:text-amber-700 disabled:cursor-not-allowed"
          >
            {partner.location ?? "Add location"}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      <select
        value={partner.status}
        disabled={busy}
        onChange={(e) => updateStatus(e.target.value as PartnerStatus)}
        className={`shrink-0 rounded-full border-0 px-2.5 py-1 text-xs font-semibold disabled:cursor-not-allowed ${STATUS_STYLES[partner.status]}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PartnersTab() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  async function load() {
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("admin_partners");
    if (rpcError) setError(rpcError.message);
    else setPartners((data ?? []) as PartnerRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createPartner() {
    if (!name.trim()) {
      setError("Business name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("upsert_partner", {
      p_name: name.trim(),
      p_location: location.trim() || null,
      p_display_order: partners.length + 1,
    });
    if (rpcError) setError(rpcError.message);
    else {
      setName("");
      setLocation("");
      await load();
    }
    setBusy(false);
  }

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-slate-400">Loading partners…</div>;
  }

  return (
    <div className="space-y-8 p-5">
      <div>
        <h3 className="font-heading text-sm font-semibold text-navy">Add a Partner</h3>
        <p className="mt-1 text-xs text-slate-500">
          Shown on the homepage logo marquee. Add the business, then click the logo circle below to upload its mark.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Business name (e.g. Maple Training and Consulting)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g. Chennai, Tamil Nadu)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <button
            type="button"
            disabled={busy}
            onClick={createPartner}
            className="rounded-lg bg-amber px-4 py-2 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Adding…" : "Add Partner"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      <div>
        <h3 className="mb-3 font-heading text-sm font-semibold text-navy">Partners ({partners.length})</h3>
        {partners.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No partners yet — add one above.
          </p>
        ) : (
          <div className="space-y-3">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} onUpdated={load} />
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
