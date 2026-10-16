import Link from "next/link";
import { prisma } from "@/lib/db";
import { cardCls } from "@/components/ui";
import { TYPE_NAMES } from "@/lib/klimov";
import { formatDateTime } from "@/lib/format";
import { getAccessibleStudent, requireStaff } from "@/lib/teacher-access";

export const metadata = { title: "История ученика" };

export default async function StudentHistoryPage({ params }: PageProps<"/teacher/classes/[id]/students/[studentId]">) {
  const user = await requireStaff();
  const p = await params;
  const { cls, student } = await getAccessibleStudent(user, Number(p.id), Number(p.studentId));

  const results = await prisma.testResult.findMany({
    where: { studentId: student.id },
    orderBy: { completedAt: "desc" },
    include: { dominant: { include: { type: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <div>
        <Link href={`/teacher/classes/${cls.id}`} className="text-sm text-blue-700 hover:underline">← Класс {cls.name}</Link>
        <h1 className="mt-2 text-2xl font-bold">{student.fullName}</h1>
        <p className="text-gray-600">Завершённых прохождений: {results.length}</p>
      </div>
      <section className={cardCls}>
        {results.length === 0 ? (
          <p className="text-gray-500">Ученик ещё не проходил тест.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {results.map((r, i) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  <span className="text-sm text-gray-500">{formatDateTime(r.completedAt)}{i === 0 && " · последний"}</span>
                  <br />
                  {r.dominant.map((d) => TYPE_NAMES[d.type.code]).join("; ")}
                </span>
                <Link href={`/teacher/results/${r.id}`} className="text-blue-700 hover:underline">Подробнее</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
