import { allClasses, scheduleForClass } from "@/lib/public-data";
import { DAY_NAMES } from "@/lib/format";

export const metadata = { title: "Расписание" };

export default async function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  const classes = await allClasses();
  const raw = (await searchParams).class;
  const selectedId = Number(Array.isArray(raw) ? raw[0] : raw);
  const selected = classes.find((c) => c.id === selectedId);
  const entries = selected ? await scheduleForClass(selected.id, selected.academicYear) : [];

  const byDay = new Map<number, typeof entries>();
  for (const e of entries) byDay.set(e.dayOfWeek, [...(byDay.get(e.dayOfWeek) ?? []), e]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Расписание</h1>

      {classes.length === 0 ? (
        <p className="text-gray-600">Классы пока не добавлены.</p>
      ) : (
        <form className="mb-6 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Класс
            <select name="class" defaultValue={selected?.id ?? ""} className="min-w-40 rounded border border-gray-300 bg-white px-3 py-2">
              <option value="" disabled>Выберите класс</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.academicYear})</option>
              ))}
            </select>
          </label>
          <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Показать</button>
        </form>
      )}

      {selected && entries.length === 0 && <p className="text-gray-600">Расписание для класса {selected.name} пока не заполнено.</p>}

      {selected && entries.length > 0 && (
        <>
          <h2 className="mb-3 text-xl font-semibold">Класс {selected.name}, {selected.academicYear} учебный год</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...byDay].map(([day, lessons]) => (
              <section key={day} className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="mb-2 font-semibold text-blue-900">{DAY_NAMES[day]}</h3>
                <ol className="space-y-1 text-sm">
                  {lessons.map((l) => (
                    <li key={l.id} className="flex gap-2">
                      <span className="w-5 shrink-0 text-gray-500">{l.lessonNumber}.</span>
                      <span>
                        {l.subject}
                        {(l.room || l.teacherName) && (
                          <span className="text-gray-500"> · {[l.room && `каб. ${l.room}`, l.teacherName].filter(Boolean).join(", ")}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
