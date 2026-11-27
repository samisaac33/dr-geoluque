const EXACT_KEYS = [
  "BLOB_READ_WRITE_TOKEN",
  "BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN",
  "BLOB_READ_WRITE_TOKEN_READ_WRITE",
] as const;

function isBlobCredentialKey(key: string): boolean {
  if (key.includes("WEBHOOK") || key.includes("STORE_ID")) return false;
  if (key.endsWith("_STORE")) return false;
  if (key === "BLOB_READ_WRITE_TOKEN") return true;
  if (key.endsWith("_READ_WRITE_TOKEN")) return true;
  if (key.endsWith("_READ_WRITE") && key.includes("BLOB")) return true;
  return false;
}

/** Token de lectura/escritura del store Blob conectado al proyecto en Vercel. */
export function resolveBlobReadWriteToken(): string | undefined {
  for (const key of EXACT_KEYS) {
    const value = process.env[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  const candidates: string[] = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value !== "string" || value.length === 0) continue;
    if (!isBlobCredentialKey(key)) continue;
    candidates.push(value);
  }

  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    const longest = candidates.reduce((a, b) => (a.length >= b.length ? a : b));
    if (longest.length >= 32) return longest;
  }
  return undefined;
}