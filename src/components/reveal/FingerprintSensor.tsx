"use client";

import { motion } from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";

import { FingerprintGlyph } from "@/components/reveal/FingerprintGlyph";

export type SensorId = string;

interface FingerprintSensorProps {
  id: SensorId;
  label: string;
  active: boolean;
  countdown?: boolean;
  rescueReady?: boolean;
  /** Si es true, el sensor participa en un flex/grid (fila 1 o 2) sin posición absoluta. */
  inFlow?: boolean;
  positionClass?: string;
  onPointerDown: (id: SensorId, e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (id: SensorId, e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (id: SensorId, e: ReactPointerEvent<HTMLDivElement>) => void;
}

export function FingerprintSensor({
  id,
  label,
  active,
  countdown,
  rescueReady,
  inFlow = false,
  positionClass = "",
  onPointerDown,
  onPointerUp,
  onPointerCancel,
}: FingerprintSensorProps) {
  return (
    <motion.div
      className={
        inFlow
          ? "relative z-10 flex min-w-0 flex-1 flex-col items-center gap-2"
          : `absolute ${positionClass} z-10 flex flex-col items-center gap-2`
      }
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        role="button"
        aria-label={`Sensor ${label}`}
        aria-pressed={active}
        className="relative h-[min(28vw,8rem)] w-[min(28vw,8rem)] cursor-pointer touch-none select-none sm:h-[7.5rem] sm:w-[7.5rem] lg:h-[9.5rem] lg:w-[9.5rem] xl:h-[11rem] xl:w-[11rem]"
        style={{
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          onPointerDown(id, e);
        }}
        onPointerUp={(e) => onPointerUp(id, e)}
        onPointerCancel={(e) => onPointerCancel(id, e)}
        onLostPointerCapture={(e) => onPointerCancel(id, e)}
      >
        <motion.div
          className={`absolute inset-0 rounded-full border-[3px] transition-colors duration-150 ${
            active
              ? countdown
                ? "border-amber-100 bg-gradient-to-br from-amber-400/45 via-amber-300/25 to-sky-200/20 shadow-[0_0_50px_rgba(251,191,36,0.75),inset_0_0_24px_rgba(255,255,255,0.15)]"
                : "border-amber-200 bg-gradient-to-br from-amber-500/35 via-amber-400/20 to-white/10 shadow-[0_0_44px_rgba(251,191,36,0.6)]"
              : rescueReady
                ? "border-emerald-400/70 shadow-[0_0_28px_rgba(52,211,153,0.35)]"
                : "border-white/20 bg-gradient-to-br from-slate-800/90 via-slate-900 to-black shadow-[0_0_24px_rgba(255,255,255,0.06)]"
          } backdrop-blur-sm`}
          animate={
            active
              ? { scale: countdown ? 1.06 : [1, 1.05, 1] }
              : { scale: 1 }
          }
          transition={
            active && !countdown
              ? { repeat: Infinity, duration: 0.9 }
              : { duration: 0.15 }
          }
        />
        <FingerprintGlyph active={active} glyphId={id} />
        {active ? (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full bg-white/25"
            animate={{ opacity: countdown ? 0.5 : [0.25, 0.55, 0.25] }}
            transition={
              countdown
                ? { duration: 0.2 }
                : { repeat: Infinity, duration: 0.8 }
            }
          />
        ) : null}
        {active ? (
          <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-300 text-[10px] font-bold text-slate-900 shadow-lg lg:h-7 lg:w-7 lg:text-xs">
            ✓
          </span>
        ) : null}
      </div>
      <span
        className={`text-center text-xs font-semibold tracking-wide sm:text-sm lg:text-base xl:text-lg ${
          active ? "text-amber-100" : "text-white/55"
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}