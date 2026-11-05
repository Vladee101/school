// Справочник звонков: номер урока -> интервал времени. Учебная заглушка —
// уточните фактические интервалы у школы и при необходимости отредактируйте (см. ADR-0010).
export const BELL_TIMES: readonly string[] = [
  "", // индекс 0 не используется: уроки нумеруются с 1
  "08:30–09:15",
  "09:25–10:10",
  "10:30–11:15",
  "11:35–12:20",
  "12:40–13:25",
  "13:45–14:30",
  "14:40–15:25",
  "15:35–16:20",
  "16:30–17:15",
  "17:25–18:10",
  "18:20–19:05",
  "19:15–20:00",
];

/** Время урока по его номеру; null, если номер вне справочника звонков. */
export const lessonTime = (lessonNumber: number): string | null =>
  Number.isInteger(lessonNumber) && lessonNumber >= 1 && lessonNumber < BELL_TIMES.length
    ? BELL_TIMES[lessonNumber]
    : null;

/** Минимальные поля урока, нужные для группировки и отображения. */
export type ScheduleLessonLike = {
  dayOfWeek: number;
  lessonNumber: number;
};

/**
 * Группирует уроки по дням недели (UC-01–UC-03): дни по возрастанию,
 * внутри дня — по номеру урока. Исходный массив не изменяется.
 */
export function groupByDay<T extends ScheduleLessonLike>(lessons: readonly T[]): Array<[number, T[]]> {
  const sorted = [...lessons].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.lessonNumber - b.lessonNumber);
  const byDay = new Map<number, T[]>();
  for (const lesson of sorted) byDay.set(lesson.dayOfWeek, [...(byDay.get(lesson.dayOfWeek) ?? []), lesson]);
  return [...byDay];
}