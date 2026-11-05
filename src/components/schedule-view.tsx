import Link from "next/link";
import {
  addDaysIso,
  dayNumberOfIso,
  formatDayShort,
  formatWeekRange,
  groupByDay,
  isIsoDate,
  lessonTime,
  weekDaysIso,
  weekStartIso,
} from "@/lib/schedule";

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

/** Параметры вида из URL: выбранный день (1..7) и понедельник недели "YYYY-MM-DD". */
export type ScheduleViewParams = { day?: string; week?: string };

type Props = {
  rows: ScheduleRow[];
  /** Адрес ссылок блока: переключение дней и недель ведёт на эту страницу. */
  basePath: string;
  /** Дополнительные параметры ссылки (например, class на страницах с выбором класса). */
  baseQuery?: Record<string, string | undefined>;
  params?: ScheduleViewParams;
  /** «Сегодня» по Москве ("YYYY-MM-DD"): день по умолчанию и маркер на вкладке. */
  todayIso: string;
  title?: string;
  subtitle?: string;
  showTeacher?: boolean;
  showClass?: boolean;
};

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

/**
 * Блок «Расписание на неделю» (UC-01–UC-03): вкладки дней с датами и список уроков
 * выбранного дня, навигация по неделям. Работает без клиентского JS — вкладки и недели
 * это ссылки с параметрами week/day. Данные — недельный шаблон (ADR-0010): уроки
 * повторяются из недели в неделю, меняются только отображаемые даты.
 */
export function ScheduleView({
  rows,
  basePath,
  baseQuery = {},
  params,
  todayIso,
  title = "Расписание на неделю",
  subtitle,
  showTeacher = true,
  showClass = false,
}: Props) {
  const byDay = groupByDay(rows);
  const lessonsOfDay = (d: number) => byDay.find(([day]) => day === d)?.[1] ?? [];

  // Неделя из URL (нормализуем к понедельнику) или текущая.
  const weekStart = params?.week && isIsoDate(params.week) ? weekStartIso(params.week) : weekStartIso(todayIso);
  const days = weekDaysIso(weekStart);

  // Вкладки: Пн–Сб всегда, Вс — только если в шаблоне есть уроки.
  const visibleDays = [...Array.from({ length: 6 }, (_, i) => i + 1), ...(lessonsOfDay(7).length > 0 ? [7] : [])];

  // Выбранный день: из URL, иначе сегодняшний день недели (если виден), иначе первый видимый.
  const urlDay = Number(params?.day);
  const todayDay = dayNumberOfIso(todayIso);
  const selected =
    Number.isInteger(urlDay) && visibleDays.includes(urlDay)
      ? urlDay
      : visibleDays.includes(todayDay)
        ? todayDay
        : visibleDays[0];

  const href = (day: number, weekIso: string) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(baseQuery)) if (v) q.set(k, v);
    q.set("week", weekIso);
    q.set("day", String(day));
    return `${basePath}?${q.toString()}`;
  };

  const lastIso = days[visibleDays[visibleDays.length - 1] - 1];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <CalendarIcon />
          </span>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={href(selected, addDaysIso(weekStart, -7))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg text-gray-500 hover:bg-gray-50"
            aria-label="Предыдущая неделя"
          >
            ‹
          </Link>
          <span className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium whitespace-nowrap">
            {formatWeekRange(days[0], lastIso)}
          </span>
          <Link
            href={href(selected, addDaysIso(weekStart, 7))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-lg text-gray-500 hover:bg-gray-50"
            aria-label="Следующая неделя"
          >
            ›
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto px-5">
        <div className="flex w-full min-w-max gap-2 pb-4">
          {visibleDays.map((d) => {
            const iso = days[d - 1];
            const active = d === selected;
            return (
              <Link
                key={d}
                href={href(d, weekStart)}
                className={`min-w-[7.5rem] flex-1 rounded-lg px-4 py-2 text-center text-sm whitespace-nowrap ${
                  active ? "bg-blue-600 font-semibold text-white" : "bg-gray-50 font-medium text-gray-700 hover:bg-gray-100"
                }`}
              >
                {formatDayShort(iso)}
                {iso === todayIso && !active && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" aria-label="Сегодня" />}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-5">
        {lessonsOfDay(selected).length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">Уроков нет</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {lessonsOfDay(selected).map((l) => {
              const teacher = showTeacher ? (l.teacherLabel ?? l.teacherName) : null;
              const middle = showClass && l.classLabel ? `Класс: ${l.classLabel}` : teacher;
              const metaMobile = [middle, l.room ? `Каб. ${l.room}` : null].filter(Boolean).join(" · ");
              return (
                <li key={l.id} className="py-3 sm:grid sm:grid-cols-[5.5rem_1fr_10rem_5rem] sm:items-center sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-sm font-semibold text-blue-700">{l.lessonNumber}</span>
                    <span className="text-sm tabular-nums text-gray-500">{lessonTime(l.lessonNumber)}</span>
                  </div>
                  <div className="font-semibold">{l.subject}</div>
                  <div className="hidden text-sm text-gray-500 sm:block">{middle}</div>
                  <div className="hidden text-sm text-gray-500 sm:block sm:text-right">{l.room ? `Каб. ${l.room}` : ""}</div>
                  <div className="mt-1 text-sm text-gray-500 sm:hidden">{metaMobile}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}