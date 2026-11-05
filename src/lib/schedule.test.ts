import { describe, expect, it } from "vitest";
import {
  addDaysIso,
  BELL_TIMES,
  currentDayNumber,
  dayNumberOfIso,
  formatDayShort,
  formatWeekRange,
  groupByDay,
  isIsoDate,
  lessonTime,
  moscowToday,
  weekDaysIso,
  weekStartIso,
} from "./schedule";

describe("справочник звонков", () => {
  it("покрывает уроки 1–12 в формате ЧЧ:ММ–ЧЧ:ММ", () => {
    expect(BELL_TIMES).toHaveLength(13); // индекс 0 не используется
    for (let n = 1; n <= 12; n++) expect(lessonTime(n)).toMatch(/^\d{2}:\d{2}–\d{2}:\d{2}$/);
  });

  it("вне диапазона времени нет", () => {
    expect(lessonTime(0)).toBeNull();
    expect(lessonTime(13)).toBeNull();
  });
});

describe("groupByDay", () => {
  const lesson = (day: number, num: number, subject = "Математика") => ({
    dayOfWeek: day,
    lessonNumber: num,
    subject,
  });

  it("сортирует по дню и номеру урока", () => {
    const grouped = groupByDay([lesson(2, 1), lesson(1, 2), lesson(1, 1), lesson(3, 1)]);
    expect(grouped.map(([day, items]) => [day, items.map((l) => l.lessonNumber)])).toEqual([
      [1, [1, 2]],
      [2, [1]],
      [3, [1]],
    ]);
  });

  it("не изменяет исходный массив", () => {
    const source = [lesson(3, 1), lesson(1, 1)];
    groupByDay(source);
    expect(source.map((l) => l.dayOfWeek)).toEqual([3, 1]);
  });

  it("пустой список даёт пустой результат", () => {
    expect(groupByDay([])).toEqual([]);
  });
});

describe("currentDayNumber", () => {
  it("возвращает день недели 1..7 по зоне Europe/Moscow", () => {
    // 2026-11-05 12:00 UTC = 15:00 MSK, четверг
    expect(currentDayNumber(new Date("2026-11-05T12:00:00Z"))).toBe(4);
    // 2026-11-08 20:00 UTC = 23:00 MSK, воскресенье
    expect(currentDayNumber(new Date("2026-11-08T20:00:00Z"))).toBe(7);
  });

  it("граница суток: до полуночи MSK ещё суббота, после — воскресенье", () => {
    // 2026-11-07 20:30 UTC = 23:30 MSK суббота; 21:00 UTC = 00:00 MSK воскресенье
    expect(currentDayNumber(new Date("2026-11-07T20:30:00Z"))).toBe(6);
    expect(currentDayNumber(new Date("2026-11-07T21:00:00Z"))).toBe(7);
  });
});

describe("даты недели (Europe/Moscow)", () => {
  it("moscowToday: 20:30 UTC 7 ноября — ещё 7-е в Москве, 21:00 UTC — уже 8-е", () => {
    expect(moscowToday(new Date("2026-11-07T20:30:00Z"))).toBe("2026-11-07");
    expect(moscowToday(new Date("2026-11-07T21:00:00Z"))).toBe("2026-11-08");
  });

  it("isIsoDate принимает только реальные даты YYYY-MM-DD", () => {
    expect(isIsoDate("2026-11-09")).toBe(true);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("09.11.2026")).toBe(false);
    expect(isIsoDate(123)).toBe(false);
  });

  it("weekStartIso возвращает понедельник любой даты недели", () => {
    // 2026-11-09 — понедельник, 2026-11-15 — воскресенье
    for (let d = 9; d <= 15; d++) {
      const iso = `2026-11-${String(d).padStart(2, "0")}`;
      expect(dayNumberOfIso(iso)).toBe(d - 8);
      expect(weekStartIso(iso)).toBe("2026-11-09");
    }
    // через границу месяца: 2026-11-01 (воскресенье) -> неделя с 2026-10-26
    expect(weekStartIso("2026-11-01")).toBe("2026-10-26");
  });

  it("weekDaysIso/addDaysIso идут по календарю через границы месяца", () => {
    expect(weekDaysIso("2026-10-26")).toEqual([
      "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01",
    ]);
    expect(addDaysIso("2026-10-31", 7)).toBe("2026-11-07");
  });

  it("formatDayShort: «Пн, 19 окт»", () => {
    expect(formatDayShort("2026-10-19")).toBe("Пн, 19 окт");
    expect(formatDayShort("2026-10-20")).toBe("Вт, 20 окт");
  });

  it("formatWeekRange: в пределах месяца, через месяц и через год", () => {
    expect(formatWeekRange("2026-10-19", "2026-10-24")).toBe("19 – 24 октября 2026");
    expect(formatWeekRange("2026-10-26", "2026-11-01")).toBe("26 октября – 1 ноября 2026");
    expect(formatWeekRange("2025-12-29", "2026-01-03")).toBe("29 декабря 2025 – 3 января 2026");
  });
});