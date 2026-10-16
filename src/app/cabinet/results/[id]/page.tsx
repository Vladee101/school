import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { loadResultView } from "@/lib/result-view";
import { ResultDetails } from "@/components/result-details";

export const metadata = { title: "Результат теста" };

export default async function ResultPage({ params }: PageProps<"/cabinet/results/[id]">) {
  const user = await requireUser(["student"]);
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  // studentId в фильтре: чужой результат неотличим от несуществующего (404).
  const result = await loadResultView(id, user.id);
  if (!result) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/cabinet" className="text-sm text-blue-700 hover:underline">← Личный кабинет</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Результат теста Климова</h1>
      <ResultDetails result={result} />
      <div className="mt-6">
        <Link href="/cabinet/test" className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Пройти тест ещё раз</Link>
      </div>
    </main>
  );
}
