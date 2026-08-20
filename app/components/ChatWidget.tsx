"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi! I'm the Future Minds assistant. Ask me about how matching works, our fees, categories we cover, or anything else about the platform.",
};

function SparkleIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M3 12h3M18 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1" />
      <path d="M12 8l1.3 3 3 1.3-3 1.3L12 16l-1.3-3-3-1.3 3-1.3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.filter((m) => m !== WELCOME) }),
      });

      if (response.status === 503) {
        setUnavailable(true);
        setStreaming(false);
        return;
      }
      if (!response.ok || !response.body) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong — please try again." }]);
        setStreaming(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong — please try again." }]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-3">
      {open && (
        <div className="flex h-[28rem] w-80 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-navy px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber/20 text-amber">
                <SparkleIcon size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Future Minds Assistant</p>
                <p className="text-[11px] text-white/60">Ask about matching, fees, categories</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-white/80 hover:text-white">
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-amber text-navy" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
                </p>
              </div>
            ))}
            {unavailable && (
              <p className="rounded-lg bg-amber/10 px-3 py-2 text-xs text-amber-800">
                Chat is temporarily unavailable. Reach us on{" "}
                <a href="https://wa.me/917200227081" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  WhatsApp
                </a>{" "}
                or{" "}
                <a href="mailto:hello@futureminds.in" className="font-semibold underline">
                  hello@futureminds.in
                </a>
                .
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 2000))}
              placeholder="Ask a question…"
              disabled={streaming || unavailable}
              className="min-w-0 flex-1 rounded-full border border-slate-200 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/50 disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={streaming || unavailable || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat assistant" : "Chat with Future Minds assistant"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-amber shadow-lg shadow-black/20 ring-1 ring-amber/40 transition-transform hover:scale-105"
      >
        <SparkleIcon size={24} />
      </button>
    </div>
  );
}
