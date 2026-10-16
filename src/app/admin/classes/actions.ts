"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import type { FormState } from "@/components/action-form";

const optionalId = z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().positive().optional());

const classSchema = z.object({
  name: z.string().trim().min(1, "Укажите название класса").max(20),
  academicYear: z.string().trim().regex(/^\d{4}\/\d{4}$/, "Учебный год в формате 2026/2027"),
  teacherId: optionalId,
});

async function checkTeacher(teacherId: number | undefined) {
  if (!teacherId) return true;
  const t = await prisma.user.findUnique({ where: { id: teacherId } });
  return !!t && t.role === "teacher" && t.isActive;
}

const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === "P2002";

export async function createClass(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = classSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await checkTeacher(parsed.data.teacherId))) return { error: "Учитель не найден или отключён" };

  let id: number;
  try {
    id = (await prisma.schoolClass.create({ data: { ...parsed.data, teacherId: parsed.data.teacherId ?? null } })).id;
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "Такой класс в этом учебном году уже существует" };
    throw e;
  }
  revalidatePath("/admin/classes");
  redirect(`/admin/classes/${id}`);
}

export async function updateClass(id: number, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = classSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await checkTeacher(parsed.data.teacherId))) return { error: "Учитель не найден или отключён" };

  const current = await prisma.schoolClass.findUnique({ where: { id } });
  if (!current) return { error: "Класс не найден" };

  try {
    await prisma.$transaction([
      prisma.schoolClass.update({ where: { id }, data: { ...parsed.data, teacherId: parsed.data.teacherId ?? null } }),
      // год класса и год в связях учеников должны совпадать
      prisma.studentClass.updateMany({ where: { classId: id }, data: { academicYear: parsed.data.academicYear } }),
    ]);
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "Такой класс в этом учебном году уже существует" };
    throw e;
  }
  revalidatePath("/admin/classes");
  return { ok: "Сохранено" };
}

export async function addStudent(classId: number, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const studentId = Number(formData.get("studentId"));
  if (!Number.isInteger(studentId) || studentId <= 0) return { error: "Выберите ученика" };

  const [cls, student] = await Promise.all([
    prisma.schoolClass.findUnique({ where: { id: classId } }),
    prisma.user.findUnique({ where: { id: studentId } }),
  ]);
  if (!cls) return { error: "Класс не найден" };
  if (!student || student.role !== "student") return { error: "Ученик не найден" };

  await prisma.studentClass.upsert({
    where: { studentId },
    update: { classId, academicYear: cls.academicYear },
    create: { studentId, classId, academicYear: cls.academicYear },
  });
  revalidatePath(`/admin/classes/${classId}`);
  return { ok: "Ученик добавлен" };
}

export async function removeStudent(classId: number, studentId: number) {
  await requireAdmin();
  await prisma.studentClass.deleteMany({ where: { classId, studentId } });
  revalidatePath(`/admin/classes/${classId}`);
}
