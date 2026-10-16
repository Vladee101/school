"use client";

import { useEffect, type FormEvent, type RefObject } from "react";

type State = { error?: string; field?: string } | undefined;

/**
 * Подсвечивает поля формы, названные в `state.field` (через запятую), и ставит фокус на первое.
 * Подсветка (aria-invalid) снимается, как только пользователь меняет значение поля.
 */
export function useFieldHighlight(formRef: RefObject<HTMLFormElement | null>, state: State) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    if (!state?.error || !state.field) return;

    let first: HTMLElement | null = null;
    for (const name of state.field.split(",")) {
      const el = form.querySelector<HTMLElement>(`[name="${name}"]:not([type=hidden]), [data-field="${name}"]`);
      if (!el) continue;
      el.setAttribute("aria-invalid", "true");
      first ??= el;
    }
    first?.focus({ preventScroll: true });
    first?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [state, formRef]);
}

/** Обработчик для onInput/onChange формы: снимает подсветку с изменённого поля. */
export function clearInvalidOnEdit(e: FormEvent<HTMLFormElement>) {
  (e.target as HTMLElement).removeAttribute?.("aria-invalid");
}
