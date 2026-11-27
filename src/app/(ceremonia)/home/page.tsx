"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { ClinicalBrandBadge } from "@/components/reveal/ClinicalBrandBadge";
import { revealAudio } from "@/lib/reveal/audio";
import { CLINICAL_BRAND } from "@/lib/reveal/clinical-brand";

const STORAGE_KEY = "reveal-ceremony-link";

export default function CeremoniaHomePage() {
  const router = useRouter();
  const [unlocking, setUnlocking] = useState(false);

  const unlock = useCallback(async () => {
    revealAudio.primeFromUserGesture();
    setUnlocking(true);
    try {
      await Promise.race([
        revealAudio.unlock(),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, 2_500);
        }),
      ]);
    } catch {
      /* El escáner vuelve a desbloquear con el primer toque */
    }

    const secret =
      sessionStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(STORAGE_KEY);
    if (secret) {
      router.push(secret.startsWith("/") ? secret : `/reveal?k=${secret}`);
    } else {
      router.push("/reveal");
    }
    setUnlocking(false);
  }, [router]);

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#05070f] via-[#0c1630] to-[#060810] px-6 py-12">
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.div
          className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-300/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-teal-500/5 to-transparent" />
      </motion.div>

      <motion.div
        className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <ClinicalBrandBadge className="w-full" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <h1 className="text-3xl font-light tracking-tight text-white sm:text-4xl md:text-5xl">
            Ceremonia de revelación
          </h1>
          <p className="mt-3 text-sm text-white/50 sm:text-base">
            Experiencia preparada por {CLINICAL_BRAND.doctorName}
          </p>
        </motion.div>

        <motion.button
          type="button"
          onClick={() => void unlock()}
          disabled={unlocking}
          className="w-full rounded-full border border-teal-200/25 bg-gradient-to-r from-teal-500/20 via-white/10 to-sky-400/15 px-8 py-4 text-base font-medium text-teal-50 shadow-[0_0_40px_rgba(45,212,191,0.15)] backdrop-blur-sm transition hover:border-teal-200/45 hover:shadow-[0_0_50px_rgba(45,212,191,0.25)] disabled:opacity-60"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          {unlocking ? "Preparando audio…" : "Iniciar ceremonia"}
        </motion.button>
      </motion.div>
    </main>
  );
}