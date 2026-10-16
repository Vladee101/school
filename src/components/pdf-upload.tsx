"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

const MAX_BYTES = 20 * 1024 * 1024;

/** Загружает PDF прямо в Vercel Blob и кладёт URL в скрытое поле `filePath`. */
export function PdfUpload({ currentUrl }: { currentUrl?: string }) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "ok" | "error"; text?: string }>({ kind: "idle" });

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatus({ kind: "error", text: "Разрешены только PDF-файлы" });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus({ kind: "error", text: "Файл больше 20 МБ" });
      e.target.value = "";
      return;
    }
    setStatus({ kind: "busy", text: "Загрузка…" });
    try {
      const blob = await upload(`documents/${file.name}`, file, {
        access: "public",
        contentType: "application/pdf",
        handleUploadUrl: "/api/blob/upload",
      });
      setUrl(blob.url);
      setStatus({ kind: "ok", text: `Загружено: ${file.name}` });
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : "Не удалось загрузить файл" });
    }
  }

  return (
    <div className="flex flex-col gap-1 text-sm font-medium">
      PDF-файл
      <input type="file" accept="application/pdf,.pdf" onChange={onChange} className="rounded border border-gray-300 bg-white px-3 py-2" />
      <input type="hidden" name="filePath" value={url} />
      {currentUrl && status.kind === "idle" && (
        <span className="text-xs font-normal text-gray-500">Текущий файл сохранится, если не выбирать новый.</span>
      )}
      {status.text && (
        <span className={`text-xs font-normal ${status.kind === "error" ? "text-red-600" : status.kind === "ok" ? "text-green-700" : "text-gray-500"}`}>
          {status.text}
        </span>
      )}
    </div>
  );
}
