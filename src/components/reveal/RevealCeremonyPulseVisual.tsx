"use client";

import { motion } from "framer-motion";

type PulsePhase = "prelude" | "tease" | "final";

interface RevealCeremonyPulseVisualProps {
  phase: PulsePhase;
  tint: "boy" | "girl" | "neutral";
  resolvedGender: "boy" | "girl";
  className?: string;
}

const BOY = {
  ring: "border-sky-400/70",
  glow: "shadow-[0_0_48px_rgba(56,189,248,0.55)]",
  core: "from-sky-400/35 to-sky-900/80",
  line: "bg-sky-400/80",
  icon: "text-sky-100",
};
const GIRL = {
  ring: "border-pink-400/70",
  glow: "shadow-[0_0_48px_rgba(244,114,182,0.55)]",
  core: "from-pink-400/35 to-pink-950/80",
  line: "bg-pink-400/80",
  icon: "text-pink-100",
};

function palette(tint: RevealCeremonyPulseVisualProps["tint"], resolved: "boy" | "girl") {
  if (tint === "boy") return BOY;
  if (tint === "girl") return GIRL;
  return resolved === "boy" ? BOY : GIRL;
}

export function RevealCeremonyPulseVisual({
  phase,
  tint,
  resolvedGender,
  className = "",
}: RevealCeremonyPulseVisualProps) {
  const colors =
    phase === "final"
      ? palette(resolvedGender, resolvedGender)
      : palette(tint, resolvedGender);

  const heightClass =
    phase === "final"
      ? "min-h-[min(22vh,12rem)] sm:min-h-[14rem]"
      : "min-h-[min(42vh,28rem)] lg:min-h-[min(48vh,32rem)]";

  return (
    <motion.div
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 bg-black/45 px-6 py-10 ${colors.ring} ${heightClass} ${className}`}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-b ${colors.core} opacity-80`}
        animate={
          phase === "tease"
            ? { opacity: [0.55, 0.95, 0.55] }
            : { opacity: 0.85 }
        }
        transition={
          phase === "tease"
            ? { repeat: Infinity, duration: 0.55, ease: "easeInOut" }
            : { duration: 0.4 }
        }
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className={`relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44 ${colors.glow} rounded-full`}>
          <motion.span
            className={`absolute inset-2 rounded-full border-2 ${colors.ring}`}
            animate={
              phase === "prelude"
                ? { scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }
                : phase === "tease"
                  ? { scale: [0.92, 1.08, 0.92], opacity: [0.65, 1, 0.65] }
                  : { scale: 1, opacity: 1 }
            }
            transition={{
              repeat: phase === "final" ? 0 : Infinity,
              duration: phase === "tease" ? 0.52 : 1.4,
              ease: "easeInOut",
            }}
          />
          <motion.span
            className={`absolute inset-6 rounded-full border ${colors.ring} opacity-60`}
            animate={
              phase === "tease"
                ? { rotate: [0, 180, 360] }
                : { scale: [1, 1.05, 1] }
            }
            transition={{
              repeat: Infinity,
              duration: phase === "tease" ? 2.4 : 2,
              ease: "linear",
            }}
          />
          <motion.span
            className={`text-5xl sm:text-6xl ${colors.icon}`}
            aria-hidden
            animate={
              phase === "final"
                ? { scale: [1, 1.08, 1] }
                : { scale: [0.96, 1.04, 0.96] }
            }
            transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
          >
            {phase === "final" ? (resolvedGender === "boy" ? "♂" : "♀") : "♡"}
          </motion.span>
        </div>

        {phase !== "final" ? (
          <div className="flex w-full max-w-xs items-center justify-center gap-1 opacity-90">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.span
                key={i}
                className={`h-1 w-1 rounded-full ${colors.line}`}
                animate={{
                  height: phase === "tease" ? [4, 16, 6, 20, 4][i % 5] : [6, 14, 8, 12, 6][i % 5],
                  opacity: [0.35, 1, 0.5, 0.9, 0.4][i % 5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: phase === "tease" ? 0.45 : 1.2,
                  delay: i * 0.04,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}