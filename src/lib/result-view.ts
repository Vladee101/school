import { prisma } from "@/lib/db";
import { scoresOf, isTypeCode } from "@/lib/results";
import type { TypeCode } from "@/lib/klimov";

/** Данные для показа результата: баллы, доминирующие типы с описанием и рекомендуемые профессии. */
export async function loadResultView(resultId: number, studentId?: number) {
  const result = await prisma.testResult.findFirst({
    where: { id: resultId, ...(studentId ? { studentId } : {}) },
    include: {
      student: { select: { id: true, fullName: true } },
      dominant: { include: { type: { include: { professions: { where: { isActive: true }, orderBy: { name: "asc" } } } } }, orderBy: { typeId: "asc" } },
    },
  });
  if (!result) return null;

  return {
    id: result.id,
    student: result.student,
    completedAt: result.completedAt,
    scores: scoresOf(result),
    dominant: result.dominant.map((d) => d.type.code).filter(isTypeCode) as TypeCode[],
    types: result.dominant.map((d) => ({
      code: d.type.code,
      name: d.type.name,
      description: d.type.description,
      isActive: d.type.isActive,
      professions: d.type.professions,
    })),
  };
}

export type ResultView = NonNullable<Awaited<ReturnType<typeof loadResultView>>>;
