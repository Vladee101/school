import { DAY_NAMES } from "@/lib/format";
import { groupByDay, lessonTime } from "@/lib/schedule";

/** Строка расписания, подготовленная страницей. */
export type ScheduleRow = {
  id: number;
  dayOfWeek: number;
  lessonNumber: number;
  subject: string;
  teacherName: string | null;
  room: string | null;
  /** Имя учителя из учётной записи; приоритетнее teacherName (UC-01, UC-03). */
  teacherLabel?: string | null;
  /** Подпись класса для личного расписания учителя (UC-02). */
  classLabel?: string | null;
};

/**
 * Единый вид расписания: группировка по дням, внутри дня — по номеру урока,
 * у каждого урока — время из справочника звонков (UC-01, UC-02, UC-03).
 */
export function ScheduleView({
  rows,
  showTeacher = true,
  showClass = false,
}: {
  rows: ScheduleRow[];
  showTeacher?: boolean;
  showClass?: boolean;
}) {
  const byDay = groupByDay(rows);
  if (byDay.length === 0) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {byDay.map(([day, lessons]) => (
        <section key={day} className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-2 font-semibold text-blue-900">{DAY_NAMES[day]}</h3>
          <ol className="space-y-1 text-sm">
            {lessons.map((l) => {
              const time = lessonTime(l.lessonNumber);
              const teacher = showTeacher ? (l.teacherLabel ?? l.teacherName) : null;
              const details = [
                showClass && l.classLabel ? `класс ${l.classLabel}` : null,
                l.room ? `каб. ${l.room}` : null,
                teacher,
              ].filter(Boolean) as string[];
              return (
                <li key={l.id} className="flex gap-2">
                  <span className="w-5 shrink-0 text-gray-500 tabular-nums">{l.lessonNumber}.</span>
                  <span>
                    {time && <span className="text-gray-500">{time} · </span>}
                    {l.subject}
                    {details.length > 0 && <span className="text-gray-500"> · {details.join(", ")}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}