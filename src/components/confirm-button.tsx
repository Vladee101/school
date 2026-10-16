"use client";

import type { ReactNode } from "react";

/** Кнопка отправки формы с подтверждением (для удаления). Использовать внутри <form action=...>. */
export function ConfirmButton({ message, className, children }: { message: string; className?: string; children: ReactNode }) {
  return (
    <button
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
