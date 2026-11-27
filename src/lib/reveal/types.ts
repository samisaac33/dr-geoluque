export type RevealGender = "boy" | "girl";

export interface RevealLabels {
  dad: string;
  mom: string;
  /** Nombres para la 3.ª, 4.ª y 5.ª huella (hijos), en orden. */
  children: string[];
}

export interface RevealConfig {
  gender: RevealGender;
  doctorPhrase?: string;
  /** URL pública (Blob) o data URL de respaldo en el token. */
  ultrasoundUrl?: string;
  labels: RevealLabels;
}

export const MAX_CHILD_FINGERPRINTS = 3;

export const DEFAULT_LABELS: RevealLabels = {
  dad: "Papá",
  mom: "Mamá",
  children: [],
};

export function normalizeRevealLabels(
  labels?: Partial<RevealLabels> | null,
): RevealLabels {
  const children = (labels?.children ?? [])
    .map((n) => n?.trim() ?? "")
    .filter(Boolean)
    .slice(0, MAX_CHILD_FINGERPRINTS);
  return {
    dad: labels?.dad?.trim() || DEFAULT_LABELS.dad,
    mom: labels?.mom?.trim() || DEFAULT_LABELS.mom,
    children,
  };
}

export function childSensorId(index: number): string {
  return `child-${index}`;
}

export function fingerprintCount(labels: RevealLabels): number {
  return 2 + labels.children.length;
}

/** Felicitación con Papá, Mamá y los hijos registrados en el enlace. */
export function congratulationsPhrase(
  labels?: Partial<RevealLabels> | null,
): string {
  const { dad, mom, children } = normalizeRevealLabels(labels);
  const names = [dad, mom, ...children];
  if (names.length === 2) {
    return `¡Felicidades, ${dad} y ${mom}!`;
  }
  if (names.length === 3) {
    return `¡Felicidades, ${dad}, ${mom} y ${children[0]!}!`;
  }
  const allButLast = names.slice(0, -1).join(", ");
  const last = names[names.length - 1]!;
  return `¡Felicidades, ${allButLast} y ${last}!`;
}