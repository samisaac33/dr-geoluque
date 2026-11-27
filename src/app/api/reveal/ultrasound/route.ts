import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

function blobReadWriteToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (
      key.startsWith("BLOB_READ_WRITE_TOKEN") &&
      typeof value === "string" &&
      value.length > 0
    ) {
      return value;
    }
  }
  return undefined;
}

export async function POST(request: Request) {
  const token = blobReadWriteToken();
  if (!token) {
    return Response.json(
      {
        error: "storage_unconfigured",
        message:
          "Falta el token de Vercel Blob. En el proyecto: Storage → Blob → conectar, marque la casilla del token y redeploy.",
      },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "invalid_form" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return Response.json({ error: "missing_file" }, { status: 400 });
  }

  if (file.size > 2_500_000) {
    return Response.json({ error: "file_too_large" }, { status: 413 });
  }

  const id = randomUUID();
  const blob = await put(`reveal/${id}.jpg`, file, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    token,
  });

  return Response.json({ url: blob.url });
}