"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useHydrated } from "@/components/use-hydrated";
import { submitTest } from "./actions";

type Question = { questionNumber: number; optionA: string; optionB: string };

export function TestForm({ prompt, questions }: { prompt: string; questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<number, "A" | "B">>({});
  const [missing, setMissing] = useState<number | null>(null);
  const [state, action, pending] = useActionState(submitTest, undefined);
  const submitted = useRef(false);
  const hydrated = useHydrated();
  const answered = Object.keys(answers).length;

  // Предупреждение при закрытии/обновлении страницы: прохождение не сохраняется.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (answered > 0 && !submitted.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [answered]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const first = questions.find((q) => !answers[q.questionNumber]);
    if (first) {
      setMissing(first.questionNumber);
      document.getElementById(`q${first.questionNumber}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!window.confirm("Завершить тест? Результат будет сохранён, изменить его будет нельзя.")) return;
    submitted.current = true;
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form method="post" onSubmit={onSubmit} noValidate>
      <div className="sticky top-14 z-10 -mx-4 bg-gray-50/95 px-4 py-3 backdrop-blur md:top-[3.75rem]">
        <div className="mb-1 flex justify-between text-sm font-semibold">
          <span>Прогресс</span>
          <span>{answered} из {questions.length}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered}>
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <fieldset
            key={q.questionNumber}
            id={`q${q.questionNumber}`}
            className={`rounded-xl border bg-white p-4 ${missing === q.questionNumber && !answers[q.questionNumber] ? "border-red-500" : "border-gray-200"}`}
          >
            <legend className="px-1 font-semibold">
              <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">{q.questionNumber}</span>
              {prompt}
            </legend>
            {(["A", "B"] as const).map((opt) => (
              <label
                key={opt}
                className={`mt-2 flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 leading-snug ${
                  answers[q.questionNumber] === opt ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name={`q${q.questionNumber}`}
                  value={opt}
                  checked={answers[q.questionNumber] === opt}
                  onChange={() => {
                    setAnswers((a) => ({ ...a, [q.questionNumber]: opt }));
                    setMissing(null);
                  }}
                  className="mt-1 h-5 w-5 shrink-0 accent-blue-600"
                />
                <span className="font-bold text-blue-700">{opt === "A" ? "А" : "Б"}</span>
                <span>{opt === "A" ? q.optionA : q.optionB}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>

      {missing !== null && <p role="alert" className="mt-4 font-semibold text-red-600">Ответьте на все 20 вопросов, прежде чем завершить тест.</p>}
      {state?.error && <p role="alert" className="mt-4 font-semibold text-red-600">{state.error}</p>}

      <button
        disabled={pending || !hydrated}
        className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-bold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Сохраняем результат…" : "Завершить тест"}
      </button>
    </form>
  );
}
