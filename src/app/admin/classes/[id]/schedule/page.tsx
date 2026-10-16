import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { ActionForm } from "@/components/action-form";
import { Field, cardCls, dangerCls, inputCls } from "@/components/ui";
import { DAY_NAMES } from "@/lib/format";
import { addLesson, copySchedule, deleteLesson } from "./actions";

export const metadata = { title: "Расписание класса" };

export default async function ClassSchedulePage({ params }: PageProps<"/admin/classes/[id]/schedule">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const cls = await prisma.schoolClass.findUnique({ where: { id } });
  if (!cls) notFound();

  const [lessons, others] = await Promise.all([
    prisma.scheduleEntry.findMany({
      where: { classId: id, academicYear: cls.academicYear },
      orderBy: [{ dayOfWeek: "asc" }, { lessonNumber: "asc" }],
    }),
    prisma.schoolClass.findMany({ where: { id: { not: id } }, orderBy: [{ academicYear: "desc" }, { name: "asc" }] }),
  ]);
  const byDay = new Map<number, typeof lessons>();
  for (const l of lessons) byDay.set(l.dayOfWeek, [...(byDay.get(l.dayOfWeek) ?? []), l]);

  return (
    <main className="max-w-3xl space-y-6">
      <div>
        <Link href={`/admin/classes/${cls.id}`} className="text-sm text-blue-700 hover:underline">← Класс {cls.name}</Link>
        <h1 className="mt-2 text-2xl font-bold">Расписание: {cls.name}, {cls.academicYear}</h1>
      </div>

      <section className={cardCls}>
        <h2 className="mb-3 font-semibold">Добавить урок</h2>
        <ActionForm action={addLesson.bind(null, cls.id)} submitLabel="Добавить" className="grid gap-4 sm:grid-cols-2">
          <Field label="День недели">
            <select name="dayOfWeek" defaultValue="1" className={inputCls}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
            </select>
          </Field>
          <Field label="Номер урока"><input name="lessonNumber" type="number" min={1} max={12} defaultValue={1} required className={inputCls} /></Field>
          <Field label="Предмет"><input name="subject" required className={inputCls} /></Field>
          <Field label="Учитель (необязательно)"><input name="teacherName" className={inputCls} /></Field>
          <Field label="Кабинет (необязательно)"><input name="room" className={inputCls} /></Field>
        </ActionForm>
      </section>

      <section className={cardCls}>
        <h2 className="mb-3 font-semibold">Уроки ({lessons.length})</h2>
        {lessons.length === 0 && <p className="text-sm text-gray-500">Расписание пока пустое.</p>}
        <div className="space-y-4">
          {[...byDay].map(([day, items]) => (
            <div key={day}>
              <h3 className="mb-1 text-sm font-semibold text-blue-900">{DAY_NAMES[day]}</h3>
              <ul className="divide-y divide-gray-100 text-sm">
                {items.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
                    <span>
                      {l.lessonNumber}. {l.subject}
                      <span className="text-gray-500">{[l.room && ` · каб. ${l.room}`, l.teacherName && ` · ${l.teacherName}`].filter(Boolean).join("")}</span>
                    </span>
                    <form action={deleteLesson.bind(null, cls.id, l.id)}><button className={dangerCls}>Удалить</button></form>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {others.length > 0 && (
        <section className={cardCls}>
          <h2 className="mb-3 font-semibold">Скопировать расписание другого класса</h2>
          <ActionForm action={copySchedule.bind(null, cls.id)} submitLabel="Скопировать">
            <Field label="Класс-источник" hint="Текущее расписание этого класса будет заменено.">
              <select name="sourceId" defaultValue="" required className={inputCls}>
                <option value="" disabled>— выберите —</option>
                {others.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.academicYear})</option>)}
              </select>
            </Field>
          </ActionForm>
        </section>
      )}
    </main>
  );
}
