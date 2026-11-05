import Link from "next/link";
import { prisma } from "@/lib/db";
import { cardCls } from "@/components/ui";
import { classScope, requireStaff } from "@/lib/teacher-access";
import { ScheduleView, type ScheduleRow } from "@/components/schedule-view";
import { moscowToday } from "@/lib/schedule";
import { logout } from "../logout-action";

export const metadata = { title: "Панель учителя" };

export default async function TeacherHome({ searchParams }: PageProps<"/teacher">) {
  const user = await requireStaff();
  const sp = await searchParams;
  const view = { day: typeof sp.day === "string" ? sp.day : undefined, week: typeof sp.week === "string" ? sp.week : undefined };
  const today = moscowToday();
  const classes = await prisma.schoolClass.findMany({
    where: classScope(user),
    orderBy: [{ academicYear: "desc" }, { name: "asc" }],
    include: {
      teacher: true,
      students: { select: { student: { select: { _count: { select: { results: true } } } } } },
    },
  });

  let scheduleRows: ScheduleRow[] | null = null; // null — не удалось получить данные (UC-02 A2)
  if (user.role === "teacher") {
    try {
      const entries = await prisma.scheduleEntry.findMany({
        where: { teacherId: user.id },
        include: { class: { select: { name: true, academicYear: true } } },
        orderBy: [{ dayOfWeek: "asc" }, { lessonNumber: "asc" }],
      });
      scheduleRows = entries.map((e) => ({
        id: e.id,
        dayOfWeek: e.dayOfWeek,
        lessonNumber: e.lessonNumber,
        subject: e.subject,
        teacherName: e.teacherName,
        room: e.room,
        classLabel: e.class.name,
      }));
    } catch {
      scheduleRows = null;
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{user.role === "admin" ? "Результаты по классам" : "Панель учителя"}</h1>
          <p className="text-sm text-gray-600">{user.fullName}{user.role === "admin" && " · просмотр всех классов"}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {user.role === "teacher" && classes.length > 0 && <Link href="/teacher/my-class" className="text-blue-700 hover:underline">Расписание моего класса</Link>}
          {user.role === "admin" && <Link href="/admin" className="text-blue-700 hover:underline">← Администрирование</Link>}
          <form action={logout}><button className="text-blue-700 hover:underline">Выйти</button></form>
        </div>
      </div>

      {user.role === "teacher" && (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Расписание на неделю</h2>
          {scheduleRows === null && (
            <div className={cardCls}>
              <p className="text-gray-600">Не удалось получить расписание. Попробуйте ещё раз позже.</p>
            </div>
          )}
          {scheduleRows !== null && scheduleRows.length === 0 && (
            <div className={cardCls}>
              <p className="text-gray-600">Занятия не назначены.</p>
            </div>
          )}
          {scheduleRows !== null && scheduleRows.length > 0 && (
            <ScheduleView
              rows={scheduleRows}
              basePath="/teacher"
              subtitle="Мои уроки"
              showTeacher={false}
              showClass
              params={view}
              todayIso={today}
            />
          )}
        </section>
      )}

      {classes.length === 0 ? (
        <p className="text-gray-600">Вам пока не назначены классы. Обратитесь к администратору.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {classes.map((c) => {
            const total = c.students.length;
            const passed = c.students.filter((s) => s.student._count.results > 0).length;
            return (
              <Link key={c.id} href={`/teacher/classes/${c.id}`} className={`${cardCls} hover:border-blue-400`}>
                <h2 className="text-xl font-semibold text-blue-900">Класс {c.name}</h2>
                <p className="text-sm text-gray-500">{c.academicYear}{user.role === "admin" && ` · ${c.teacher?.fullName ?? "учитель не назначен"}`}</p>
                <p className="mt-3 text-sm">Учеников: <b>{total}</b> · прошли тест: <b>{passed}</b></p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
