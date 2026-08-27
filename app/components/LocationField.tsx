"use client";

import { useEffect, useRef, useState } from "react";
import type { LocationEntry } from "@/lib/indiaLocations";

function locationLabel(loc: LocationEntry): string {
  return `${loc.area}, ${loc.region}`;
}

// Suggests from a real postal-area list (~12k entries — mostly Tamil Nadu,
// sourced from the Dept. of Posts' official pincode directory, plus a
// smaller founder-supplied set of major cities in neighboring states — see
// lib/indiaLocations.ts) as the user types, but never blocks on it — free
// text stays valid, since even a government directory won't have every
// colloquial area name. Loaded via dynamic import rather than a static one
// so this ~1MB dataset ships as its own chunk, fetched once this component
// actually mounts, instead of bloating the shared page bundle for every
// route.
//
// Picking a suggestion also fires onSelectPincode so the caller can
// auto-fill a separate Pincode field — typing free text never touches
// that field, only an actual list pick does.
export default function LocationField({
  label,
  value,
  onChange,
  onSelectPincode,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelectPincode?: (pincode: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [locations, setLocations] = useState<LocationEntry[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    import("@/lib/indiaLocations").then((mod) => {
      if (active) setLocations(mod.INDIA_LOCATIONS);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const query = value.trim().toLowerCase();
  const suggestions: LocationEntry[] =
    query.length >= 2
      ? locations.filter((loc) => locationLabel(loc).toLowerCase().includes(query)).slice(0, 8)
      : [];

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-navy">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber/50 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {suggestions.map((loc) => (
            <li key={`${loc.area}-${loc.pincode}`}>
              <button
                type="button"
                onClick={() => {
                  onChange(locationLabel(loc));
                  onSelectPincode?.(loc.pincode);
                  setOpen(false);
                }}
                className="flex w-full items-baseline justify-between gap-3 px-4 py-2 text-left text-sm text-navy hover:bg-amber/10"
              >
                <span>{locationLabel(loc)}</span>
                <span className="shrink-0 text-xs text-slate-400">{loc.pincode}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
