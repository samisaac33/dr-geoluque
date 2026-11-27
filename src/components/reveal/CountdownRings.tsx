"use client";

import { motion } from "framer-motion";

interface CountdownRingsProps {
  secondsLeft: number;
  totalSeconds: number;
  pulsing: boolean;
}

export function CountdownRings({
  secondsLeft,
  totalSeconds,
  pulsing,
}: CountdownRingsProps) {
  const progress = 1 - secondsLeft / totalSeconds;
  const circumference = 2 * Math.PI * 70;

  return (
    <div className="pointer-events-none relative flex h-[min(52vw,14rem)] w-[min(52vw,14rem)] items-center justify-center sm:h-56 sm:w-56 lg:h-64 lg:w-64 xl:h-72 xl:w-72">
      <motion.svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 160 160"
        animate={pulsing ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={pulsing ? { repeat: Infinity, duration: 0.5 } : undefined}
      >
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="8"
        />
        <motion.circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </motion.svg>
      <motion.span
        key={secondsLeft}
        className="text-[min(22vw,5.5rem)] font-semibold tabular-nums tracking-tight text-white drop-shadow-[0_0_28px_rgba(255,255,255,0.45)] sm:text-8xl lg:text-9xl xl:text-[10rem]"
        initial={{ opacity: 0.5, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
      >
        {secondsLeft}
      </motion.span>
    </div>
  );
}