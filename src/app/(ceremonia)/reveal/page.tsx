"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { BiometricScanner } from "@/components/reveal/BiometricScanner";
import { configFromDemo, decodeRevealToken } from "@/lib/reveal/token";
import { DEFAULT_LABELS, type RevealConfig } from "@/lib/reveal/types";

function RevealPageContent() {
  const params = useSearchParams();
  const token = params.get("k");
  const demo = params.get("demo");

  const { config, missingConfig } = useMemo(() => {
    const fromDemo = configFromDemo(demo);
    if (fromDemo) {
      return {
        config: fromDemo,
        missingConfig: false,
      };
    }
    if (token) {
      const decoded = decodeRevealToken(token);
      if (decoded) {
        return {
          config: decoded,
          missingConfig: false,
        };
      }
    }
    const fallback: RevealConfig = {
      gender: "boy",
      labels: { ...DEFAULT_LABELS },
    };
    return {
      config: fallback,
      missingConfig: !token && !demo,
    };
  }, [token, demo]);

  if (missingConfig) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-[#05070f] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl text-white/90">Ceremonia sin enlace secreto</h1>
          <p className="mt-3 max-w-sm text-sm text-white/45">
            Este enlace no es válido o ya no está disponible. Solicite a su
            médico un enlace nuevo para la ceremonia.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="rounded-full border border-white/15 px-6 py-3 text-sm text-teal-100/90"
            >
              Volver al inicio
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return <BiometricScanner config={config} />;
}

export default function RevealPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100dvh] items-center justify-center bg-[#05070f] text-white/40">
          Cargando escáner…
        </main>
      }
    >
      <RevealPageContent />
    </Suspense>
  );
}