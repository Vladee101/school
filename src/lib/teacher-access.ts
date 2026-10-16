import "server-only";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";

type Staff = Awaited<ReturnType<typeof requireStaff>>;

/** Панель учителя доступна учителю (свои классы) и администратору (все классы, только просмотр). */
export const requireStaff = () => requireUser(["teacher", "admin"]);

/** Условие выборки классов, доступных пользователю. */
export const classScope = (user: Staff) => (user.role === "admin" ? {} : { teacherId: user.id });

/** Класс, доступный пользователю, иначе 404 (чужой класс неотличим от несуществующего). */
export async function getAccessibleClass(user: Staff, classId: number) {
  if (!Number.isInteger(classId) || classId <= 0) notFound();
  const cls = await prisma.schoolClass.findFirst({ where: { id: classId, ...classScope(user) }, include: { teacher: true } });
  if (!cls) notFound();
  return cls;
}

/** Проверяет, что ученик состоит в доступном пользователю классе. Возвращает ученика и класс. */
export async function getAccessibleStudent(user: Staff, classId: number, studentId: number) {
  const cls = await getAccessibleClass(user, classId);
  if (!Number.isInteger(studentId) || studentId <= 0) notFound();
  const link = await prisma.studentClass.findFirst({ where: { classId: cls.id, studentId }, include: { student: true } });
  if (!link) notFound();
  return { cls, student: link.student };
}
