export const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Moscow" }).format(d);

export const formatDateTime = (d: Date) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" }).format(d);

export const formatShortDate = (d: Date) =>
  new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Moscow" }).format(d);

export const DAY_NAMES = ["", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
