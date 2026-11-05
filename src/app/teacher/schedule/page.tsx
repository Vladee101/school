import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { cardCls } from "@/components/ui";
import { ScheduleView, type ScheduleRow } from "@/components/schedule-view";

export const metadata = { title: "Моё расписание" };

/** UC-02: учитель видит только уроки, где он назначен преподавателем; редактирование недоступно. */
export default async function TeacherSchedulePage() {
  const user = await requireUser(["teacher"]);

  let rows: ScheduleRow[] | null = null; // null — не удалось получить данные (A2)
  try {
    const entries = await prisma.scheduleEntry.findMany({
      where: { teacherId: user.id },
      include: { class: { select: { name: true, academicYear: true } } },
      orderBy: [{ dayOfWeek: "asc" }, { lessonNumber: "asc" }],
    });
    rows = entries.map((e) => ({
      id: e.id,
      dayOfWeek: e.dayOfWeek,
      lessonNumber: e.lessonNumber,
      subject: e.subject,
      teacherName: e.teacherName,
      room: e.room,
      classLabel: e.class.name,
    }));
  } catch {
    rows = null;
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div>
        <Link href="/teacher" className="text-sm text-blue-700 hover:underline">← Панель учителя</Link>
        <h1 className="mt-2 text-2xl font-bold">Моё расписание</h1>
      </div>

      {rows === null && (
        <section className={cardCls}>
          <p className="text-gray-600">Не удалось получить расписание. Попробуйте ещё раз позже.</p>
        </section>
      )}

      {rows !== null && rows.length === 0 && (
        <section className={cardCls}>
          <p className="text-gray-600">Занятия не назначены.</p>
        </section>
      )}

      {rows !== null && rows.length > 0 && <ScheduleView rows={rows} showTeacher={false} showClass />}
    </main>
  );
}