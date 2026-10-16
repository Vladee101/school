import Link from "next/link";
import { prisma } from "@/lib/db";
import { cardCls, inputCls } from "@/components/ui";
import { TYPE_CODES, TYPE_NAMES, type TypeCode } from "@/lib/klimov";
import { isTypeCode } from "@/lib/results";
import { formatShortDate } from "@/lib/format";
import { getAccessibleClass, requireStaff } from "@/lib/teacher-access";

export const metadata = { title: "Класс" };

export default async function TeacherClassPage({ params, searchParams }: PageProps<"/teacher/classes/[id]">) {
  const user = await requireStaff();
  const cls = await getAccessibleClass(user, Number((await params).id));

  const links = await prisma.studentClass.findMany({
    where: { classId: cls.id },
    include: {
      student: {
        include: {
          // Только последний завершённый результат (ТЗ FT-5.3)
          results: { orderBy: { completedAt: "desc" }, take: 1, include: { dominant: { include: { type: true } } } },
          _count: { select: { results: true } },
        },
      },
    },
  });

  const rows = links
    .map(({ student: s }) => ({
      id: s.id,
      name: s.fullName,
      attempts: s._count.results,
      last: s.results[0] ?? null,
      types: (s.results[0]?.dominant.map((d) => d.type.code).filter(isTypeCode) ?? []) as TypeCode[],
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));

  const total = rows.length;
  const passed = rows.filter((r) => r.last).length;
  const distribution = Object.fromEntries(TYPE_CODES.map((c) => [c, rows.filter((r) => r.types.includes(c)).length])) as Record<TypeCode, number>;

  const rawType = (await searchParams).type;
  const filter = typeof rawType === "string" && (rawType === "none" || isTypeCode(rawType)) ? rawType : undefined;
  const visible = !filter ? rows : filter === "none" ? rows.filter((r) => !r.last) : rows.filter((r) => r.types.includes(filter as TypeCode));

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div>
        <Link href="/teacher" className="text-sm text-blue-700 hover:underline">← Классы</Link>
        <h1 className="mt-2 text-2xl font-bold">Класс {cls.name}, {cls.academicYear}</h1>
      </div>

      <section className={cardCls}>
        <h2 className="mb-3 text-lg font-semibold">Сводка</h2>
        <dl className="mb-5 grid grid-cols-3 gap-3 text-center">
          <div><dt className="text-xs text-gray-500">Учеников</dt><dd className="text-2xl font-bold text-blue-900">{total}</dd></div>
          <div><dt className="text-xs text-gray-500">Прошли тест</dt><dd className="text-2xl font-bold text-emerald-700">{passed}</dd></div>
          <div><dt className="text-xs text-gray-500">Без результата</dt><dd className="text-2xl font-bold text-gray-700">{total - passed}</dd></div>
        </dl>
        <h3 className="mb-2 text-sm font-semibold">Распределение по типам (последний результат)</h3>
        <ul className="space-y-2">
          {TYPE_CODES.map((c) => (
            <li key={c}>
              <div className="mb-1 flex justify-between text-sm"><span>{TYPE_NAMES[c]}</span><span className="tabular-nums">{distribution[c]}</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-200" role="img" aria-label={`${TYPE_NAMES[c]}: ${distribution[c]} учеников`}>
                <div className="h-full bg-blue-500" style={{ width: passed ? `${(distribution[c] / passed) * 100}%` : "0%" }} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-gray-500">Ученик с несколькими преобладающими типами учитывается в каждом из них.</p>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">Ученики ({visible.length})</h2>
          <form className="flex items-end gap-2 text-sm">
            <label className="flex flex-col gap-1">
              Фильтр по типу
              <select name="type" defaultValue={filter ?? ""} className={`${inputCls} min-w-56`}>
                <option value="">Все ученики</option>
                {TYPE_CODES.map((c) => <option key={c} value={c}>{TYPE_NAMES[c]}</option>)}
                <option value="none">Не проходили тест</option>
              </select>
            </label>
            <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Применить</button>
            {filter && <Link href={`/teacher/classes/${cls.id}`} className="py-2 text-blue-700 hover:underline">Сбросить</Link>}
          </form>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr><th className="p-3">ФИО</th><th className="p-3">Статус</th><th className="p-3">Последнее прохождение</th><th className="p-3">Преобладает</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3">{r.last ? <span className="text-green-700">Прошёл{r.attempts > 1 && ` (${r.attempts})`}</span> : <span className="text-gray-500">Не проходил</span>}</td>
                  <td className="p-3">{r.last ? formatShortDate(r.last.completedAt) : "—"}</td>
                  <td className="p-3">{r.types.length ? r.types.map((c) => TYPE_NAMES[c]).join("; ") : "—"}</td>
                  <td className="p-3 text-right"><Link href={`/teacher/classes/${cls.id}/students/${r.id}`} className="text-blue-700 hover:underline">История</Link></td>
                </tr>
              ))}
              {visible.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">Нет учеников по выбранному условию</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
