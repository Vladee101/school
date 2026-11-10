import Link from "next/link";

/** Ключи вкладок кабинета: расписание (по умолчанию) и тестирование. */
export type CabinetTab = "schedule" | "testing";

const TABS: { key: CabinetTab; label: string }[] = [
  { key: "schedule", label: "Расписание" },
  { key: "testing", label: "Тестирование" },
];

/**
 * Вкладки «Расписание» / «Тестирование» в личном кабинете ученика и на панели учителя.
 * Без клиентского JS — ссылки с URL-параметром tab, как вкладки дней в ScheduleView (ADR-0010):
 * без параметра открыта вкладка расписания, «tab=testing» — тестирование. Активная вкладка
 * выделена рамкой.
 */
export function CabinetTabs({
  basePath,
  active,
  className = "",
}: {
  basePath: string;
  active: CabinetTab;
  className?: string;
}) {
  return (
    <nav className={`flex gap-2 ${className}`} aria-label="Вкладки кабинета">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.key === "schedule" ? basePath : `${basePath}?tab=${t.key}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-lg border px-5 py-2 text-sm font-semibold ${
              isActive
                ? "border-blue-600 bg-white text-blue-700"
                : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
