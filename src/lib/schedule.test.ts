import { describe, expect, it } from "vitest";
import { BELL_TIMES, currentDayNumber, groupByDay, lessonTime } from "./schedule";

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