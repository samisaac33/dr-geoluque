"use client";

import { useEffect } from "react";

import { revealAudio } from "@/lib/reveal/audio";

/** Reanuda Web Audio en el primer toque de cualquier pantalla de la ceremonia. */
export function CeremonyAudioUnlock() {
  useEffect(() => {
    const unlock = () => {
      revealAudio.primeFromUserGesture();
    };

    const opts: AddEventListenerOptions = { passive: true, capture: true };
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("touchstart", unlock, opts);
    window.addEventListener("keydown", unlock, opts);

    return () => {
      window.removeEventListener("pointerdown", unlock, opts);
      window.removeEventListener("touchstart", unlock, opts);
      window.removeEventListener("keydown", unlock, opts);
    };
  }, []);

  return null;
}