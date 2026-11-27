"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { SpaceBackdrop } from "@/components/reveal/SpaceBackdrop";
import { DRAMATIC_FINALE_MS } from "@/lib/reveal/timing";

const PHASE_A = [
  "Sincronizando latidos…",
  "Verificando perfil familiar…",
  "Analizando secuencia genética…",
];
const PHASE_B = "Cruzando datos biométricos…";
const CLIMAX = "El sistema tiene una respuesta…";
const HOLD = "Un momento…";

const durationSec = DRAMATIC_FINALE_MS / 1000;

interface RevealSuspenseProps {
  active: boolean;
}

export function RevealSuspense({ active }: RevealSuspenseProps) {
  const [phaseAIndex, setPhaseAIndex] = useState(0);
  const [phase, setPhase] = useState<"a" | "b" | "climax" | "hold">("a");

  useEffect(() => {
    if (!active) {
      setPhaseAIndex(0);
      setPhase("a");
      return;
    }
    const timers = [
      setInterval(() => {
        setPhaseAIndex((i) => Math.min(i + 1, PHASE_A.length - 1));
      }, 1_800),
      setTimeout(() => setPhase("b"), 5_500),
      setTimeout(() => setPhase("climax"), 8_500),
      setTimeout(() => setPhase("hold"), 11_500),
    ];
    return () => {
      clearInterval(timers[0] as ReturnType<typeof setInterval>);
      timers.slice(1).forEach(clearTimeout);
    };
  }, [active]);

  const message =
    phase === "a"
      ? PHASE_A[phaseAIndex]
      : phase === "b"
        ? PHASE_B
        : phase === "climax"
          ? CLIMAX
          : HOLD;

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="ceremony-tv-safe fixed inset-0 z-40 flex flex-col items-center justify-center px-8 lg:px-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <SpaceBackdrop tint="neutral" intensity={1.15} />
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1] bg-black/35"
            animate={{ opacity: [0.45, 0.55, 0.45] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />

          <motion.div
            className="relative z-10 mb-12 h-36 w-36 sm:h-44 sm:w-44 lg:mb-14 lg:h-52 lg:w-52 xl:h-60 xl:w-60"
            animate={
              phase === "hold" || phase === "climax"
                ? { scale: [1, 1.14, 1] }
                : { scale: [1, 1.06, 1] }
            }
            transition={{
              repeat: Infinity,
              duration: phase === "hold" ? 0.42 : 0.75,
            }}
          >
            <div className="absolute inset-0 rounded-full border-2 border-amber-200/35" />
            <motion.div
              className="absolute inset-3 rounded-full border-2 border-t-amber-300 border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: phase === "hold" ? 0.75 : 1.4, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-5xl text-amber-100/95 sm:text-6xl lg:text-7xl xl:text-8xl">
              ♥
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              className={`relative z-10 max-w-lg text-center tracking-wide text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] lg:max-w-3xl ${
                phase === "climax" || phase === "hold"
                  ? "text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
                  : "text-lg font-light sm:text-xl lg:text-2xl xl:text-3xl"
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              {message}
            </motion.p>
          </AnimatePresence>

          <motion.div className="relative z-10 mt-12 h-1.5 w-[min(85vw,22rem)] overflow-hidden rounded-full bg-white/10 sm:w-96 lg:mt-14 lg:h-2 lg:w-[28rem] xl:w-[32rem]">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-300 to-white"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: durationSec - 0.4,
                ease: [0.12, 0.75, 0.15, 1],
              }}
            />
          </motion.div>

          <p className="relative z-10 mt-8 text-xs uppercase tracking-[0.4em] text-white/40 sm:text-sm lg:text-base">
            No abandonen la pantalla
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}