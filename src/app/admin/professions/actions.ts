"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { zodFail, type FormState } from "@/lib/form-state";

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());

const professionSchema = z.object({
  subjects: optionalText(500),
  howToExplore: optionalText(1000),
  name: z.string().trim().min(2, "Укажите название профессии").max(150),
  description: z.string().trim().min(3, "Укажите описание").max(5000),
  typeId: z.coerce.number().int().positive("Выберите тип направленности"),
});

const typeSchema = z.object({
  description: z.string().trim().min(3, "Укажите описание").max(5000),
});

function revalidateAll() {
  revalidatePath("/admin/professions");
  revalidatePath("/admin/professions/types");
}

export async function createProfession(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = professionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  if (!(await prisma.orientationType.findUnique({ where: { id: parsed.data.typeId } }))) return { error: "Тип не найден", field: "typeId" };

  await prisma.profession.create({ data: { ...parsed.data, subjects: parsed.data.subjects ?? null, howToExplore: parsed.data.howToExplore ?? null, isActive: formData.get("isActive") === "on" } });
  revalidateAll();
  redirect("/admin/professions");
}

export async function updateProfession(id: number, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = professionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  if (!(await prisma.profession.findUnique({ where: { id } }))) return { error: "Профессия не найдена" };
  if (!(await prisma.orientationType.findUnique({ where: { id: parsed.data.typeId } }))) return { error: "Тип не найден", field: "typeId" };

  await prisma.profession.update({ where: { id }, data: { ...parsed.data, subjects: parsed.data.subjects ?? null, howToExplore: parsed.data.howToExplore ?? null, isActive: formData.get("isActive") === "on" } });
  revalidateAll();
  return { ok: "Сохранено" };
}

export async function setProfessionActive(id: number, active: boolean) {
  await requireAdmin();
  await prisma.profession.updateMany({ where: { id }, data: { isActive: active } });
  revalidateAll();
}

export async function updateOrientationType(id: number, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = typeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  if (!(await prisma.orientationType.findUnique({ where: { id } }))) return { error: "Тип не найден" };

  await prisma.orientationType.update({ where: { id }, data: { description: parsed.data.description } });
  revalidateAll();
  return { ok: "Сохранено" };
}
