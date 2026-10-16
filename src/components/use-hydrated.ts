"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false при серверной отрисовке и до гидратации, затем true. Кнопки отправки форм с onSubmit блокируются, пока false:
 * иначе ранний клик отправит форму обычным запросом, и значения (в том числе пароль) попадут в адресную строку.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
