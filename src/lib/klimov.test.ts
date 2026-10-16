import { describe, expect, it } from "vitest";
import { KEY, QUESTION_COUNT, scoreAnswers, type Option } from "./klimov";

const all = (o: Option) =>
  Object.fromEntries(Array.from({ length: QUESTION_COUNT }, (_, i) => [i + 1, o])) as Record<number, Option>;

describe("ключ Климова", () => {
  it("покрывает 20 вопросов, в каждом две разные шкалы", () => {
    expect(Object.keys(KEY)).toHaveLength(QUESTION_COUNT);
    for (const q of Object.values(KEY)) expect(q.scaleA).not.toBe(q.scaleB);
  });

  it("каждая шкала встречается ровно 8 раз", () => {
    const counts: Record<string, number> = {};
    for (const q of Object.values(KEY)) {
      counts[q.scaleA] = (counts[q.scaleA] ?? 0) + 1;
      counts[q.scaleB] = (counts[q.scaleB] ?? 0) + 1;
    }
    expect(Object.values(counts)).toEqual([8, 8, 8, 8, 8]);
  });
});

describe("scoreAnswers", () => {
  it("сумма шкал равна 20", () => {
    for (const o of ["A", "B"] as const) {
      const { scores } = scoreAnswers(all(o));
      expect(Object.values(scores).reduce((a, b) => a + b, 0)).toBe(20);
    }
  });

  it("при равных максимумах возвращает все доминирующие типы", () => {
    const { scores, dominant } = scoreAnswers(all("A"));
    const max = Math.max(...Object.values(scores));
    expect(dominant.every((c) => scores[c] === max)).toBe(true);
    expect(dominant.length).toBeGreaterThanOrEqual(1);
  });

  it("один максимум -> один тип", () => {
    // Все А: ЧП 1А,6А,10А,11А,16А,20А = 6 — максимум один
    const { dominant, scores } = scoreAnswers(all("A"));
    expect(scores.CH_P).toBe(6);
    expect(dominant).toEqual(["CH_P"]);
  });

  it("неполные ответы отклоняются", () => {
    const a = all("A");
    delete a[7];
    expect(() => scoreAnswers(a)).toThrow();
  });
});
