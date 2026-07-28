"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function InformationProvisionForm() {
  const [status, setStatus] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = String(formData.get("category") ?? "掲載内容の修正");
    const pageUrl = String(formData.get("pageUrl") ?? "").trim();
    const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
    const confirmedAt = String(formData.get("confirmedAt") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim();
    const message = [
      `種別: ${category}`,
      pageUrl ? `対象ページ: ${pageUrl}` : "",
      sourceUrl ? `一次資料URL: ${sourceUrl}` : "",
      confirmedAt ? `確認日: ${confirmedAt}` : "",
      details ? `内容:\n${details}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(message);
      trackEvent("prepare_information_provision", { category });
      setStatus("本文をコピーしました。メール等の連絡手段へ貼り付けてお送りください。");
    } catch {
      setStatus("本文をコピーできませんでした。内容を選択してコピーしてください。");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-5 max-w-2xl space-y-3 text-left">
      <p className="text-sm leading-relaxed text-on-surface-variant">
        このフォームはサイトへ個人情報を送信しません。内容を端末上で整形してコピーするためのテンプレートです。
      </p>
      <label className="block text-sm font-semibold text-on-surface-variant">
        種別
        <select name="category" className="mt-1 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface">
          <option>掲載内容の修正</option>
          <option>情報提供</option>
          <option>削除・非表示の相談</option>
        </select>
      </label>
      <label className="block text-sm font-semibold text-on-surface-variant">
        対象ページURL
        <input name="pageUrl" type="url" placeholder="https://amakudari.jp/..." className="mt-1 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface" />
      </label>
      <label className="block text-sm font-semibold text-on-surface-variant">
        一次資料URL
        <input name="sourceUrl" type="url" placeholder="https://www.go.jp/..." className="mt-1 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface" />
      </label>
      <label className="block text-sm font-semibold text-on-surface-variant">
        確認日
        <input name="confirmedAt" type="date" className="mt-1 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface" />
      </label>
      <label className="block text-sm font-semibold text-on-surface-variant">
        内容
        <textarea name="details" required rows={5} className="mt-1 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface" placeholder="確認できた事実と、確認したい点を記載してください。" />
      </label>
      <button type="submit" className="rounded bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90">
        連絡用の本文をコピーする
      </button>
      {status ? <p role="status" className="text-sm text-on-surface-variant">{status}</p> : null}
    </form>
  );
}
