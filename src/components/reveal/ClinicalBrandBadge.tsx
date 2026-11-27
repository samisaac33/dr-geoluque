"use client";

import { motion } from "framer-motion";

import { CLINICAL_BRAND } from "@/lib/reveal/clinical-brand";

interface ClinicalBrandBadgeProps {
  variant?: "compact" | "card";
  className?: string;
}

export function ClinicalBrandBadge({
  variant = "card",
  className = "",
}: ClinicalBrandBadgeProps) {
  if (variant === "compact") {
    return (
      <p
        className={`text-center text-[0.7rem] font-medium tracking-wide text-teal-200/65 ${className}`}
      >
        {CLINICAL_BRAND.shortLine}
      </p>
    );
  }

  return (
    <motion.div
      className={`rounded-2xl border border-teal-400/25 bg-gradient-to-br from-teal-500/12 via-white/5 to-sky-500/8 px-5 py-4 text-center shadow-[0_0_32px_rgba(45,212,191,0.08)] ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-teal-200/55">
        Consultorio
      </p>
      <p className="mt-2 text-lg font-medium text-white sm:text-xl">
        {CLINICAL_BRAND.doctorName}
      </p>
      <p className="mt-1 text-sm text-white/55">{CLINICAL_BRAND.specialty}</p>
    </motion.div>
  );
}