"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { RevealPartyEffects } from "@/components/reveal/RevealPartyEffects";
import { SpaceBackdrop } from "@/components/reveal/SpaceBackdrop";
import { ClinicalBrandBadge } from "@/components/reveal/ClinicalBrandBadge";
import { revealAudio } from "@/lib/reveal/audio";
import type { RevealConfig } from "@/lib/reveal/types";

type FinaleStage = "ultrasound" | "tease" | "final";

interface RevealFinaleProps {
  config: RevealConfig;
  onFinalReveal?: () => void;
}

const TEASE_DELAYS_MS = [520, 520, 600, 680, 760, 880, 1000] as const;

export function RevealFinale({ config, onFinalReveal }: RevealFinaleProps) {
  const isBoy = config.gender === "boy";
  const headline = isBoy ? "¡Es un Niño!" : "¡Es una Niña!";

  const [stage, setStage] = useState<FinaleStage>("ultrasound");
  const [teaseTint, setTeaseTint] = useState<"boy" | "girl">("girl");
  const finalAnnounced = useCallback(
    () => onFinalReveal?.(),
    [onFinalReveal],
  );
  const [announced, setAnnounced] = useState(false);
  const teaseRunId = useRef(0);

  useEffect(() => {
    const t = window.setTimeout(() => setStage("tease"), 2_600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (stage !== "tease") return;
    const runId = ++teaseRunId.current;
    let timer: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      await revealAudio.prepareForPlayback();
      if (teaseRunId.current !== runId) return;

      let i = 0;
      let next: "boy" | "girl" = "boy";

      const step = async () => {
        if (teaseRunId.current !== runId) return;
        if (i >= TEASE_DELAYS_MS.length) {
          setTeaseTint(isBoy ? "boy" : "girl");
          setStage("final");
          return;
        }
        setTeaseTint(next);
        await revealAudio.prepareForPlayback();
        if (teaseRunId.current === runId) {
          revealAudio.playGenderTeasePulse(next);
        }
        next = next === "boy" ? "girl" : "boy";
        const delay = TEASE_DELAYS_MS[i];
        i += 1;
        timer = setTimeout(() => void step(), delay);
      };

      await step();
    })();

    return () => {
      teaseRunId.current += 1;
      if (timer) clearTimeout(timer);
    };
  }, [stage, isBoy]);

  useEffect(() => {
    if (stage !== "final") return;
    let cancelled = false;
    void (async () => {
      if (!cancelled) {
        void revealAudio.playInspirationalReveal(isBoy);
      }
    })();
    return () => {
      cancelled = true;
      revealAudio.stopRevealVoices();
    };
  }, [stage, isBoy]);

  useEffect(() => {
    if (stage !== "final" || announced) return;
    setAnnounced(true);
    const t = window.setTimeout(() => finalAnnounced(), 120);
    return () => clearTimeout(t);
  }, [stage, announced, finalAnnounced]);

  const activeTint =
    stage === "ultrasound"
      ? "neutral"
      : stage === "tease"
        ? teaseTint
        : isBoy
          ? "boy"
          : "girl";

  const boyAccent = {
    border: "border-sky-400/55",
    card: "border-sky-400/50 bg-sky-950/75",
    img: "border-sky-500/40",
    glow: "rgba(56,189,248,0.45)",
    title: "text-sky-50",
    shadow: "0 0 48px rgba(56,189,248,0.95), 0 2px 10px rgba(0,0,0,0.9)",
    screen: "from-sky-500/35 via-sky-900/80 to-[#0c1929]",
  };
  const girlAccent = {
    border: "border-pink-400/55",
    card: "border-pink-400/50 bg-pink-950/75",
    img: "border-pink-500/40",
    glow: "rgba(244,114,182,0.45)",
    title: "text-pink-50",
    shadow: "0 0 48px rgba(244,114,182,0.95), 0 2px 10px rgba(0,0,0,0.9)",
    screen: "from-pink-500/35 via-pink-950/80 to-[#1a0a14]",
  };

  const accent =
    stage === "final"
      ? isBoy
        ? boyAccent
        : girlAccent
      : teaseTint === "boy"
        ? boyAccent
        : girlAccent;

  return (
    <motion.div
      className={`ceremony-tv-safe fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-4 py-8 lg:px-12 lg:py-10 ${
        stage === "final"
          ? `bg-gradient-to-b ${isBoy ? boyAccent.screen : girlAccent.screen}`
          : ""
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <SpaceBackdrop
        key={activeTint}
        tint={activeTint}
        intensity={stage === "final" ? 1.55 : 1.05}
      />
      <RevealPartyEffects gender={config.gender} active={stage === "final"} />

      <motion.div
        className="pointer-events-none absolute inset-0 z-[1]"
        animate={{
          background:
            stage === "final"
              ? isBoy
                ? "linear-gradient(180deg, rgba(14,165,233,0.42) 0%, rgba(2,132,199,0.28) 40%, rgba(2,6,23,0.72) 100%)"
                : "linear-gradient(180deg, rgba(236,72,153,0.42) 0%, rgba(219,39,119,0.28) 40%, rgba(2,6,23,0.72) 100%)"
              : activeTint === "boy"
                ? "linear-gradient(180deg, rgba(14,165,233,0.22) 0%, rgba(2,6,23,0.55) 45%, rgba(2,6,23,0.82) 100%)"
                : activeTint === "girl"
                  ? "linear-gradient(180deg, rgba(244,114,182,0.24) 0%, rgba(2,6,23,0.55) 45%, rgba(2,6,23,0.82) 100%)"
                  : "linear-gradient(180deg, rgba(251,191,36,0.08) 0%, rgba(2,6,23,0.65) 50%, rgba(2,6,23,0.85) 100%)",
        }}
        transition={{ duration: stage === "tease" ? 0.28 : 0.6 }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-4 text-center lg:max-w-3xl lg:gap-6 xl:max-w-4xl xl:gap-8">
        <AnimatePresence mode="wait">
          {stage === "final" ? (
            <motion.h2
              key="headline"
              className={`text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl ${accent.title}`}
              style={{ textShadow: accent.shadow }}
              initial={{ opacity: 0, scale: 0.75, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              {headline}
            </motion.h2>
          ) : stage === "tease" ? (
            <motion.p
              key="tease-label"
              className="text-lg font-light tracking-[0.2em] text-white/75 sm:text-xl lg:text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              Descifrando señal…
            </motion.p>
          ) : (
            <motion.p
              key="travel-label"
              className="text-sm font-medium uppercase tracking-[0.35em] text-white/55 lg:text-base xl:text-lg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Imagen en tránsito
            </motion.p>
          )}
        </AnimatePresence>

        {stage === "final" ? (
          <motion.p
            className="text-base font-medium text-white/95 sm:text-lg lg:text-xl"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.85)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            ¡Felicidades, Papá y Mamá!
          </motion.p>
        ) : null}

        <motion.div
          className={`relative w-full overflow-hidden rounded-3xl border-2 p-4 shadow-[0_8px_40px_rgba(0,0,0,0.55)] sm:p-5 lg:rounded-[2rem] lg:p-8 xl:p-10 ${accent.card}`}
          layout
          initial={false}
          animate={{
            boxShadow:
              stage === "tease"
                ? `0 0 32px ${accent.glow}, 0 8px 40px rgba(0,0,0,0.55)`
                : stage === "final"
                  ? `0 0 56px ${accent.glow}, 0 12px 48px rgba(0,0,0,0.6)`
                  : "0 8px 40px rgba(0,0,0,0.55)",
          }}
          transition={{ duration: stage === "tease" ? 0.25 : 0.55 }}
        >
          <motion.div
            className={`relative mx-auto w-full overflow-hidden rounded-2xl border-2 bg-black/55 ${accent.img}`}
            initial={{
              opacity: 0,
              x: "-115%",
              y: 28,
              rotate: -8,
              scale: 0.72,
            }}
            animate={
              stage === "ultrasound"
                ? {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotate: 0,
                    scale: 1,
                  }
                : {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotate: 0,
                    scale: stage === "final" ? 1 : 0.98,
                  }
            }
            transition={
              stage === "ultrasound"
                ? {
                    duration: 2.2,
                    ease: [0.16, 1, 0.3, 1],
                  }
                : { duration: 0.45, ease: "easeOut" }
            }
          >
            <Image
              src="/revelacion/ecografia.jpg"
              alt="Ecografía"
              width={960}
              height={720}
              sizes="(min-width: 1280px) 720px, (min-width: 1024px) 560px, 100vw"
              className="h-auto max-h-[min(42vh,28rem)] w-full object-contain lg:max-h-[min(48vh,32rem)] xl:max-h-[min(52vh,36rem)]"
              priority
            />
            {stage === "ultrasound" ? (
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.6,
                  delay: 0.5,
                  repeat: 1,
                  ease: "easeInOut",
                }}
              />
            ) : null}
          </motion.div>

          {stage === "final" ? (
            <>
              {config.doctorPhrase ? (
                <motion.p
                  className="mb-3 mt-4 text-sm italic leading-relaxed text-white/90 lg:text-base xl:text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  «{config.doctorPhrase}»
                </motion.p>
              ) : null}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <ClinicalBrandBadge variant="compact" />
              </motion.div>
            </>
          ) : null}
        </motion.div>
      </div>
    </motion.div>
  );
}