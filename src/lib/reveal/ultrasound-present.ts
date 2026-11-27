import type { RevealConfig } from "./types";

export function hasRevealUltrasound(
  config: Pick<RevealConfig, "ultrasoundUrl">,
): boolean {
  return Boolean(config.ultrasoundUrl?.trim());
}