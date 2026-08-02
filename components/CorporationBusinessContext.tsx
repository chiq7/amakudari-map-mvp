import type { Corporation } from "@/lib/types";

export default function CorporationBusinessContext({
  corporation,
  recordCount,
  publicOfficerCount,
  sourceCount,
  connection,
}: {
  corporation: Corporation;
  recordCount?: number;
  publicOfficerCount?: number;
  sourceCount?: number;
  connection?: string;
}) {
  const businessSummary = corporation.gbizInfo?.businessSummary || corporation.description;
  const sourceUrl = corporation.gbizInfo?.sourceUrl || corporation.basicInfo?.sourceUrl;
  const sourceName = corporation.gbizInfo?.sourceName || corporation.basicInfo?.sourceName;
  const hasBusinessSummary = Boolean(businessSummary?.trim());

  return (
    <section className="grid overflow-hidden border border-outline-variant bg-surface-container-lowest md:grid-cols-[1.05fr_0.95fr]">
      <div className="p-5 md:p-6">
        <p className="text-xs font-extrabold tracking-[0.08em] text-accent">法人の業務</p>
        {hasBusinessSummary ? (
          <>
            <h2 className="mt-2 text-xl font-extrabold text-primary">この法人は何をしている？</h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{businessSummary}</p>
          </>
        ) : (
          <div className="mt-3 border-l-4 border-outline bg-surface-container-low px-4 py-3">
            <p className="text-xs font-extrabold text-on-surface-variant">業務概要は確認中</p>
            <h2 className="mt-1 text-lg font-extrabold leading-7 text-primary">
              公的データから具体的な業務内容を確認できていません
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              これは業務情報の未整備を示す表示です。下に掲載する人物・再就職記録の確認状況とは分けて扱っています。
            </p>
          </div>
        )}
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
        <p className="text-xs font-extrabold tracking-[0.08em] text-secondary">
          {recordCount !== undefined ? "このページの掲載範囲" : "公表資料で確認できる接点"}
        </p>
        {recordCount !== undefined ? (
          <dl className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["再就職記録", recordCount, "件"],
              ["公表役員", publicOfficerCount ?? 0, "人"],
              ["出典資料", sourceCount ?? 0, "件"],
            ].map(([label, value, unit]) => (
              <div key={label}>
                <dt className="text-[11px] font-bold leading-4 text-on-surface-variant">{label}</dt>
                <dd className="mt-1 flex items-baseline gap-1 text-primary">
                  <span className="text-2xl font-extrabold">{value}</span>
                  <span className="text-xs font-bold">{unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm font-medium leading-7 text-primary">{connection}</p>
        )}
        <p className="mt-4 border-t border-secondary/15 pt-4 text-xs leading-6 text-on-surface-variant">
          業務内容と人事の因果関係、採用理由、政策への影響は、公表資料で直接確認できない限り断定しません。
        </p>
      </aside>
    </section>
  );
}
