"use client";

import { motion } from "framer-motion";

import { ClinicalBrandBadge } from "@/components/reveal/ClinicalBrandBadge";
import { RevealGenderRegister } from "@/components/reveal/RevealGenderRegister";

export default function ProfessionalRegistryPage() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-[#080c14] via-[#0a1424] to-[#05070f] px-5 py-10">
      <motion.div
        className="mx-auto max-w-lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ClinicalBrandBadge className="mt-2" />

        <div className="mt-8">
          <RevealGenderRegister
            copyVariant="clinical"
            redirectOnSuccess={undefined}
          />
        </div>
      </motion.div>
    </main>
  );
}