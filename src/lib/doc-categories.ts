/** Стандартные категории документов; к ним добавляются уже использованные и новые, введённые администратором. */
export const DEFAULT_DOC_CATEGORIES = [
  "Уставные документы",
  "Учебные планы и программы",
  "Приказы и положения",
  "Для родителей",
  "Прочее",
];

export const mergeCategories = (used: string[]) =>
  [...new Set([...DEFAULT_DOC_CATEGORIES, ...used])];
