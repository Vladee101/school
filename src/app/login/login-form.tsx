"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        Логин
        <input name="login" autoComplete="username" required className="rounded border px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        Пароль
        <input name="password" type="password" autoComplete="current-password" required className="rounded border px-3 py-2" />
      </label>
      {state?.error && <p role="alert" className="text-red-600">{state.error}</p>}
      <button disabled={pending} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
