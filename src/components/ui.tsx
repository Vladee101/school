import type { ReactNode } from "react";

export const inputCls = "w-full rounded border border-gray-300 bg-white px-3 py-2";
export const btnCls = "rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700";
export const btn2Cls = "rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50";
export const dangerCls = "rounded border border-red-300 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50";
export const cardCls = "rounded-xl border border-gray-200 bg-white p-5";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      {children}
      {hint && <span className="hint text-xs font-normal text-gray-500">{hint}</span>}
    </label>
  );
}
