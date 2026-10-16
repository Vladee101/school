import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { btn2Cls, btnCls } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { setDocumentPublished } from "./actions";

export const metadata = { title: "Документы (админ)" };

export default async function AdminDocumentsPage() {
  await requireAdmin();
  const docs = await prisma.document.findMany({ orderBy: [{ category: "asc" }, { createdAt: "desc" }] });

  return (
    <main>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Документы</h1>
        <Link href="/admin/documents/new" className={btnCls}>Загрузить документ</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="p-3">Название</th><th className="p-3">Категория</th><th className="p-3">Дата</th><th className="p-3">Статус</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {docs.map((d) => (
              <tr key={d.id}>
                <td className="p-3 font-medium">{d.name}</td>
                <td className="p-3">{d.category}</td>
                <td className="p-3">{d.publishedAt ? formatDate(d.publishedAt) : "—"}</td>
                <td className="p-3">{d.isPublished ? <span className="text-green-700">Опубликован</span> : <span className="text-gray-500">Черновик</span>}</td>
                <td className="flex justify-end gap-2 p-3">
                  <form action={setDocumentPublished.bind(null, d.id, !d.isPublished)}>
                    <button className={btn2Cls}>{d.isPublished ? "Снять" : "Опубликовать"}</button>
                  </form>
                  <Link href={`/admin/documents/${d.id}`} className={btn2Cls}>Изменить</Link>
                </td>
              </tr>
            ))}
            {docs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">Документов нет</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
