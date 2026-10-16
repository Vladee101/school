import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { btnCls } from "@/components/ui";

export const metadata = { title: "Классы" };

export default async function ClassesPage() {
  await requireAdmin();
  const classes = await prisma.schoolClass.findMany({
    orderBy: [{ academicYear: "desc" }, { name: "asc" }],
    include: { teacher: true, _count: { select: { students: true } } },
  });

  return (
    <main>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Классы</h1>
        <Link href="/admin/classes/new" className={btnCls}>Создать класс</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">Класс</th>
              <th className="p-3">Учебный год</th>
              <th className="p-3">Учитель</th>
              <th className="p-3">Учеников</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classes.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.academicYear}</td>
                <td className="p-3">{c.teacher?.fullName ?? <span className="text-gray-500">не назначен</span>}</td>
                <td className="p-3">{c._count.students}</td>
                <td className="p-3 text-right"><Link href={`/admin/classes/${c.id}`} className="text-blue-700 hover:underline">Открыть</Link></td>
              </tr>
            ))}
            {classes.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">Классов нет</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
