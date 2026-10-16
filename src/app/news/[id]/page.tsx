import Link from "next/link";
import { notFound } from "next/navigation";
import { newsById } from "@/lib/public-data";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/news/[id]">) {
  const id = Number((await params).id);
  const item = Number.isInteger(id) && id > 0 ? await newsById(id) : null;
  return { title: item?.title ?? "Новость" };
}

export default async function NewsItemPage({ params }: PageProps<"/news/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const item = await newsById(id);
  if (!item) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/news" className="text-sm text-blue-700 hover:underline">← Все новости</Link>
      <article className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
        <time className="text-sm text-gray-500">{item.publishedAt && formatDate(item.publishedAt)}</time>
        <h1 className="mt-1 text-3xl font-bold">{item.title}</h1>
        {/* Текст выводится как обычный текст (React экранирует), переносы строк сохраняются */}
        <div className="mt-4 whitespace-pre-line text-gray-800">{item.content}</div>
      </article>
    </main>
  );
}
