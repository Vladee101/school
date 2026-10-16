import { NextResponse } from "next/server";
import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/dal";

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf"];

/**
 * Выдаёт presigned-URL для прямой загрузки PDF из браузера в Vercel Blob. Только для администратора.
 * Авторизация в Blob: OIDC + BLOB_STORE_ID (интеграция Vercel) либо BLOB_READ_WRITE_TOKEN (локально).
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as HandleUploadPresignedBody;
  try {
    const json = await handleUploadPresigned({
      body,
      request,
      // Колбэки о завершении загрузки не используются; ключ нужен SDK только для их проверки (в Vercel он задан интеграцией).
      webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY ?? "unused",
      getSignedToken: async (pathname) => ({
        token: await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_PDF_BYTES,
        }),
        urlOptions: {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_PDF_BYTES,
          addRandomSuffix: true,
        },
      }),
    });
    return NextResponse.json(json);
  } catch (e) {
    console.error("[blob/upload] не удалось выдать разрешение на загрузку:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload error" }, { status: 400 });
  }
}
