import type { Corporation } from "@/lib/types";

export default function CorporationBusinessContext({
  corporation,
  connection,
}: {
  corporation: Corporation;
  connection: string;
}) {
  const businessSummary = corporation.gbizInfo?.businessSummary || corporation.description;
  const sourceUrl = corporation.gbizInfo?.sourceUrl || corporation.basicInfo?.sourceUrl;
  const sourceName = corporation.gbizInfo?.sourceName || corporation.basicInfo?.sourceName;

  return (
    <section className="grid overflow-hidden border border-outline-variant bg-surface-container-lowest md:grid-cols-[1.05fr_0.95fr]">
      <div className="p-5 md:p-6">
        <p className="text-xs font-extrabold tracking-[0.08em] text-accent">法人の業務</p>
        <h2 className="mt-2 text-xl font-extrabold text-primary">この法人は何をしている？</h2>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">
          {businessSummary ||
            "現在取り込んでいる公的法人情報では、具体的な業務概要を確認できていません。法人公式資料などの追加確認が必要です。"}
        </p>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center border border-outline-variant bg-white px-4 text-sm font-bold text-secondary transition hover:border-secondary"
          >
            {sourceName || "法人情報の出典"}を確認する ↗
          </a>
        ) : null}
      </div>
      <aside className="border-t border-outline-variant bg-secondary-fixed/45 p-5 md:border-l md:border-t-0 md:p-6">
        <p className="text-xs font-extrabold tracking-[0.08em] text-secondary">公表資料で確認できる接点</p>
        <p className="mt-3 text-sm font-medium leading-7 text-primary">{connection}</p>
        <p className="mt-3 border-l-2 border-outline px-3 text-xs leading-6 text-on-surface-variant">
          業務内容と人事の因果関係、採用理由、政策への影響は、公表資料で直接確認できない限り断定しません。
        </p>
      </aside>
    </section>
  );
}
