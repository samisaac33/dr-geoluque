import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      {
        error:
          "storage_unconfigured",
        message:
          "Falta BLOB_READ_WRITE_TOKEN en el proyecto (Vercel Blob). Contacte al administrador del sitio.",
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
  });

  return Response.json({ url: blob.url });
}