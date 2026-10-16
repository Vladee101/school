"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { zodFail, type FormState } from "@/lib/form-state";

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());

const schema = z.object({
  dayOfWeek: z.coerce.number().int().min(1, "Выберите день").max(7),
  lessonNumber: z.coerce.number().int().min(1, "Номер урока от 1 до 12").max(12, "Номер урока от 1 до 12"),
  subject: z.string().trim().min(2, "Укажите предмет").max(100),
  teacherName: optionalText(100),
  room: optionalText(20),
});

function revalidateSchedule(classId: number) {
  revalidatePath(`/admin/classes/${classId}/schedule`);
  revalidatePath("/schedule");
}

export async function addLesson(classId: number, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);

  const cls = await prisma.schoolClass.findUnique({ where: { id: classId } });
  if (!cls) return { error: "Класс не найден" };

  const duplicate = await prisma.scheduleEntry.findFirst({
    where: { classId, academicYear: cls.academicYear, dayOfWeek: parsed.data.dayOfWeek, lessonNumber: parsed.data.lessonNumber },
  });
  if (duplicate) return { error: `На этот день уже есть урок №${parsed.data.lessonNumber} (${duplicate.subject}). Сначала удалите его.`, field: "lessonNumber" };

  await prisma.scheduleEntry.create({
    data: { ...parsed.data, teacherName: parsed.data.teacherName ?? null, room: parsed.data.room ?? null, classId, academicYear: cls.academicYear },
  });
  revalidateSchedule(classId);
  return { ok: "Урок добавлен" };
}

export async function deleteLesson(classId: number, entryId: number) {
  await requireAdmin();
  await prisma.scheduleEntry.deleteMany({ where: { id: entryId, classId } });
  revalidateSchedule(classId);
}

/** Копирует всё расписание другого класса того же учебного года (заменяя текущее). */
export async function copySchedule(classId: number, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const sourceId = Number(formData.get("sourceId"));
  if (!Number.isInteger(sourceId) || sourceId <= 0 || sourceId === classId) return { error: "Выберите другой класс", field: "sourceId" };

  const [target, source] = await Promise.all([
    prisma.schoolClass.findUnique({ where: { id: classId } }),
    prisma.schoolClass.findUnique({ where: { id: sourceId } }),
  ]);
  if (!target || !source) return { error: "Класс не найден" };

  const lessons = await prisma.scheduleEntry.findMany({ where: { classId: sourceId, academicYear: source.academicYear } });
  if (lessons.length === 0) return { error: "У выбранного класса нет расписания" };

  await prisma.$transaction([
    prisma.scheduleEntry.deleteMany({ where: { classId, academicYear: target.academicYear } }),
    prisma.scheduleEntry.createMany({
      data: lessons.map((l) => ({
        classId, academicYear: target.academicYear, dayOfWeek: l.dayOfWeek, lessonNumber: l.lessonNumber,
        subject: l.subject, teacherName: l.teacherName, room: l.room,
      })),
    }),
  ]);
  revalidateSchedule(classId);
  return { ok: `Скопировано уроков: ${lessons.length}` };
}
