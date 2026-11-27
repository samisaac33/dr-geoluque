const MAX_EDGE = 720;
const JPEG_QUALITY = 0.72;
const MAX_BYTES = 900_000;

/** Redimensiona y comprime una ecografía en el navegador antes de subirla. */
export async function prepareUltrasoundFile(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compresión fallida"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });

  if (blob.size > MAX_BYTES) {
    throw new Error(
      "La imagen sigue siendo muy pesada. Use una foto más pequeña o recorte la ecografía.",
    );
  }

  return blob;
}

export function fileToPreviewUrl(file: Blob): string {
  return URL.createObjectURL(file);
}

import { resolveBlobReadWriteToken } from "./blob-read-write-token";

export async function uploadUltrasoundForCeremony(
  blob: Blob,
): Promise<string> {
  const form = new FormData();
  form.append("file", blob, "ecografia.jpg");

  const res = await fetch("/api/reveal/ultrasound", {
    method: "POST",
    body: form,
  });

  if (res.ok) {
    const data = (await res.json()) as { url: string };
    return data.url;
  }

  const err = (await res.json().catch(() => null)) as {
    message?: string;
    error?: string;
  } | null;

  if (res.status === 503) {
    throw new Error(
      err?.message ??
        "Almacenamiento no configurado. En Vercel: conecte Blob al proyecto, active el token de lectura/escritura y haga redeploy.",
    );
  }

  throw new Error(
    err?.message ?? "No se pudo subir la ecografía. Intente de nuevo.",
  );
}

/** Solo servidor: comprobar si Blob está configurado (para logs). */
export function hasBlobTokenOnServer(): boolean {
  return Boolean(resolveBlobReadWriteToken());
}