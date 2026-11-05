import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { cardCls } from "@/components/ui";
import { ScheduleView, type ScheduleRow } from "@/components/schedule-view";

export const metadata = { title: "Расписание" };

/** UC-01: ученик видит расписание только своего класса; выбор чужого класса и редактирование недоступны. */
export default async function CabinetSchedulePage() {
  const user = await requireUser(["student"]);
  const link = await prisma.studentClass.findUnique({ where: { studentId: user.id }, include: { class: true } });

  let rows: ScheduleRow[] | null = null; // null — не удалось получить данные (A3)
  if (link) {
    try {
      const entries = await prisma.scheduleEntry.findMany({
        where: { classId: link.classId, academicYear: link.class.academicYear },
        include: { teacher: { select: { fullName: true } } },
        orderBy: [{ dayOfWeek: "asc" }, { lessonNumber: "asc" }],
      });
      rows = entries.map((e) => ({
        id: e.id,
        dayOfWeek: e.dayOfWeek,
        lessonNumber: e.lessonNumber,
        subject: e.subject,
        teacherName: e.teacherName,
        room: e.room,
        teacherLabel: e.teacher?.fullName ?? null,
      }));
    } catch {
      rows = null;
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div>
        <Link href="/cabinet" className="text-sm text-blue-700 hover:underline">← В кабинет</Link>
        <h1 className="mt-2 text-2xl font-bold">Расписание</h1>
      </div>

      {!link && (
        <section className={cardCls}>
          <p className="text-gray-600">Класс не назначен. Обратитесь к администратору.</p>
        </section>
      )}

      {link && rows === null && (
        <section className={cardCls}>
          <p className="text-gray-600">Не удалось получить расписание. Попробуйте ещё раз позже.</p>
        </section>
      )}

      {link && rows !== null && rows.length === 0 && (
        <section className={cardCls}>
          <p className="text-gray-600">Расписание пока не добавлено.</p>
        </section>
      )}

      {link && rows !== null && rows.length > 0 && (
        <>
          <h2 className="text-lg font-semibold">Класс {link.class.name}, {link.class.academicYear} учебный год</h2>
          <ScheduleView rows={rows} />
        </>
      )}
    </main>
  );
}