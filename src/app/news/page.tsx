import Link from "next/link";
import { newsPage } from "@/lib/public-data";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Новости" };

export default async function NewsPage({ searchParams }: PageProps<"/news">) {
  const raw = Number((await searchParams).page);
  const page = Number.isInteger(raw) && raw > 0 ? raw : 1;
  const { items, totalPages } = await newsPage(page);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Новости</h1>
      {items.length === 0 ? (
        <p className="text-gray-600">Новостей пока нет.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((n) => (
            <li key={n.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <time className="text-sm text-gray-500">{n.publishedAt && formatDate(n.publishedAt)}</time>
              <h2 className="text-lg font-semibold">
                <Link href={`/news/${n.id}`} className="text-blue-800 hover:underline">{n.title}</Link>
              </h2>
              <p className="text-gray-700">{n.shortText}</p>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Страницы">
          {page > 1 ? <Link href={`/news?page=${page - 1}`} className="text-blue-700 hover:underline">← Новее</Link> : <span />}
          <span className="text-gray-500">Страница {page} из {totalPages}</span>
          {page < totalPages ? <Link href={`/news?page=${page + 1}`} className="text-blue-700 hover:underline">Старее →</Link> : <span />}
        </nav>
      )}
    </main>
  );
}
