"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface RevealPartyEffectsProps {
  gender: "boy" | "girl";
  active: boolean;
}

const STREAMER_COUNT = 28;

export function RevealPartyEffects({ gender, active }: RevealPartyEffectsProps) {
  const palette =
    gender === "boy"
      ? ["#7dd3fc", "#38bdf8", "#0ea5e9", "#bae6fd", "#ffffff"]
      : ["#f9a8d4", "#f472b6", "#ec4899", "#fbcfe8", "#ffffff"];

  const streamers = useMemo(
    () =>
      Array.from({ length: STREAMER_COUNT }, (_, i) => ({
        id: i,
        x: (i / STREAMER_COUNT) * 100 + (Math.random() - 0.5) * 8,
        delay: Math.random() * 0.6,
        duration: 2.8 + Math.random() * 1.4,
        width: 3 + Math.random() * 4,
        color: palette[i % palette.length]!,
        rotate: -25 + Math.random() * 50,
      })),
    [palette],
  );

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[45] overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background:
            gender === "boy"
              ? "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(14,165,233,0.55) 0%, rgba(2,132,199,0.25) 45%, rgba(2,6,23,0.15) 100%)"
              : "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(236,72,153,0.5) 0%, rgba(244,114,182,0.28) 45%, rgba(2,6,23,0.15) 100%)",
        }}
      />

      {streamers.map((s) => (
        <motion.div
          key={s.id}
          className="absolute top-0 rounded-full opacity-90"
          style={{
            left: `${s.x}%`,
            width: s.width,
            height: "42vh",
            background: `linear-gradient(180deg, ${s.color} 0%, ${s.color}88 55%, transparent 100%)`,
            transformOrigin: "top center",
            boxShadow: `0 0 12px ${s.color}66`,
          }}
          initial={{ y: "-120%", rotate: s.rotate, opacity: 0 }}
          animate={{
            y: ["-120%", "115vh"],
            rotate: [s.rotate, s.rotate + (Math.random() > 0.5 ? 40 : -40)],
            opacity: [0, 1, 1, 0.6],
          }}
          transition={{
            delay: s.delay,
            duration: s.duration,
            repeat: Infinity,
            ease: "easeIn",
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        style={{
          backgroundImage: `repeating-linear-gradient(
            105deg,
            transparent,
            transparent 12px,
            ${gender === "boy" ? "rgba(186,230,253,0.12)" : "rgba(251,207,232,0.14)"} 12px,
            ${gender === "boy" ? "rgba(186,230,253,0.12)" : "rgba(251,207,232,0.14)"} 24px
          )`,
        }}
      />
    </div>
  );
}