"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { zodFail, type FormState } from "@/lib/form-state";

/** Допускаем только PDF из хранилища Vercel Blob (защита от подмены URL в форме). */
const blobUrl = z
  .string()
  .url("Загрузите PDF-файл")
  .refine((u) => {
    const { protocol, hostname, pathname } = new URL(u);
    return protocol === "https:" && hostname.endsWith(".blob.vercel-storage.com") && pathname.toLowerCase().endsWith(".pdf");
  }, "Некорректный файл: нужен PDF, загруженный через форму");

const schema = z.object({
  name: z.string().trim().min(3, "Название: минимум 3 символа").max(200),
  category: z.string().trim().min(2, "Укажите категорию").max(100),
  filePath: blobUrl,
});

function revalidateDocs() {
  revalidatePath("/admin/documents");
  revalidatePath("/documents");
}

const isBlobUrl = (u: string) => {
  try {
    return new URL(u).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
};

async function removeBlob(url: string) {
  if (!isBlobUrl(url)) return;
  try {
    await del(url);
  } catch (e) {
    console.error("Не удалось удалить файл из Blob", e);
  }
}

export async function createDocument(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const isPublished = formData.get("isPublished") === "on";

  const doc = await prisma.document.create({
    data: { ...parsed.data, isPublished, publishedAt: isPublished ? new Date() : null },
  });
  revalidateDocs();
  redirect(`/admin/documents/${doc.id}`);
}

export async function updateDocument(id: number, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const current = await prisma.document.findUnique({ where: { id } });
  if (!current) return { error: "Документ не найден" };
  const isPublished = formData.get("isPublished") === "on";

  await prisma.document.update({
    where: { id },
    data: { ...parsed.data, isPublished, publishedAt: isPublished ? (current.publishedAt ?? new Date()) : current.publishedAt },
  });
  if (current.filePath !== parsed.data.filePath) await removeBlob(current.filePath);
  revalidateDocs();
  return { ok: "Сохранено" };
}

export async function setDocumentPublished(id: number, publish: boolean) {
  await requireAdmin();
  const current = await prisma.document.findUnique({ where: { id } });
  if (!current) return;
  await prisma.document.update({
    where: { id },
    data: { isPublished: publish, publishedAt: publish ? (current.publishedAt ?? new Date()) : current.publishedAt },
  });
  revalidateDocs();
}

export async function deleteDocument(id: number) {
  await requireAdmin();
  const current = await prisma.document.findUnique({ where: { id } });
  if (current) {
    await prisma.document.delete({ where: { id } });
    await removeBlob(current.filePath);
  }
  revalidateDocs();
  redirect("/admin/documents");
}
