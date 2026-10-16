export const TYPE_CODES = ["CH_P", "CH_T", "CH_CH", "CH_Z", "CH_HO"] as const;
export type TypeCode = (typeof TYPE_CODES)[number];
export type Option = "A" | "B";

export const TYPE_NAMES: Record<TypeCode, string> = {
  CH_P: "Человек — природа",
  CH_T: "Человек — техника",
  CH_CH: "Человек — человек",
  CH_Z: "Человек — знаковая система",
  CH_HO: "Человек — художественный образ",
};

/** Фиксированный ключ ДДО Климова (ТЗ, FT-3.6): шкала -> варианты вида "1А". */
const KEY_SOURCE: Record<TypeCode, string[]> = {
  CH_P: ["1А", "3Б", "6А", "10А", "11А", "13Б", "16А", "20А"],
  CH_T: ["1Б", "4А", "7Б", "9А", "11Б", "14А", "17Б", "19А"],
  CH_CH: ["2А", "4Б", "6Б", "8А", "12А", "14Б", "16Б", "18А"],
  CH_Z: ["2Б", "5А", "9Б", "10Б", "12Б", "15Б", "19Б", "20Б"],
  CH_HO: ["3А", "5Б", "7А", "8Б", "13А", "15А", "17А", "18Б"],
};

export const QUESTION_COUNT = 20;

export type QuestionKey = { scaleA: TypeCode; scaleB: TypeCode };

/** Ключ по номеру вопроса (1..20). */
export const KEY: Record<number, QuestionKey> = (() => {
  const key: Record<number, Partial<QuestionKey>> = {};
  for (const code of TYPE_CODES) {
    for (const item of KEY_SOURCE[code]) {
      const num = parseInt(item, 10);
      const opt = item.endsWith("А") ? "scaleA" : "scaleB";
      (key[num] ??= {})[opt] = code;
    }
  }
  return key as Record<number, QuestionKey>;
})();

export type Scores = Record<TypeCode, number>;

export type ScoreOutcome = { scores: Scores; dominant: TypeCode[] };

/** answers: номер вопроса -> выбранный вариант. Бросает ошибку, если ответы неполны. */
export function scoreAnswers(answers: Record<number, Option>): ScoreOutcome {
  const scores: Scores = { CH_P: 0, CH_T: 0, CH_CH: 0, CH_Z: 0, CH_HO: 0 };
  for (let n = 1; n <= QUESTION_COUNT; n++) {
    const choice = answers[n];
    if (choice !== "A" && choice !== "B") {
      throw new Error(`Нет ответа на вопрос ${n}`);
    }
    const q = KEY[n];
    scores[choice === "A" ? q.scaleA : q.scaleB] += 1;
  }
  const max = Math.max(...TYPE_CODES.map((c) => scores[c]));
  const dominant = TYPE_CODES.filter((c) => scores[c] === max);
  return { scores, dominant };
}
