// Thin decorative divider between Learning Categories and Perks & Benefits —
// seven sparkle glyphs drifting down a white strip, faded at the edges and
// glowing at the vertical center of their path.
const STAR_PATH =
  "M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z";

const STAR_POSITIONS = [
  { className: "ai-star s-1" },
  { className: "ai-star s-2" },
  { className: "ai-star s-3" },
  { className: "ai-star s-4" },
  { className: "ai-star s-5" },
  { className: "ai-star s-6" },
  { className: "ai-star s-7" },
];

export default function AIStarStrip() {
  return (
    <div className="ai-star-strip-container" aria-hidden>
      <div className="ai-star-stream">
        {STAR_POSITIONS.map((star) => (
          <svg key={star.className} className={star.className} viewBox="0 0 24 24" fill="none">
            <path d={STAR_PATH} fill="url(#aiGlowGrad)" />
          </svg>
        ))}
      </div>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="aiGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#AA7C11" />
          </linearGradient>
        </defs>
      </svg>

      <style>{`
        .ai-star-strip-container {
          width: 100%;
          height: 40px;
          background-color: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .ai-star-stream {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .ai-star {
          position: absolute;
          width: 16px;
          height: auto;
          opacity: 0;
          animation: aiStarDropAndGlow 3s infinite linear;
        }
        .s-1 { left: 8%;  animation-delay: 0s; }
        .s-2 { left: 21%; animation-delay: 0.43s; }
        .s-3 { left: 34%; animation-delay: 0.86s; }
        .s-4 { left: 50%; animation-delay: 1.29s; }
        .s-5 { left: 66%; animation-delay: 1.71s; }
        .s-6 { left: 79%; animation-delay: 2.14s; }
        .s-7 { left: 92%; animation-delay: 2.57s; }

        @keyframes aiStarDropAndGlow {
          0% {
            top: -15%;
            opacity: 0.05;
            filter: blur(1px) drop-shadow(0 0 0px transparent);
            transform: scale(0.7);
          }
          35% {
            opacity: 0.3;
          }
          55% {
            opacity: 1;
            filter: blur(0px) drop-shadow(0 0 8px rgba(212, 175, 55, 0.8));
            transform: scale(1.1);
          }
          75% {
            opacity: 0.3;
          }
          100% {
            top: 105%;
            opacity: 0.05;
            filter: blur(1px) drop-shadow(0 0 0px transparent);
            transform: scale(0.7);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ai-star {
            animation: none;
            top: 42%;
            opacity: 0.5;
            filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.5));
          }
        }
      `}</style>
    </div>
  );
}
