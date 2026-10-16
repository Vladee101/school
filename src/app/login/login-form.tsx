"use client";

import { startTransition, useActionState, useRef, type FormEvent } from "react";
import { clearInvalidOnEdit, useFieldHighlight } from "@/components/use-field-highlight";
import { useHydrated } from "@/components/use-hydrated";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
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
        Логин
        <input name="login" autoComplete="username" required className="rounded border border-gray-300 bg-white px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        Пароль
        <input name="password" type="password" autoComplete="current-password" required className="rounded border border-gray-300 bg-white px-3 py-2" />
      </label>
      {state?.error && <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending || !hydrated} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
