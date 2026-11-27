"use client";

import { motion } from "framer-motion";
import { RevealUltrasoundImage } from "@/components/reveal/RevealUltrasoundImage";
import type { RevealConfig } from "@/lib/reveal/types";
import {
  congratulationsPhrase,
  fingerprintCount,
  normalizeRevealLabels,
} from "@/lib/reveal/types";

interface RevealCelebrationProps {
  config: RevealConfig;
}

export function RevealCelebration({ config }: RevealCelebrationProps) {
  const isBoy = config.gender === "boy";
  const headline = isBoy ? "¡Es un Niño!" : "¡Es una Niña!";
  const labels = normalizeRevealLabels(config.labels);
  const count = fingerprintCount(labels);

  return (
    <motion.div
      className={`flex w-full max-w-lg flex-col items-center gap-5 px-4 text-center ${
        isBoy ? "text-sky-50" : "text-pink-50"
      }`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.h2
        className={`text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl ${
          isBoy ? "text-sky-100" : "text-pink-100"
        }`}
        style={{
          textShadow: isBoy
            ? "0 0 40px rgba(56,189,248,1), 0 2px 8px rgba(0,0,0,0.9)"
            : "0 0 40px rgba(244,114,182,1), 0 2px 8px rgba(0,0,0,0.9)",
        }}
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
      >
        {headline}
      </motion.h2>

      <p
        className="text-base font-medium text-white sm:text-lg"
        style={{ textShadow: "0 1px 6px rgba(0,0,0,0.85)" }}
      >
        {congratulationsPhrase(config.labels)}
      </p>

      <motion.div
        className={`w-full overflow-hidden rounded-3xl border-2 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.55)] sm:p-6 ${
          isBoy
            ? "border-sky-400/60 bg-sky-950/88"
            : "border-pink-400/60 bg-pink-950/88"
        }`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
      >
        <div
          className={`relative mx-auto mb-5 w-full overflow-hidden rounded-2xl border-2 ${
            isBoy ? "border-sky-500/35" : "border-pink-500/35"
          } bg-black/50`}
        >
          <RevealUltrasoundImage
            src={config.ultrasoundUrl}
            className="h-auto w-full object-contain"
            priority
          />
        </div>

        {config.doctorPhrase ? (
          <p className="mb-4 text-sm italic leading-relaxed text-white/90">
            «{config.doctorPhrase}»
          </p>
        ) : null}

        <p className="text-base font-medium text-white/95">
          {count} huellas, un solo corazón
        </p>
      </motion.div>
    </motion.div>
  );
}