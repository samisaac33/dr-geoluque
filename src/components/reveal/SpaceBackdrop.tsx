"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type SpaceTint = "neutral" | "boy" | "girl";

interface SpaceBackdropProps {
  tint?: SpaceTint;
  intensity?: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
  ph: number;
}

export function SpaceBackdrop({
  tint = "neutral",
  intensity = 1,
}: SpaceBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (starsRef.current.length === 0) {
        const count = Math.floor(
          (window.innerWidth * window.innerHeight) / 2800,
        );
        starsRef.current = Array.from({ length: count }, () => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 1.6 + 0.35,
          a: Math.random() * 0.55 + 0.25,
          tw: Math.random() * 0.02 + 0.008,
          ph: Math.random() * Math.PI * 2,
        }));
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const draw = (t: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, w, h);

      const nebula =
        tint === "boy"
          ? [
              { x: w * 0.25, y: h * 0.35, c: "56, 189, 248", s: 0.22 },
              { x: w * 0.75, y: h * 0.55, c: "99, 102, 241", s: 0.18 },
              { x: w * 0.5, y: h * 0.75, c: "251, 191, 36", s: 0.08 },
            ]
          : tint === "girl"
            ? [
                { x: w * 0.3, y: h * 0.4, c: "244, 114, 182", s: 0.22 },
                { x: w * 0.72, y: h * 0.5, c: "192, 132, 252", s: 0.16 },
                { x: w * 0.5, y: h * 0.78, c: "251, 191, 36", s: 0.07 },
              ]
            : [
                { x: w * 0.2, y: h * 0.3, c: "99, 102, 241", s: 0.2 },
                { x: w * 0.8, y: h * 0.45, c: "236, 72, 153", s: 0.12 },
                { x: w * 0.55, y: h * 0.7, c: "56, 189, 248", s: 0.14 },
                { x: w * 0.4, y: h * 0.55, c: "251, 191, 36", s: 0.06 },
              ];

      for (const n of nebula) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, w * 0.55);
        g.addColorStop(0, `rgba(${n.c},${n.s * intensity})`);
        g.addColorStop(0.45, `rgba(${n.c},${n.s * 0.35 * intensity})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      for (const s of starsRef.current) {
        const twinkle =
          s.a * (0.55 + 0.45 * Math.sin(t * 0.001 + s.ph)) * intensity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.fill();
      }

      frameRef.current = t;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [tint, intensity]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, transparent 30%, #000 100%)",
        }}
      />
    </motion.div>
  );
}