"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { zodFail, type FormState } from "@/lib/form-state";

const schema = z.object({
  title: z.string().trim().min(3, "Заголовок: минимум 3 символа").max(200),
  shortText: z.string().trim().min(3, "Укажите краткое описание").max(500),
  content: z.string().trim().min(3, "Укажите текст новости").max(50000),
  publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Некорректная дата").optional().or(z.literal("")),
});

/** Публикация: берём введённую дату, иначе — прежнюю, иначе — сейчас. */
function resolvePublishedAt(isPublished: boolean, date: string | undefined, previous: Date | null): Date | null {
  if (!isPublished) return previous;
  if (date) return new Date(`${date}T09:00:00+03:00`);
  return previous ?? new Date();
}

function revalidateNews(id?: number) {
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
  if (id) revalidatePath(`/news/${id}`);
}

export async function createNews(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { publishedDate, ...data } = parsed.data;
  const isPublished = formData.get("isPublished") === "on";

  const created = await prisma.news.create({
    data: { ...data, isPublished, publishedAt: resolvePublishedAt(isPublished, publishedDate || undefined, null) },
  });
  revalidateNews();
  redirect(`/admin/news/${created.id}`);
}

export async function updateNews(id: number, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const current = await prisma.news.findUnique({ where: { id } });
  if (!current) return { error: "Новость не найдена" };

  const { publishedDate, ...data } = parsed.data;
  const isPublished = formData.get("isPublished") === "on";
  await prisma.news.update({
    where: { id },
    data: { ...data, isPublished, publishedAt: resolvePublishedAt(isPublished, publishedDate || undefined, current.publishedAt) },
  });
  revalidateNews(id);
  return { ok: "Сохранено" };
}

export async function setNewsPublished(id: number, publish: boolean) {
  await requireAdmin();
  const current = await prisma.news.findUnique({ where: { id } });
  if (!current) return;
  await prisma.news.update({
    where: { id },
    data: { isPublished: publish, publishedAt: publish ? (current.publishedAt ?? new Date()) : current.publishedAt },
  });
  revalidateNews(id);
}

export async function deleteNews(id: number) {
  await requireAdmin();
  await prisma.news.deleteMany({ where: { id } });
  revalidateNews(id);
  redirect("/admin/news");
}
