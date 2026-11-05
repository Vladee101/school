import { describe, expect, it } from "vitest";
import { BELL_TIMES, groupByDay, lessonTime } from "./schedule";

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