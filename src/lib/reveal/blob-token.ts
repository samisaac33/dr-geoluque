/** Resuelve la referencia de ecografía guardada en el token del enlace. */
export function resolveUltrasoundUrl(us: string | undefined): string | undefined {
  if (!us) return undefined;
  if (
    us.startsWith("http://") ||
    us.startsWith("https://") ||
    us.startsWith("data:")
  ) {
    return us;
  }
  return undefined;
}

/** Guarda en el token solo URL pública de Blob (corta). Nunca embeber base64. */
export function ultrasoundForToken(publicUrl: string): string {
  return publicUrl;
}