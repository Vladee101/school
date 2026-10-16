"use client";

import { startTransition, useActionState, useRef, type FormEvent } from "react";
import { clearInvalidOnEdit, useFieldHighlight } from "@/components/use-field-highlight";
import { useHydrated } from "@/components/use-hydrated";
import { changePassword } from "./actions";

const field = "rounded border border-gray-300 bg-white px-3 py-2";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFieldHighlight(formRef, state);
  const hydrated = useHydrated();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} onInput={clearInvalidOnEdit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        Текущий пароль
        <input name="current" type="password" autoComplete="current-password" required className={field} />
      </label>
      <label className="flex flex-col gap-1">
        Новый пароль
        <input name="next" type="password" autoComplete="new-password" required className={field} />
        <span className="hint text-sm text-gray-500">Минимум 8 символов, буква и цифра</span>
      </label>
      <label className="flex flex-col gap-1">
        Повторите новый пароль
        <input name="confirm" type="password" autoComplete="new-password" required className={field} />
      </label>
      {state?.error && <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending || !hydrated} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {pending ? "Сохраняем…" : "Сменить пароль"}
      </button>
    </form>
  );
}
