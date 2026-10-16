import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { btn2Cls, btnCls } from "@/components/ui";
import { setProfessionActive } from "./actions";

export const metadata = { title: "Профессии" };

export default async function ProfessionsPage() {
  await requireAdmin();
  const types = await prisma.orientationType.findMany({
    orderBy: { id: "asc" },
    include: { professions: { orderBy: { name: "asc" } } },
  });

  return (
    <main>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Профессии</h1>
        <div className="flex gap-2">
          <Link href="/admin/professions/types" className={btn2Cls}>Описания типов</Link>
          <Link href="/admin/professions/new" className={btnCls}>Добавить профессию</Link>
        </div>
      </div>

      <div className="space-y-6">
        {types.map((t) => (
          <section key={t.id}>
            <h2 className="mb-2 text-lg font-semibold text-blue-900">{t.name}</h2>
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {t.professions.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <span className={p.isActive ? "font-medium" : "text-gray-400 line-through"}>{p.name}</span>
                  <span className="flex gap-2">
                    <form action={setProfessionActive.bind(null, p.id, !p.isActive)}>
                      <button className={btn2Cls}>{p.isActive ? "Деактивировать" : "Активировать"}</button>
                    </form>
                    <Link href={`/admin/professions/${p.id}`} className={btn2Cls}>Изменить</Link>
                  </span>
                </li>
              ))}
              {t.professions.length === 0 && <li className="p-3 text-sm text-gray-500">Профессий пока нет</li>}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
