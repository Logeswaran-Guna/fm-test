"use client";

import { useEffect, useRef } from "react";

const STRIP_HEIGHT = 64;
const STRAND_COUNT = 3;
const EDGE_FADE_PX = 140;

// Drifting spiral-line divider between "How you learn" and "What you can
// learn" — a few overlapping sine strands at different frequencies/phases,
// which braid into a spiral-looking flow rather than a single flat wave.
class SpiralStrand {
  phase: number;
  freq: number;
  ampRatio: number;
  speed: number;
  secondaryFreq: number;
  secondaryAmpRatio: number;
  lineWidth: number;

  constructor(index: number) {
    this.phase = index * 2.1;
    this.freq = 0.01 + index * 0.0035;
    this.ampRatio = 0.3 - index * 0.05;
    this.speed = 0.015 + index * 0.006;
    this.secondaryFreq = 0.028 + index * 0.009;
    this.secondaryAmpRatio = 0.1;
    this.lineWidth = 2.2 - index * 0.4;
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    const centerY = h * 0.5;
    const amp = h * this.ampRatio;
    const secAmp = h * this.secondaryAmpRatio;
    const step = 5;

    ctx.beginPath();
    for (let x = 0; x <= w; x += step) {
      const y =
        centerY +
        Math.sin(x * this.freq + time * this.speed + this.phase) * amp +
        Math.sin(x * this.secondaryFreq - time * this.speed * 1.4 + this.phase) * secAmp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    const fadeStart = Math.max(0, Math.min(0.45, EDGE_FADE_PX / w));
    gradient.addColorStop(0, "rgba(212, 175, 55, 0)");
    gradient.addColorStop(fadeStart, "rgba(212, 175, 55, 0.85)");
    gradient.addColorStop(0.5, "rgba(244, 215, 94, 1)");
    gradient.addColorStop(1 - fadeStart, "rgba(170, 124, 17, 0.85)");
    gradient.addColorStop(1, "rgba(170, 124, 17, 0)");

    ctx.save();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 6;
    ctx.shadowColor = "rgba(244, 215, 94, 0.45)";
    ctx.stroke();
    ctx.restore();
  }
}

export default function WaveSeparatorStrip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const strands = Array.from({ length: STRAND_COUNT }, (_, i) => new SpiralStrand(i));
    let animationFrameId = 0;
    let animationTime = 0;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = parent!.clientWidth * dpr;
      canvas!.height = parent!.clientHeight * dpr;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
    }

    function drawFrame(time: number) {
      const w = parent!.clientWidth;
      const h = parent!.clientHeight;
      ctx!.clearRect(0, 0, w, h);
      strands.forEach((s) => s.draw(ctx!, w, h, time));
    }

    function animate() {
      animationTime++;
      drawFrame(animationTime);
      animationFrameId = requestAnimationFrame(animate);
    }

    function handleResize() {
      resizeCanvas();
      if (reduceMotion) drawFrame(0);
    }

    resizeCanvas();
    window.addEventListener("resize", handleResize);

    if (reduceMotion) {
      drawFrame(0);
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        width: "100%",
        height: STRIP_HEIGHT,
        backgroundColor: "#ffffff",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
