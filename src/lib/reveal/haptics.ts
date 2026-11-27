/** Vibración opcional (mejor soporte en Android; en iOS depende de Safari y del gesto previo). */
export function hapticPulse(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignorar */
  }
}

export const HAPTIC_SUSPENSE_START = 12;
export const HAPTIC_FINAL_HEARTBEAT = [18, 40, 28];
export const HAPTIC_REVEAL = [35, 80, 120];