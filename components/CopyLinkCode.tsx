"use client";

import { useRef, useState } from "react";

const linkCode = '<a href="https://amakudari.jp/">天下りマップ</a>';

export default function CopyLinkCode() {
  const field = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(linkCode);
      setStatus("リンク用HTMLをコピーしました。");
    } catch {
      field.current?.focus();
      field.current?.select();
      setStatus("選択したコードを端末のコピー操作でコピーしてください。");
    }
  }

  return <div className="mt-3 grid gap-2">
    <textarea ref={field} value={linkCode} readOnly rows={2} aria-label="紹介用のリンクHTML" className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 font-mono text-sm text-on-surface" />
    <button type="button" onClick={copy} className="min-h-11 w-fit rounded-lg bg-primary px-4 text-sm font-bold text-white">リンク用HTMLをコピー</button>
    <p role="status" className="text-sm text-on-surface-variant">{status}</p>
  </div>;
}
