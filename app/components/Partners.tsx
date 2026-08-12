"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Partner = {
  id: string;
  name: string;
  location: string | null;
  logo_url: string | null;
};

function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <div className="flex items-center gap-3.5">
      {partner.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.logo_url}
          alt={`${partner.name} logo`}
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-lg font-bold text-amber">
          {partner.name.charAt(0)}
        </div>
      )}
      <div className="leading-tight">
        <p className="font-heading text-base font-bold text-navy">{partner.name}</p>
        {partner.location && (
          <p className="text-[10px] uppercase tracking-wide text-slate-600">{partner.location}</p>
        )}
      </div>
    </div>
  );
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .rpc("partners_public")
      .then(({ data }) => setPartners((data ?? []) as Partner[]));
  }, []);

  if (partners.length === 0) return null;

  // Duplicated so the marquee loop is seamless at the -50% mark.
  const marqueeItems = [...partners, ...partners];

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-8 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            <span className="h-px w-6 bg-amber-700" aria-hidden />
            Partners
          </span>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-navy sm:text-3xl">
            Growing with trusted partners
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            As Future Minds grows, we&apos;re building relationships with schools, learning academies, and education technology partners.
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent"
        />
        <div
          className="flex w-max gap-4"
          style={{ animation: "marquee-scroll 28s linear infinite" }}
        >
          {marqueeItems.map((partner, i) => (
            <div
              key={`${partner.id}-${i}`}
              className="flex shrink-0 items-center rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm"
            >
              <PartnerLogo partner={partner} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
