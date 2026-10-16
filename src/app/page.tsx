import Link from "next/link";
import { latestNews } from "@/lib/public-data";
import { formatDate } from "@/lib/format";
import { SCHOOL } from "@/lib/school";

const CARDS = [
  { href: "/news", title: "Новости", text: "Что происходит в школе" },
  { href: "/documents", title: "Документы", text: "Уставные и учебные документы в PDF" },
  { href: "/schedule", title: "Расписание", text: "Уроки по классам" },
  { href: "/login", title: "Профориентация", text: "Тест Климова для учеников" },
];

export default async function HomePage() {
  const news = await latestNews(3);
  return (
    <>
      <section className="bg-gradient-to-br from-blue-900 to-blue-600 px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold md:text-4xl">{SCHOOL.name}</h1>
          <p className="mt-3 max-w-2xl text-lg opacity-90">{SCHOOL.description}</p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => (
            <Link key={c.href} href={c.href} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-400">
              <h2 className="font-semibold text-blue-900">{c.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{c.text}</p>
            </Link>
          ))}
        </div>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">Последние новости</h2>
            <Link href="/news" className="text-sm text-blue-700 hover:underline">Все новости</Link>
          </div>
          {news.length === 0 ? (
            <p className="text-gray-600">Новостей пока нет.</p>
          ) : (
            <ul className="space-y-3">
              {news.map((n) => (
                <li key={n.id} className="rounded-xl border border-gray-200 bg-white p-5">
                  <time className="text-sm text-gray-500">{n.publishedAt && formatDate(n.publishedAt)}</time>
                  <h3 className="font-semibold">
                    <Link href={`/news/${n.id}`} className="text-blue-800 hover:underline">{n.title}</Link>
                  </h3>
                  <p className="text-gray-700">{n.shortText}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
