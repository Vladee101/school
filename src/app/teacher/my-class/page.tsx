import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { btnCls, cardCls, inputCls } from "@/components/ui";
import { ScheduleView, type ScheduleRow } from "@/components/schedule-view";

export const metadata = { title: "Расписание моего класса" };

/**
 * UC-03: классный руководитель видит полное расписание закреплённого класса,
 * включая уроки других преподавателей. У учителя без назначения ссылка скрыта,
 * прямой запрос отклоняется (404).
 */
export default async function MyClassSchedulePage({ searchParams }: PageProps<"/teacher/my-class">) {
  const user = await requireUser(["teacher"]);
  const supervised = await prisma.schoolClass.findMany({
    where: { teacherId: user.id },
    orderBy: [{ academicYear: "desc" }, { name: "asc" }],
  });
  if (supervised.length === 0) notFound();

  const raw = (await searchParams).class;
  const requested = Number(Array.isArray(raw) ? raw[0] : raw);
  const selected = supervised.find((c) => c.id === requested) ?? supervised[0];

  let rows: ScheduleRow[] | null = null; // null — не удалось получить данные (A3)
  try {
    const entries = await prisma.scheduleEntry.findMany({
      where: { classId: selected.id, academicYear: selected.academicYear },
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

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div>
        <Link href="/teacher/schedule" className="text-sm text-blue-700 hover:underline">← Моё расписание</Link>
        <h1 className="mt-2 text-2xl font-bold">Расписание моего класса</h1>
      </div>

      {supervised.length > 1 && (
        <form className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Класс
            <select name="class" defaultValue={selected.id} className={inputCls}>
              {supervised.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.academicYear})</option>
              ))}
            </select>
          </label>
          <button className={btnCls}>Показать</button>
        </form>
      )}

      {rows === null && (
        <section className={cardCls}>
          <p className="text-gray-600">Не удалось получить расписание. Попробуйте ещё раз позже.</p>
        </section>
      )}

      {rows !== null && rows.length === 0 && (
        <section className={cardCls}>
          <p className="text-gray-600">Расписание пока не добавлено.</p>
        </section>
      )}

      {rows !== null && rows.length > 0 && (
        <>
          <h2 className="text-lg font-semibold">Класс {selected.name}, {selected.academicYear} учебный год</h2>
          <ScheduleView rows={rows} />
        </>
      )}
    </main>
  );
}