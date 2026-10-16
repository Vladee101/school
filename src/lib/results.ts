import { TYPE_CODES, type Scores, type TypeCode } from "@/lib/klimov";

type ResultScores = { scoreChP: number; scoreChT: number; scoreChCh: number; scoreChZ: number; scoreChHo: number };

/** Колонки score_* результата -> баллы по кодам шкал. */
export const scoresOf = (r: ResultScores): Scores => ({
  CH_P: r.scoreChP,
  CH_T: r.scoreChT,
  CH_CH: r.scoreChCh,
  CH_Z: r.scoreChZ,
  CH_HO: r.scoreChHo,
});

/** Колонки БД для набора баллов (обратное преобразование). */
export const scoreColumns = (s: Scores): ResultScores => ({
  scoreChP: s.CH_P,
  scoreChT: s.CH_T,
  scoreChCh: s.CH_CH,
  scoreChZ: s.CH_Z,
  scoreChHo: s.CH_HO,
});

export const isTypeCode = (v: string): v is TypeCode => (TYPE_CODES as readonly string[]).includes(v);
