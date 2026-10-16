"use client";

import { startTransition, useActionState, useRef, type FormEvent, type ReactNode } from "react";
import { clearInvalidOnEdit, useFieldHighlight } from "@/components/use-field-highlight";
import { useHydrated } from "@/components/use-hydrated";
import type { FormState } from "@/lib/form-state";

export type { FormState };

/**
 * Форма с server action: показывает ошибку/успех, подсвечивает проблемное поле, блокирует кнопку на время отправки.
 * Отправка через onSubmit, чтобы React не сбрасывал введённые поля после ошибки валидации.
 */
export function ActionForm({
  action,
  submitLabel,
  children,
  className = "flex flex-col gap-4",
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFieldHighlight(formRef, state);
  const hydrated = useHydrated();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} onInput={clearInvalidOnEdit} onChange={clearInvalidOnEdit} className={className}>
      {children}
      {state?.error && <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p role="status" className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{state.ok}</p>}
      <div>
        <button disabled={pending || !hydrated} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {pending ? "Сохраняем…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
