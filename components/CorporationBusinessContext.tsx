import type { Corporation } from "@/lib/types";
import { getCorporationEditorialContext } from "@/lib/corporation-contexts";

function formatPublicSubsidyAmount(value: number) {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toLocaleString("ja-JP", {
      maximumFractionDigits: 1,
    })}億円`;
  }
  if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString("ja-JP")}万円`;
  return `${value.toLocaleString("ja-JP")}円`;
}

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
  const editorialContext = getCorporationEditorialContext(corporation.slug);
  const officialWebsite =
    editorialContext?.business.officialWebsite || corporation.gbizInfo?.officialWebsite;
  const businessSummary =
    editorialContext?.business.summary || corporation.gbizInfo?.businessSummary || corporation.description;
  const publicSubsidyTotal = corporation.gbizInfo?.subsidies?.totalAmount;
  const hasBusinessSummary = Boolean(businessSummary?.trim());
  const showSidePanel = recordCount !== undefined || Boolean(connection);

  return (
    <section className="overflow-hidden border border-outline-variant border-t-4 border-t-accent bg-surface-container-lowest">
      <div className={showSidePanel ? "grid md:grid-cols-[1.25fr_0.75fr]" : "grid"}>
        <div className="p-5 md:p-7">
          <p className="text-xs font-extrabold tracking-[0.08em] text-accent">会社の仕事を先に理解する</p>
          {hasBusinessSummary ? (
            <>
              <h2 className="mt-2 text-2xl font-extrabold text-primary">この法人は何をしている？</h2>
              <p className="mt-4 max-w-3xl text-base font-medium leading-8 text-primary">{businessSummary}</p>
              {editorialContext?.business.details.length ? (
                <ul className="mt-4 space-y-2 border-l-2 border-accent/50 pl-4 text-sm leading-7 text-on-surface-variant">
                  {editorialContext.business.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-extrabold text-primary">公的データで確認できる法人情報</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant">
                {corporation.basicInfo
                  ? `${corporation.basicInfo.officialName}（法人番号 ${corporation.basicInfo.corporateNumber}）として登録されていることを確認できます。`
                  : "法人名と再就職記録は公表資料で確認できます。"}
                業務内容は、法人公式または公的データで確認できた範囲だけを追加します。
              </p>
            </>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {officialWebsite ? (
              <a
                href={officialWebsite.url}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="source_link"
                data-source-type="official_website"
                data-analytics-location="corporation_business"
                className="inline-flex min-h-11 items-center bg-primary px-5 text-sm font-extrabold text-white transition hover:bg-primary/90"
              >
                法人公式ページを見る ↗
              </a>
            ) : null}
            {corporation.gbizInfo?.sourceUrl ? (
              <a
                href={corporation.gbizInfo.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="source_link"
                data-source-type="corporate_registry"
                data-analytics-location="corporation_business"
                className="inline-flex min-h-11 items-center border border-outline bg-white px-5 text-sm font-extrabold text-primary transition hover:bg-surface-container-low"
              >
                gBizINFOの法人情報を見る ↗
              </a>
            ) : corporation.basicInfo?.sourceUrl ? (
            <a
              href={corporation.basicInfo.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-event="source_link"
              data-source-type="corporate_registry"
              data-analytics-location="corporation_business"
              className="inline-flex min-h-11 items-center border border-outline bg-white px-5 text-sm font-extrabold text-primary transition hover:bg-surface-container-low"
            >
              国税庁の法人情報を見る ↗
            </a>
            ) : null}
          </div>
        </div>

        {showSidePanel ? <aside className="border-t border-outline-variant bg-surface-container-low p-5 md:border-l md:border-t-0 md:p-7">
          <p className="text-xs font-extrabold tracking-[0.08em] text-secondary">
            {recordCount !== undefined ? "このページで確認できる数" : "公表資料で確認できる接点"}
          </p>
          {recordCount !== undefined ? (
            <dl className="mt-5 grid grid-cols-3 gap-3 md:grid-cols-1 md:gap-5">
              {[
                ["公表役員", publicOfficerCount ?? 0, "人"],
                ["再就職記録", recordCount, "件"],
                ["出典資料", sourceCount ?? 0, "件"],
                ...(publicSubsidyTotal !== undefined
                  ? [["公表補助金額", formatPublicSubsidyAmount(publicSubsidyTotal), ""]]
                  : []),
              ].map(([label, value, unit]) => (
                <div key={label} className="border-b border-outline-variant pb-3 last:border-b-0">
                  <dt className="text-xs font-bold leading-4 text-on-surface-variant">{label}</dt>
                  <dd className="mt-1 flex items-baseline gap-1 text-primary">
                    <span className="text-3xl font-extrabold">{value}</span>
                    <span className="text-xs font-bold">{unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm font-medium leading-7 text-primary">{connection}</p>
          )}
        </aside> : null}
      </div>

      {editorialContext?.regulatoryTouchpoints.length ? (
        <div className="border-t border-outline-variant bg-secondary-fixed/20 p-5 md:p-7">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold tracking-[0.08em] text-secondary">会社の仕事 × 元の行政領域</p>
            <h2 className="mt-2 text-xl font-extrabold text-primary">この人事記録を読むとき、どこを見ればいい？</h2>
            {connection ? (
              <p className="mt-3 border-l-4 border-secondary bg-white px-4 py-3 text-sm font-bold leading-7 text-primary">
                公表された動き：{connection}
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-7 text-on-surface-variant">
              法人の仕事と、元の行政機関が扱う制度・予算・許認可などが重なる場所を整理しています。ここを見ると、公開資料で次に確認すべき資料の入口が分かります。
            </p>
          </div>
          <div className="mt-5 grid gap-px overflow-hidden border border-secondary/20 bg-secondary/20 md:grid-cols-2">
            {editorialContext.regulatoryTouchpoints.map((touchpoint) => (
              <article key={`${touchpoint.agency}-${touchpoint.area}`} className="bg-white p-5">
                <p className="text-xs font-extrabold text-secondary">行政側：{touchpoint.agency}</p>
                <h3 className="mt-1 text-base font-extrabold text-primary">重なる仕事：{touchpoint.area}</h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant"><span className="font-extrabold text-primary">見るポイント：</span>{touchpoint.description}</p>
                <a
                  href={touchpoint.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics-event="source_link"
                  data-source-type="government_primary_source"
                  data-analytics-location="corporation_regulatory_context"
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-secondary hover:underline"
                >
                  {touchpoint.sourceTitle} ↗
                </a>
              </article>
            ))}
          </div>
          <p className="mt-3 text-right text-xs text-on-surface-variant">確認日：{editorialContext.checkedAt}</p>
        </div>
      ) : null}
    </section>
  );
}
