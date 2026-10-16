import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { cardCls } from "@/components/ui";

export const metadata = { title: "Администрирование" };

export default async function AdminHome() {
  await requireAdmin();
  const [students, teachers, classes, news, docs, results] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "teacher" } }),
    prisma.schoolClass.count(),
    prisma.news.count(),
    prisma.document.count(),
    prisma.testResult.count(),
  ]);
  const stats = [
    ["Ученики", students, "/admin/users?role=student"],
    ["Учителя", teachers, "/admin/users?role=teacher"],
    ["Классы", classes, "/admin/classes"],
    ["Новости", news, "/admin/news"],
    ["Документы", docs, "/admin/documents"],
    ["Результаты тестов", results, null],
  ] as const;

  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Администрирование</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([label, n, href]) => {
          const body = (
            <>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-3xl font-bold text-blue-900">{n}</p>
            </>
          );
          return href ? (
            <Link key={label} href={href} className={`${cardCls} hover:border-blue-400`}>{body}</Link>
          ) : (
            <div key={label} className={cardCls}>{body}</div>
          );
        })}
      </div>
    </main>
  );
}
