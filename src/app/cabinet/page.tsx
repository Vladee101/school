import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { TYPE_NAMES } from "@/lib/klimov";
import { formatDateTime } from "@/lib/format";
import { cardCls } from "@/components/ui";
import { logout } from "../logout-action";

export const metadata = { title: "Личный кабинет" };

export default async function CabinetPage() {
  const user = await requireUser(["student"]);
  const [studentClass, results] = await Promise.all([
    prisma.studentClass.findUnique({ where: { studentId: user.id }, include: { class: true } }),
    prisma.testResult.findMany({
      where: { studentId: user.id },
      orderBy: { completedAt: "desc" },
      include: { dominant: { include: { type: true } } },
    }),
  ]);
  const last = results[0];
  const dominantNames = (r: (typeof results)[number]) => r.dominant.map((d) => TYPE_NAMES[d.type.code]).join("; ");

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{user.fullName}</h1>
          <p className="text-gray-600">{studentClass ? `Класс ${studentClass.class.name}, ${studentClass.academicYear}` : "Класс не назначен"}</p>
        </div>
        <form action={logout}><button className="text-sm text-blue-700 hover:underline">Выйти</button></form>
      </div>

      <section className={cardCls}>
        <h2 className="text-lg font-semibold">Профориентационный тест</h2>
        {last ? (
          <>
            <p className="mt-1 text-sm text-gray-600">Последнее прохождение: {formatDateTime(last.completedAt)}</p>
            <p className="mt-1">Преобладает: <b>{dominantNames(last)}</b></p>
          </>
        ) : (
          <p className="mt-1 text-gray-600">Вы ещё не проходили тест. Он состоит из 20 пар утверждений, в каждой нужно выбрать один вариант.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/cabinet/test" className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
            {last ? "Пройти тест ещё раз" : "Пройти тест"}
          </Link>
          {last && <Link href={`/cabinet/results/${last.id}`} className="rounded border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50">Открыть результат</Link>}
        </div>
      </section>

      <section className={cardCls}>
        <h2 className="mb-2 text-lg font-semibold">История результатов</h2>
        {results.length === 0 ? (
          <p className="text-sm text-gray-500">Завершённых прохождений пока нет.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {results.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <span className="text-gray-500">{formatDateTime(r.completedAt)}</span>
                  <br />
                  {dominantNames(r)}
                </span>
                <Link href={`/cabinet/results/${r.id}`} className="text-blue-700 hover:underline">Подробнее</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
