"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { QUESTION_COUNT, scoreAnswers, type Option } from "@/lib/klimov";
import { scoreColumns } from "@/lib/results";

export type SubmitState = { error?: string } | undefined;

/**
 * Единственное место, где создаётся результат теста.
 * Баллы считаются на сервере; результат и все 20 ответов сохраняются атомарно.
 */
export async function submitTest(_: SubmitState, formData: FormData): Promise<SubmitState> {
  const user = await requireUser(["student"]);

  const answers: Record<number, Option> = {};
  for (let n = 1; n <= QUESTION_COUNT; n++) {
    const v = formData.get(`q${n}`);
    if (v !== "A" && v !== "B") return { error: `Не отвечен вопрос ${n}. Ответьте на все 20 вопросов.` };
    answers[n] = v;
  }

  const { scores, dominant } = scoreAnswers(answers);

  const test = await prisma.test.findUnique({
    where: { type: "klimov_ddo" },
    include: { questions: { select: { id: true, questionNumber: true } } },
  });
  if (!test || !test.isActive || test.questions.length !== QUESTION_COUNT) return { error: "Тест временно недоступен" };
  const questionId = new Map(test.questions.map((q) => [q.questionNumber, q.id]));

  const types = await prisma.orientationType.findMany({ where: { code: { in: dominant } }, select: { id: true } });
  if (types.length !== dominant.length) return { error: "Справочник типов заполнен неполно" };

  const result = await prisma.testResult.create({
    data: {
      studentId: user.id,
      testId: test.id,
      ...scoreColumns(scores),
      answers: {
        create: Array.from({ length: QUESTION_COUNT }, (_, i) => ({
          questionId: questionId.get(i + 1)!,
          chosenOption: answers[i + 1],
        })),
      },
      dominant: { create: types.map((t) => ({ typeId: t.id })) },
    },
    select: { id: true },
  });

  revalidatePath("/cabinet");
  redirect(`/cabinet/results/${result.id}`);
}
