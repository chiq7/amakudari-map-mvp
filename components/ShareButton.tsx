"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function ShareButton({ title }: { title: string }) {
  const [message, setMessage] = useState("");

  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        trackEvent("share_content", { share_method: "native_share" });
        return;
      }

      await navigator.clipboard.writeText(url);
      trackEvent("share_content", { share_method: "copy_link" });
      setMessage("ページURLをコピーしました");
      window.setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        setMessage("共有できませんでした");
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm font-semibold text-secondary hover:border-secondary"
      >
        共有
      </button>
      {message ? <span className="text-xs text-on-surface-variant">{message}</span> : null}
    </div>
  );
}
