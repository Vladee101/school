"use client";

import { useActionState } from "react";
import { changePassword } from "./actions";

const field = "rounded border px-3 py-2";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        Текущий пароль
        <input name="current" type="password" autoComplete="current-password" required className={field} />
      </label>
      <label className="flex flex-col gap-1">
        Новый пароль
        <input name="next" type="password" autoComplete="new-password" required className={field} />
        <span className="text-sm text-gray-500">Минимум 8 символов, буква и цифра</span>
      </label>
      <label className="flex flex-col gap-1">
        Повторите новый пароль
        <input name="confirm" type="password" autoComplete="new-password" required className={field} />
      </label>
      {state?.error && <p role="alert" className="text-red-600">{state.error}</p>}
      <button disabled={pending} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {pending ? "Сохраняем…" : "Сменить пароль"}
      </button>
    </form>
  );
}
