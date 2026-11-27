import type { RevealConfig, RevealGender } from "./types";
import { DEFAULT_LABELS, normalizeRevealLabels } from "./types";

const UTF8_DECODER = new TextDecoder();
const UTF8_ENCODER = new TextEncoder();

/** Ofusca la configuración en Base64 URL-safe (sin spoilers legibles en la URL). */
export function encodeRevealToken(config: RevealConfig): string {
  const labels = normalizeRevealLabels(config.labels);
  const compact = {
    g: config.gender === "boy" ? "b" : "g",
    dp: config.doctorPhrase?.trim() || undefined,
    lb: [labels.dad, labels.mom, ...labels.children],
  };
  const json = JSON.stringify(compact);
  const bytes = UTF8_ENCODER.encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function labelsFromTokenLb(lb?: string[]): RevealConfig["labels"] {
  if (!lb || lb.length < 2) {
    return { ...DEFAULT_LABELS };
  }
  const dad = lb[0]?.trim() || DEFAULT_LABELS.dad;
  const mom = lb[1]?.trim() || DEFAULT_LABELS.mom;
  const children = lb.slice(2).map((n) => n?.trim() ?? "").filter(Boolean);
  return normalizeRevealLabels({ dad, mom, children });
}

export function decodeRevealToken(token: string): RevealConfig | null {
  try {
    let b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = UTF8_DECODER.decode(bytes);
    const parsed = JSON.parse(json) as {
      g: "b" | "g";
      dp?: string;
      lb?: string[];
      fn?: string;
      os?: string;
      bn?: string;
    };
    const gender: RevealGender = parsed.g === "b" ? "boy" : "girl";
    return {
      gender,
      doctorPhrase: parsed.dp,
      labels: labelsFromTokenLb(parsed.lb),
    };
  } catch {
    return null;
  }
}

export function configFromDemo(demo: string | null): RevealConfig | null {
  if (demo === "boy" || demo === "girl") {
    return {
      gender: demo,
      doctorPhrase: "Signos vitales estables · latido fuerte",
      labels: { ...DEFAULT_LABELS },
    };
  }
  return null;
}