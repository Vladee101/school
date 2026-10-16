"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { hashPassword, passwordSchema } from "@/lib/password";
import { destroyAllSessions } from "@/lib/session";
import type { FormState } from "@/components/action-form";

const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === "P2002";

const optionalId = z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().positive().optional());
const optionalEmail = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().email("Некорректный email").max(120).optional());

const baseFields = {
  fullName: z.string().trim().min(2, "Укажите ФИО").max(120),
  email: optionalEmail,
};

const createSchema = z
  .object({
    ...baseFields,
    login: z.string().trim().min(3, "Логин: минимум 3 символа").max(32).regex(/^[A-Za-z0-9._-]+$/, "Логин: латиница, цифры, . _ -"),
    password: passwordSchema,
    role: z.enum(["student", "teacher", "admin"]),
    classId: optionalId,
  })
  .refine((v) => v.role !== "student" || v.classId, { message: "Для ученика выберите класс", path: ["classId"] });

export async function createUser(_: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { classId, password, role, ...rest } = parsed.data;

  let classRow = null;
  if (role === "student") {
    classRow = await prisma.schoolClass.findUnique({ where: { id: classId! } });
    if (!classRow) return { error: "Класс не найден" };
  }

  try {
    await prisma.user.create({
      data: {
        ...rest,
        role,
        passwordHash: await hashPassword(password),
        mustChangePassword: true,
        createdById: admin.id,
        studentClass: classRow ? { create: { classId: classRow.id, academicYear: classRow.academicYear } } : undefined,
      },
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "Такой логин уже занят" };
    throw e;
  }
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

const updateSchema = z.object({ ...baseFields, classId: optionalId });

export async function updateUser(id: number, _: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: "Пользователь не найден" };

  const isActive = formData.get("isActive") === "on";
  if (!isActive && user.id === admin.id) return { error: "Нельзя деактивировать собственную учётную запись" };

  let classRow = null;
  if (user.role === "student") {
    if (!parsed.data.classId) return { error: "Для ученика выберите класс" };
    classRow = await prisma.schoolClass.findUnique({ where: { id: parsed.data.classId } });
    if (!classRow) return { error: "Класс не найден" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { fullName: parsed.data.fullName, email: parsed.data.email ?? null, isActive } });
    if (classRow) {
      await tx.studentClass.upsert({
        where: { studentId: id },
        update: { classId: classRow.id, academicYear: classRow.academicYear },
        create: { studentId: id, classId: classRow.id, academicYear: classRow.academicYear },
      });
    }
  });
  if (!isActive) await destroyAllSessions(id);

  revalidatePath("/admin/users");
  return { ok: "Сохранено" };
}

export async function resetPassword(id: number, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: "Пользователь не найден" };

  await prisma.user.update({ where: { id }, data: { passwordHash: await hashPassword(parsed.data), mustChangePassword: true } });
  await destroyAllSessions(id);
  return { ok: "Временный пароль задан, при следующем входе потребуется смена" };
}

/**
 * Удаление разрешено только пользователю без результатов тестов (иначе теряется история) и не себе.
 * Классы удаляемого учителя остаются без учителя, сессии и членство в классе удаляются каскадно.
 */
export async function deleteUser(id: number) {
  const admin = await requireAdmin();
  if (id === admin.id) return;

  const user = await prisma.user.findUnique({ where: { id }, include: { _count: { select: { results: true } } } });
  if (!user || user._count.results > 0) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  revalidatePath("/admin/classes");
  redirect("/admin/users");
}
