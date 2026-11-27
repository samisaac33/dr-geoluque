"use client";

import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { ClinicalBrandBadge } from "@/components/reveal/ClinicalBrandBadge";
import { CountdownRings } from "@/components/reveal/CountdownRings";
import {
  FingerprintSensor,
  type SensorId,
} from "@/components/reveal/FingerprintSensor";
import { RevealFinale } from "@/components/reveal/RevealFinale";
import { RevealSuspense } from "@/components/reveal/RevealSuspense";
import { revealAudio } from "@/lib/reveal/audio";
import {
  hapticPulse,
  HAPTIC_FINAL_HEARTBEAT,
  HAPTIC_REVEAL,
  HAPTIC_SUSPENSE_START,
} from "@/lib/reveal/haptics";
import type { RevealConfig } from "@/lib/reveal/types";
import {
  childSensorId,
  DEFAULT_LABELS,
  fingerprintCount,
  normalizeRevealLabels,
} from "@/lib/reveal/types";
import { DRAMATIC_FINALE_MS } from "@/lib/reveal/timing";

const COUNTDOWN_MS = 5000;
const RELEASE_GRACE_MS = 400;

const DAD_ID: SensorId = "dad";
const MOM_ID: SensorId = "mom";

interface BiometricScannerProps {
  config: RevealConfig;
}

function childPositionClass(index: number, total: number): string {
  if (total === 1) return "bottom-2 right-[6%] sm:right-[10%]";
  if (total === 2) {
    return index === 0
      ? "bottom-2 left-1/2 -translate-x-1/2"
      : "bottom-2 right-[6%] sm:right-[10%]";
  }
  const three = [
    "bottom-2 left-[10%] sm:left-[12%]",
    "bottom-2 left-1/2 -translate-x-1/2",
    "bottom-2 right-[10%] sm:right-[12%]",
  ];
  return three[index] ?? three[0]!;
}

function dadPositionClass(childCount: number): string {
  if (childCount === 0) return "left-[18%] top-[32%]";
  return "left-1/2 top-0 -translate-x-1/2";
}

function momPositionClass(childCount: number): string {
  if (childCount === 0) return "right-[18%] top-[32%]";
  return "bottom-2 left-[6%] sm:left-[10%]";
}

export function BiometricScanner({ config }: BiometricScannerProps) {
  const labels = useMemo(
    () => normalizeRevealLabels(config.labels ?? DEFAULT_LABELS),
    [config.labels],
  );
  const childCount = labels.children.length;
  const totalFingerprints = fingerprintCount(labels);

  const sensorPlan = useMemo(() => {
    const entries: { id: SensorId; label: string; positionClass: string }[] = [
      {
        id: DAD_ID,
        label: labels.dad,
        positionClass: dadPositionClass(childCount),
      },
      {
        id: MOM_ID,
        label: labels.mom,
        positionClass: momPositionClass(childCount),
      },
    ];
    labels.children.forEach((name, index) => {
      entries.push({
        id: childSensorId(index),
        label: name,
        positionClass: childPositionClass(index, childCount),
      });
    });
    return entries;
  }, [labels, childCount]);

  const childIds = useMemo(
    () => labels.children.map((_, i) => childSensorId(i)),
    [labels.children],
  );

  const [phase, setPhase] = useState<
    "scan" | "countdown" | "suspense" | "reveal"
  >("scan");
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [activeSensors, setActiveSensors] = useState<Record<string, boolean>>(
    {},
  );
  const [rescueReady, setRescueReady] = useState(false);
  const [flash, setFlash] = useState(false);

  const contactsPerSensor = useRef<Map<SensorId, Set<number>>>(new Map());
  const childTouchAccumMs = useRef(0);
  const childTouchStart = useRef<number | null>(null);
  const holdMs = useRef(0);
  const graceUntil = useRef(0);
  const heartbeatStarted = useRef(false);
  const suspenseStarted = useRef(false);
  const suspenseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTitleTap = useRef(0);
  const titleTapCount = useRef(0);
  const phaseRef = useRef(phase);
  const scannerRef = useRef<HTMLDivElement>(null);
  phaseRef.current = phase;

  useEffect(() => {
    const map = new Map<SensorId, Set<number>>();
    for (const { id } of sensorPlan) {
      map.set(id, new Set());
    }
    contactsPerSensor.current = map;
    const initialActive: Record<string, boolean> = {};
    for (const { id } of sensorPlan) {
      initialActive[id] = false;
    }
    setActiveSensors(initialActive);
  }, [sensorPlan]);

  const sensorActive = (id: SensorId) =>
    (contactsPerSensor.current.get(id)?.size ?? 0) > 0;

  const allChildrenPressed = () =>
    childCount === 0 || childIds.every((id) => sensorActive(id));

  const parentsHeld = () => sensorActive(DAD_ID) && sensorActive(MOM_ID);

  const allRequiredPressed = () => parentsHeld() && allChildrenPressed();

  const rescueMode = () => {
    if (childCount === 0) return false;
    const childHeldEnough = childTouchAccumMs.current >= 1000;
    return parentsHeld() && (childHeldEnough || rescueReady);
  };

  const holdCondition = () =>
    childCount === 0
      ? parentsHeld()
      : allRequiredPressed() || rescueMode();

  const syncActiveSensors = () => {
    const next: Record<string, boolean> = {};
    for (const { id } of sensorPlan) {
      next[id] = sensorActive(id);
    }
    setActiveSensors(next);
    const anyChildTouch = childTouchAccumMs.current >= 1000;
    setRescueReady(
      childCount > 0 &&
        parentsHeld() &&
        anyChildTouch &&
        !allChildrenPressed(),
    );
  };

  const startCelebration = useCallback(() => {
    const isBoy = config.gender === "boy";
    const colors = isBoy
      ? ["#7dd3fc", "#38bdf8", "#e0f2fe", "#0ea5e9", "#ffffff"]
      : ["#f9a8d4", "#f472b6", "#fce7f3", "#ec4899", "#ffffff"];

    void revealAudio.playCelebration(isBoy);

    const burst = () => {
      void confetti({
        particleCount: 22,
        angle: 60,
        spread: 78,
        origin: { x: 0, y: 0.55 },
        colors,
        zIndex: 60,
      });
      void confetti({
        particleCount: 22,
        angle: 120,
        spread: 78,
        origin: { x: 1, y: 0.55 },
        colors,
        zIndex: 60,
      });
      void confetti({
        particleCount: 35,
        spread: 100,
        origin: { x: 0.5, y: 0.35 },
        colors,
        zIndex: 60,
        scalar: 1.1,
      });
    };

    burst();
    confettiInterval.current = setInterval(burst, 420);
  }, [config.gender]);

  const finishReveal = useCallback(() => {
    if (phaseRef.current === "reveal") return;
    if (suspenseTimer.current) {
      clearTimeout(suspenseTimer.current);
      suspenseTimer.current = null;
    }
    revealAudio.stopHeartbeat();
    revealAudio.sustainSession();
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    setPhase("reveal");
    hapticPulse(HAPTIC_REVEAL);
  }, []);

  const startSuspense = useCallback(() => {
    if (phaseRef.current !== "countdown" || suspenseStarted.current) return;
    suspenseStarted.current = true;
    setPhase("suspense");
    hapticPulse(HAPTIC_SUSPENSE_START);
    revealAudio.primeFromUserGesture();
    void revealAudio.unlock();
    revealAudio.sustainSession();
    revealAudio.runDramaticFinale(() => {
      hapticPulse(HAPTIC_FINAL_HEARTBEAT);
      if (suspenseTimer.current) {
        clearTimeout(suspenseTimer.current);
        suspenseTimer.current = null;
      }
      finishReveal();
    });
    suspenseTimer.current = setTimeout(() => {
      if (phaseRef.current === "suspense") finishReveal();
    }, DRAMATIC_FINALE_MS + 2000);
  }, [finishReveal]);

  const resetHold = useCallback(() => {
    holdMs.current = 0;
    graceUntil.current = 0;
    heartbeatStarted.current = false;
    suspenseStarted.current = false;
    if (suspenseTimer.current) {
      clearTimeout(suspenseTimer.current);
      suspenseTimer.current = null;
    }
    revealAudio.stopHeartbeat();
    setSecondsLeft(5);
    if (
      phaseRef.current === "countdown" ||
      phaseRef.current === "suspense"
    ) {
      setPhase("scan");
    }
  }, []);

  const addContact = (id: SensorId, contactId: number) => {
    contactsPerSensor.current.get(id)?.add(contactId);
    const isChild = id.startsWith("child-");
    if (isChild && childTouchStart.current === null) {
      childTouchStart.current = performance.now();
    }
    syncActiveSensors();
  };

  const removeContact = (id: SensorId, contactId: number) => {
    contactsPerSensor.current.get(id)?.delete(contactId);
    const isChild = id.startsWith("child-");
    if (isChild) {
      const anyChildActive = childIds.some((cid) => sensorActive(cid));
      if (!anyChildActive) {
        childTouchStart.current = null;
      }
    }
    syncActiveSensors();
  };

  const capturePointer = (
    id: SensorId,
    e: ReactPointerEvent<HTMLDivElement>,
  ) => {
    revealAudio.primeFromUserGesture();
    if (e.pointerType === "mouse" && e.buttons !== 1) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* iOS puede rechazar capture en casos raros */
    }
    addContact(id, e.pointerId);
  };

  const releasePointer = (
    id: SensorId,
    e: ReactPointerEvent<HTMLDivElement>,
  ) => {
    removeContact(id, e.pointerId);
  };

  useEffect(() => {
    const el = scannerRef.current;
    if (!el) return;
    const blockGesture = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    el.addEventListener("touchstart", blockGesture, { passive: false });
    return () => el.removeEventListener("touchstart", blockGesture);
  }, []);

  useEffect(() => {
    if (phase === "reveal") return;

    const tick = (dt: number) => {
      if (childTouchStart.current !== null) {
        childTouchAccumMs.current += dt;
      }
      syncActiveSensors();

      const holding = holdCondition();

      if (holding) {
        graceUntil.current = 0;
        if (
          phaseRef.current === "scan" &&
          (allRequiredPressed() || rescueMode())
        ) {
          setPhase("countdown");
        }
        if (phaseRef.current === "countdown") {
          if (!heartbeatStarted.current) {
            heartbeatStarted.current = true;
            revealAudio.primeFromUserGesture();
            void revealAudio.unlock();
            revealAudio.sustainSession();
            revealAudio.startHeartbeatCountdown(COUNTDOWN_MS / 1000, () => {});
          }
          holdMs.current += dt;
          const left = Math.max(
            1,
            Math.ceil((COUNTDOWN_MS - holdMs.current) / 1000),
          );
          setSecondsLeft(left);
          if (holdMs.current >= COUNTDOWN_MS) {
            startSuspense();
          }
        }
      } else if (phaseRef.current === "countdown") {
        const now = performance.now();
        if (graceUntil.current === 0) {
          graceUntil.current = now + RELEASE_GRACE_MS;
        }
        if (now >= graceUntil.current) {
          resetHold();
        }
      }
    };

    let last = performance.now();
    const iv = setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      tick(dt);
    }, 50);

    return () => clearInterval(iv);
  }, [phase, startSuspense, resetHold, rescueReady, childCount, childIds]);

  useEffect(() => {
    return () => {
      revealAudio.endSustainSession();
      revealAudio.stopHeartbeat();
      if (confettiInterval.current) clearInterval(confettiInterval.current);
      if (suspenseTimer.current) clearTimeout(suspenseTimer.current);
    };
  }, []);

  const onTitleTap = () => {
    const now = performance.now();
    if (now - lastTitleTap.current < 400) {
      titleTapCount.current += 1;
    } else {
      titleTapCount.current = 1;
    }
    lastTitleTap.current = now;
    if (titleTapCount.current >= 2) {
      titleTapCount.current = 0;
      setRescueReady(true);
      if (phase === "countdown" && parentsHeld()) {
        holdMs.current = COUNTDOWN_MS;
        startSuspense();
      }
    }
  };

  const isCountdown = phase === "countdown";
  const isBoy = config.gender === "boy";
  const revealBg =
    phase === "reveal"
      ? isBoy
        ? "bg-gradient-to-b from-sky-950 via-sky-900/90 to-[#02040a]"
        : "bg-gradient-to-b from-pink-950 via-pink-900/90 to-[#02040a]"
      : phase === "suspense"
        ? "bg-[#02040a]"
        : "bg-gradient-to-b from-[#05070f] via-[#0a1228] to-[#060810]";

  const holdHint =
    childCount === 0
      ? "Coloquen el dedo de Papá y Mamá en su sensor"
      : `Coloquen ${totalFingerprints} dedos · un corazón`;

  const countdownHint =
    childCount === 0
      ? "No suelten · Papá y Mamá deben permanecer activos"
      : `No suelten · las ${totalFingerprints} huellas deben permanecer activas`;

  const allActive = sensorPlan.every(({ id }) => activeSensors[id]);

  return (
    <motion.main
      className={`ceremony-tv-safe relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-4 py-6 transition-colors duration-1000 lg:min-h-screen lg:px-8 lg:py-10 ${revealBg}`}
    >
      {phase === "suspense" ? <RevealSuspense active /> : null}

      <AnimatePresence>
        {flash ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50 bg-white"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          />
        ) : null}
      </AnimatePresence>

      {phase === "scan" || phase === "countdown" ? (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-40"
            animate={{ opacity: isCountdown ? 0.5 : 0.35 }}
          >
            <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
          </motion.div>

          <button
            type="button"
            onClick={onTitleTap}
            className="relative z-20 mb-4 max-w-md border-0 bg-transparent p-0 text-center lg:mb-6 lg:max-w-3xl"
          >
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-amber-200/50 lg:text-sm">
              Escáner biométrico
            </p>
            <h1 className="mt-2 text-2xl font-light text-white sm:text-3xl lg:text-4xl xl:text-5xl">
              Ceremonia de revelación
            </h1>
            <ClinicalBrandBadge variant="compact" className="mt-2" />
            <p className="mt-1 text-sm text-white/45 lg:hidden">
              {isCountdown ? countdownHint : holdHint}
            </p>
            <p className="mt-2 hidden text-base text-white/55 lg:block xl:text-lg">
              {isCountdown ? countdownHint : holdHint}
            </p>
          </button>

          <div
            ref={scannerRef}
            className={`relative z-10 mx-auto mt-2 touch-none select-none ${
              childCount >= 2
                ? "h-[min(78vw,24rem)] w-[min(95vw,30rem)] sm:h-[26rem] sm:w-[32rem] lg:h-[min(56vh,30rem)] lg:w-[min(70vh,38rem)]"
                : "h-[min(70vw,21rem)] w-[min(92vw,27rem)] sm:h-[22rem] sm:w-[30rem] lg:h-[min(52vh,28rem)] lg:w-[min(64vh,36rem)]"
            }`}
            style={{
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitTouchCallout: "none",
            }}
          >
            {sensorPlan.map(({ id, label, positionClass }) => (
              <FingerprintSensor
                key={id}
                id={id}
                label={label}
                active={Boolean(activeSensors[id])}
                countdown={isCountdown}
                rescueReady={rescueReady && id.startsWith("child-")}
                positionClass={positionClass}
                onPointerDown={capturePointer}
                onPointerUp={releasePointer}
                onPointerCancel={releasePointer}
              />
            ))}

            {!isCountdown ? (
              <motion.p
                className="pointer-events-none absolute left-1/2 top-[46%] w-full -translate-x-1/2 text-center text-xs text-white/45 lg:text-sm xl:text-base"
                animate={{ opacity: [0.35, 0.75, 0.35] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
              >
                {allActive
                  ? "¡Huellas activas! Mantengan presionado…"
                  : rescueReady
                    ? "Modo rescate: Papá y Mamá pueden continuar"
                    : `Mantengan cada dedo en su sensor hasta ver el 5`}
              </motion.p>
            ) : null}
          </div>

          <AnimatePresence>
            {isCountdown ? (
              <motion.div
                className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-start bg-black/30 backdrop-blur-[2px] pt-[10vh] sm:pt-[12vh] md:pt-[14vh] lg:pt-[8vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <CountdownRings
                    secondsLeft={secondsLeft}
                    totalSeconds={5}
                    pulsing
                  />
                  <p className="text-sm font-medium text-white/80 lg:text-lg xl:text-xl">
                    {totalFingerprints} huellas verificadas
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="mt-3 flex flex-wrap justify-center gap-3 text-[0.65rem] text-white/35 lg:mt-5 lg:gap-4 lg:text-sm">
            {sensorPlan.map(({ id, label }) => (
              <span
                key={id}
                className={
                  activeSensors[id] ? "text-amber-200/90" : undefined
                }
              >
                {label} {activeSensors[id] ? "●" : "○"}
              </span>
            ))}
          </div>
        </>
      ) : null}

      {phase === "reveal" ? (
        <RevealFinale config={config} onFinalReveal={startCelebration} />
      ) : null}
    </motion.main>
  );
}