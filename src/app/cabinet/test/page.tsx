import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { QUESTION_PROMPT } from "@/lib/klimov-questions";
import { TestForm } from "./test-form";

export const metadata = { title: "Тест Климова" };

export default async function TestPage() {
  await requireUser(["student"]);
  const test = await prisma.test.findUnique({
    where: { type: "klimov_ddo" },
    include: { questions: { orderBy: { questionNumber: "asc" }, select: { questionNumber: true, optionA: true, optionB: true } } },
  });

  if (!test || !test.isActive) {
    return <main className="mx-auto max-w-3xl p-6">Тест временно недоступен.</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/cabinet" className="text-sm text-blue-700 hover:underline">← Личный кабинет</Link>
      <h1 className="mt-2 text-2xl font-bold">Профориентационный тест ДДО Климова</h1>
      <div className="my-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">
        <p>
          Предположим, что после соответствующего обучения вы сможете выполнять любую работу. Если бы вам пришлось выбирать
          только из двух возможностей, что бы вы предпочли? В каждой паре выберите один вариант — <b>А</b> или <b>Б</b>.
        </p>
        <p className="mt-2 text-gray-600">
          Ответы сохраняются только после завершения теста. Если закрыть страницу раньше, придётся начать заново.
        </p>
      </div>
      <TestForm prompt={QUESTION_PROMPT} questions={test.questions} />
    </main>
  );
}
