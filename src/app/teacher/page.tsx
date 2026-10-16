import Link from "next/link";
import { prisma } from "@/lib/db";
import { cardCls } from "@/components/ui";
import { classScope, requireStaff } from "@/lib/teacher-access";
import { logout } from "../logout-action";

export const metadata = { title: "Панель учителя" };

export default async function TeacherHome() {
  const user = await requireStaff();
  const classes = await prisma.schoolClass.findMany({
    where: classScope(user),
    orderBy: [{ academicYear: "desc" }, { name: "asc" }],
    include: {
      teacher: true,
      students: { select: { student: { select: { _count: { select: { results: true } } } } } },
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{user.role === "admin" ? "Результаты по классам" : "Панель учителя"}</h1>
          <p className="text-sm text-gray-600">{user.fullName}{user.role === "admin" && " · просмотр всех классов"}</p>
        </div>
        <div className="flex gap-4 text-sm">
          {user.role === "admin" && <Link href="/admin" className="text-blue-700 hover:underline">← Администрирование</Link>}
          <form action={logout}><button className="text-blue-700 hover:underline">Выйти</button></form>
        </div>
      </div>

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
