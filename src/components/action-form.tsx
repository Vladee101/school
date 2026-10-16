"use client";

import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";

export type FormState = { error?: string; ok?: string } | undefined;

/**
 * Форма с server action: показывает ошибку/успех, блокирует кнопку на время отправки.
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

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-green-700">{state.ok}</p>}
      <div>
        <button disabled={pending} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {pending ? "Сохраняем…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
