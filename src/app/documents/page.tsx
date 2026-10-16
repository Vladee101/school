import { publishedDocuments } from "@/lib/public-data";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Документы" };

export default async function DocumentsPage() {
  const docs = await publishedDocuments();
  const byCategory = new Map<string, typeof docs>();
  for (const d of docs) byCategory.set(d.category, [...(byCategory.get(d.category) ?? []), d]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Документы</h1>
      {docs.length === 0 && <p className="text-gray-600">Документов пока нет.</p>}
      {[...byCategory].map(([category, items]) => (
        <section key={category} className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-blue-900">{category}</h2>
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {items.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-sm text-gray-500">{d.publishedAt && formatDate(d.publishedAt)} · PDF</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <a href={d.filePath} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Открыть</a>
                  <a href={d.filePath} download className="text-blue-700 hover:underline">Скачать</a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
