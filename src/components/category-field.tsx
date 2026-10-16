"use client";

import { useState } from "react";
import { inputCls } from "@/components/ui";

const OTHER = "__other__";

/** Выпадающий список категорий + пункт «Другая…» для ввода новой. Отправляет значение в поле `category`. */
export function CategoryField({ categories, defaultValue }: { categories: string[]; defaultValue?: string }) {
  const options = defaultValue && !categories.includes(defaultValue) ? [defaultValue, ...categories] : categories;
  const [choice, setChoice] = useState(defaultValue ?? options[0] ?? OTHER);
  const [custom, setCustom] = useState("");
  const value = choice === OTHER ? custom : choice;

  return (
    <div className="flex flex-col gap-1 text-sm font-medium">
      <label htmlFor="category-select">Категория</label>
      <select id="category-select" value={choice} onChange={(e) => setChoice(e.target.value)} className={inputCls}>
        {options.map((c) => <option key={c} value={c}>{c}</option>)}
        <option value={OTHER}>Другая категория…</option>
      </select>
      {choice === OTHER && (
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Название новой категории"
          aria-label="Название новой категории"
          required
          className={inputCls}
        />
      )}
      <input type="hidden" name="category" value={value} />
    </div>
  );
}
