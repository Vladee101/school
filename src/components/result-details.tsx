import { ProfessionCard } from "@/components/profession-card";
import { ScoreBars } from "@/components/score-bars";
import { cardCls } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import type { ResultView } from "@/lib/result-view";

/** Полное представление результата (ученик, а позже учитель). */
export function ResultDetails({ result }: { result: ResultView }) {
  const several = result.types.length > 1;
  return (
    <div className="space-y-6">
      <section className={cardCls}>
        <p className="text-sm text-gray-500">Дата прохождения: {formatDateTime(result.completedAt)}</p>
        <h2 className="mb-4 mt-1 text-xl font-semibold">Баллы по направлениям</h2>
        <ScoreBars scores={result.scores} dominant={result.dominant} />
      </section>

      <section className={cardCls}>
        <h2 className="mb-3 text-xl font-semibold">
          {several ? "Преобладающие направления" : "Преобладающее направление"}
        </h2>
        {several && <p className="mb-3 text-sm text-gray-600">Максимальный балл набран сразу по нескольким направлениям: выражены они в равной степени.</p>}
        <div className="space-y-4">
          {result.types.map((t) => (
            <div key={t.code}>
              <h3 className="font-semibold text-emerald-800">{t.name}</h3>
              <p className="mt-1 whitespace-pre-line text-gray-700">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Рекомендуемые профессии</h2>
        <div className="space-y-6">
          {result.types.map((t) => (
            <div key={t.code}>
              {several && <h3 className="mb-2 font-semibold text-emerald-800">{t.name}</h3>}
              {t.professions.length === 0 ? (
                <p className="text-sm text-gray-500">Список профессий для направления «{t.name}» пока не заполнен.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {t.professions.map((p) => <ProfessionCard key={p.id} profession={p} typeName={t.name} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm text-gray-500">Результат отражает предпочтения по пяти направлениям и не является профессиональным диагнозом.</p>
    </div>
  );
}
