import type { ZodError } from "zod";

/** Состояние формы после server action. `field` — имя поля (атрибут name), которое нужно подсветить. */
export type FormState = { error?: string; ok?: string; field?: string } | undefined;

/** Первая ошибка валидации Zod -> состояние формы с подсветкой поля (или `fallbackField`, если путь пуст). */
export function zodFail(error: ZodError, fallbackField?: string): FormState {
  const issue = error.issues[0];
  const key = issue.path[0];
  return { error: issue.message, field: key !== undefined ? String(key) : fallbackField };
}
