"use client";

import { useState } from "react";

const WHATSAPP_NUMBER = "917200227081";

function WhatsAppIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#fff">
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38a9.94 9.94 0 0 0 4.79 1.22h.01c5.52 0 10-4.48 10-10s-4.48-9.84-10.01-9.84Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.52 3.68-8.2 8.23-8.2 2.2 0 4.26.86 5.82 2.41a8.15 8.15 0 0 1 2.4 5.8c0 4.53-3.69 8.2-8.22 8.2Zm4.5-6.15c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01a.93.93 0 0 0-.67.31c-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.76 2.69 4.27 3.77.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-[#25D366] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <WhatsAppIcon size={26} />
              <div>
                <p className="text-sm font-semibold text-white">Future Minds</p>
                <p className="text-[11px] text-white/85">Typically replies within a few hours</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-white/90 hover:text-white"
            >
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm leading-relaxed text-slate-600">
              Hi! Have a question about tutoring, AI &amp; Robotics, or becoming a tutor? Message us on WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-lg bg-[#25D366] px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start Chat
            </a>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20 transition-transform hover:scale-105"
      >
        <WhatsAppIcon size={28} />
      </button>
    </div>
  );
}
