import { allClasses, scheduleForClass } from "@/lib/public-data";
import { ScheduleView } from "@/components/schedule-view";

export const metadata = { title: "Расписание" };

export default async function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  const classes = await allClasses();
  const raw = (await searchParams).class;
  const selectedId = Number(Array.isArray(raw) ? raw[0] : raw);
  const selected = classes.find((c) => c.id === selectedId);
  const entries = selected ? await scheduleForClass(selected.id, selected.academicYear) : [];

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
          <ScheduleView
            rows={entries.map((e) => ({
              id: e.id,
              dayOfWeek: e.dayOfWeek,
              lessonNumber: e.lessonNumber,
              subject: e.subject,
              teacherName: e.teacherName,
              room: e.room,
            }))}
          />
        </>
      )}
    </main>
  );
}
