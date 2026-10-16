import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { btn2Cls, btnCls } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { setNewsPublished } from "./actions";

export const metadata = { title: "Новости (админ)" };

export default async function AdminNewsPage() {
  await requireAdmin();
  const news = await prisma.news.findMany({ orderBy: [{ createdAt: "desc" }] });

  return (
    <main>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Новости</h1>
        <Link href="/admin/news/new" className={btnCls}>Создать новость</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="p-3">Заголовок</th><th className="p-3">Дата</th><th className="p-3">Статус</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {news.map((n) => (
              <tr key={n.id}>
                <td className="p-3 font-medium">{n.title}</td>
                <td className="p-3">{n.publishedAt ? formatDate(n.publishedAt) : "—"}</td>
                <td className="p-3">{n.isPublished ? <span className="text-green-700">Опубликована</span> : <span className="text-gray-500">Черновик</span>}</td>
                <td className="flex justify-end gap-2 p-3">
                  <form action={setNewsPublished.bind(null, n.id, !n.isPublished)}>
                    <button className={btn2Cls}>{n.isPublished ? "Снять" : "Опубликовать"}</button>
                  </form>
                  <Link href={`/admin/news/${n.id}`} className={btn2Cls}>Изменить</Link>
                </td>
              </tr>
            ))}
            {news.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-500">Новостей нет</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
