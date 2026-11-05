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

const DAY_OF_WEEK_BY_SHORT: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

/** Текущий день недели (1..7, Пн..Вс) в зоне Europe/Moscow — как все даты интерфейса. */
export const currentDayNumber = (now: Date = new Date()): number =>
  DAY_OF_WEEK_BY_SHORT[new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Europe/Moscow" }).format(now)];

// ---- Недели и даты (Europe/Moscow) ----
// Даты представлены строками "YYYY-MM-DD". Арифметика — в UTC-полдень:
// 12:00 UTC = 15:00 MSK, поэтому календарный день в Москве не меняется на границе суток.

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const noonUtc = (iso: string) => new Date(`${iso}T12:00:00Z`);
const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

/** «Сегодня» по Москве в виде "YYYY-MM-DD". */
export const moscowToday = (now: Date = new Date()): string => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
};

/** Проверка строки формата "YYYY-MM-DD" (заодно отсекает невозможные даты). */
export const isIsoDate = (v: unknown): v is string =>
  typeof v === "string" && ISO_DATE_RE.test(v) && !Number.isNaN(noonUtc(v).getTime());

/** Прибавляет n дней к дате "YYYY-MM-DD". */
export const addDaysIso = (iso: string, n: number): string => {
  const d = noonUtc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIsoDate(d);
};

/** Номер дня недели (1..7, Пн..Вс) для даты "YYYY-MM-DD" по Москве. */
export const dayNumberOfIso = (iso: string): number => currentDayNumber(noonUtc(iso));

/** Понедельник недели, содержащей дату. */
export const weekStartIso = (iso: string): string => addDaysIso(iso, -(dayNumberOfIso(iso) - 1));

/** Семь дат недели (Пн..Вс), начиная с понедельника "YYYY-MM-DD". */
export const weekDaysIso = (weekStart: string): string[] => Array.from({ length: 7 }, (_, i) => addDaysIso(weekStart, i));

const moscowParts = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", ...opts }).formatToParts(noonUtc(iso)).map((p) => [p.type, p.value]),
  );

const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** «Пн, 19 окт» — подпись вкладки дня. */
export const formatDayShort = (iso: string): string => {
  const p = moscowParts(iso, { weekday: "short", day: "numeric", month: "short" });
  return capitalizeFirst(`${p.weekday}, ${p.day} ${p.month}`.replace(".", ""));
};

/** Диапазон недели: «19 – 24 октября 2026», через месяц «26 октября – 1 ноября 2026», через год «29 декабря 2025 – 3 января 2026». */
export const formatWeekRange = (firstIso: string, lastIso: string): string => {
  const a = moscowParts(firstIso, { day: "numeric", month: "long", year: "numeric" });
  const b = moscowParts(lastIso, { day: "numeric", month: "long", year: "numeric" });
  if (a.year !== b.year) return `${a.day} ${a.month} ${a.year} – ${b.day} ${b.month} ${b.year}`;
  if (a.month !== b.month) return `${a.day} ${a.month} – ${b.day} ${b.month} ${b.year}`;
  return `${a.day} – ${b.day} ${b.month} ${b.year}`;
};