import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ResultDetails } from "@/components/result-details";
import { loadResultView } from "@/lib/result-view";
import { requireStaff } from "@/lib/teacher-access";

export const metadata = { title: "Результат ученика" };

export default async function TeacherResultPage({ params }: PageProps<"/teacher/results/[id]">) {
  const user = await requireStaff();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  // Доступ: результат ученика из класса этого учителя (администратор — любой).
  const link = await prisma.studentClass.findFirst({
    where: {
      student: { results: { some: { id } } },
      ...(user.role === "admin" ? {} : { class: { teacherId: user.id } }),
    },
    select: { classId: true, studentId: true },
  });
  if (!link) notFound();

  const result = await loadResultView(id, link.studentId);
  if (!result) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link href={`/teacher/classes/${link.classId}/students/${link.studentId}`} className="text-sm text-blue-700 hover:underline">← История ученика</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">{result.student.fullName}</h1>
      <ResultDetails result={result} />
    </main>
  );
}
