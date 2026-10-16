import { TYPE_CODES, TYPE_NAMES, type Scores, type TypeCode } from "@/lib/klimov";

/** Горизонтальные столбцы баллов по пяти шкалам. Доминирующие типы выделены. */
export function ScoreBars({ scores, dominant }: { scores: Scores; dominant: TypeCode[] }) {
  return (
    <ul className="space-y-3" aria-label="Баллы по направлениям">
      {TYPE_CODES.map((code) => {
        const isTop = dominant.includes(code);
        return (
          <li key={code}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className={isTop ? "font-bold" : ""}>{TYPE_NAMES[code]}</span>
              <span className="shrink-0 tabular-nums">{scores[code]} из 20</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200" role="img" aria-label={`${TYPE_NAMES[code]}: ${scores[code]} баллов`}>
              <div className={`h-full ${isTop ? "bg-emerald-600" : "bg-blue-400"}`} style={{ width: `${(scores[code] / 20) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
