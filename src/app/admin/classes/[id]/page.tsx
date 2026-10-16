import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { ClassFields } from "@/components/class-fields";
import { Field, cardCls, dangerCls, inputCls } from "@/components/ui";
import { addStudent, removeStudent, updateClass } from "../actions";

export const metadata = { title: "Класс" };

export default async function ClassPage({ params }: PageProps<"/admin/classes/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const cls = await prisma.schoolClass.findUnique({
    where: { id },
    include: { students: { include: { student: true }, orderBy: { student: { fullName: "asc" } } } },
  });
  if (!cls) notFound();

  // Кандидаты: активные ученики, которых ещё нет в этом классе (из других классов — переводом).
  const candidates = await prisma.user.findMany({
    where: { role: "student", isActive: true, OR: [{ studentClass: null }, { studentClass: { classId: { not: id } } }] },
    include: { studentClass: { include: { class: true } } },
    orderBy: { fullName: "asc" },
  });

  return (
    <main className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/classes" className="text-sm text-blue-700 hover:underline">← Классы</Link>
        <h1 className="mt-2 text-2xl font-bold">Класс {cls.name}, {cls.academicYear}</h1>
      </div>

      <section className={cardCls}>
        <h2 className="mb-3 font-semibold">Параметры</h2>
        <ActionForm action={updateClass.bind(null, cls.id)} submitLabel="Сохранить">
          <ClassFields defaults={{ name: cls.name, academicYear: cls.academicYear, teacherId: cls.teacherId }} />
        </ActionForm>
      </section>

      <section className={cardCls}>
        <h2 className="mb-3 font-semibold">Ученики ({cls.students.length})</h2>
        {cls.students.length === 0 ? (
          <p className="text-sm text-gray-500">В классе пока нет учеников.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {cls.students.map((s) => (
              <li key={s.studentId} className="flex items-center justify-between gap-3 py-2">
                <span>{s.student.fullName} <span className="text-sm text-gray-500">({s.student.login})</span></span>
                <form action={removeStudent.bind(null, cls.id, s.studentId)}>
                  <button className={dangerCls}>Убрать</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 border-t border-gray-100 pt-4">
          <ActionForm action={addStudent.bind(null, cls.id)} submitLabel="Добавить в класс">
            <Field label="Добавить ученика" hint="Ученик из другого класса будет переведён.">
              <select name="studentId" defaultValue="" required className={inputCls}>
                <option value="" disabled>— выберите —</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}{c.studentClass ? ` — сейчас ${c.studentClass.class.name}` : " — без класса"}</option>
                ))}
              </select>
            </Field>
          </ActionForm>
        </div>
      </section>
    </main>
  );
}
