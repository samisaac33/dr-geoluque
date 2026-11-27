const MAX_EDGE = 960;
const JPEG_QUALITY = 0.82;
const MAX_BYTES = 1_200_000;

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

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("No se pudo leer la imagen."));
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(blob);
  });
}

const MAX_EMBED_TOKEN_LEN = 120_000;

export async function uploadUltrasoundForCeremony(
  blob: Blob,
): Promise<{ url: string; embeddedInToken: boolean }> {
  const form = new FormData();
  form.append("file", blob, "ecografia.jpg");

  try {
    const res = await fetch("/api/reveal/ultrasound", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const data = (await res.json()) as { url: string };
      return { url: data.url, embeddedInToken: false };
    }
    if (res.status !== 503) {
      const err = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(
        err?.message ?? "No se pudo guardar la ecografía en el servidor.",
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("servidor")) throw e;
    /* red caída → respaldo en token */
  }

  const dataUrl = await blobToDataUrl(blob);
  if (dataUrl.length > MAX_EMBED_TOKEN_LEN) {
    throw new Error(
      "Configure Vercel Blob en el proyecto o use una imagen más pequeña.",
    );
  }
  return { url: dataUrl, embeddedInToken: true };
}