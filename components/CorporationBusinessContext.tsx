import type { Corporation } from "@/lib/types";
import { getCorporationEditorialContext } from "@/lib/corporation-contexts";

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
  const businessSummary =
    editorialContext?.business.summary || corporation.gbizInfo?.businessSummary || corporation.description;
  const sourceUrl =
    editorialContext?.business.officialWebsite.url ||
    corporation.gbizInfo?.sourceUrl ||
    corporation.basicInfo?.sourceUrl;
  const sourceName =
    editorialContext?.business.officialWebsite.label ||
    corporation.gbizInfo?.sourceName ||
    corporation.basicInfo?.sourceName;
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
              <h2 className="mt-2 text-2xl font-extrabold text-primary">{corporation.name}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant">
                法人公式サイトと公的データを照合できた業務情報から順次掲載しています。再就職記録の内容は、この業務情報とは分けて公表資料から確認できます。
              </p>
            </>
          )}
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-event="source_link"
              data-source-type={editorialContext ? "official_website" : "corporate_registry"}
              data-analytics-location="corporation_business"
              className="mt-5 inline-flex min-h-11 items-center bg-primary px-5 text-sm font-extrabold text-white transition hover:bg-primary/90"
            >
              {sourceName || "法人情報の出典"}を見る ↗
            </a>
          ) : null}
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
            <p className="text-xs font-extrabold tracking-[0.08em] text-secondary">事業から確認できる行政との関係</p>
            <h2 className="mt-2 text-xl font-extrabold text-primary">どこが制度上の接点になる？</h2>
            <p className="mt-2 text-sm leading-7 text-on-surface-variant">
              人脈や働きかけの推測ではなく、事業を運営するうえで関係する制度と所管を整理しています。
            </p>
          </div>
          <div className="mt-5 grid gap-px overflow-hidden border border-secondary/20 bg-secondary/20 md:grid-cols-2">
            {editorialContext.regulatoryTouchpoints.map((touchpoint) => (
              <article key={`${touchpoint.agency}-${touchpoint.area}`} className="bg-white p-5">
                <p className="text-xs font-extrabold text-secondary">{touchpoint.agency}</p>
                <h3 className="mt-1 text-base font-extrabold text-primary">{touchpoint.area}</h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{touchpoint.description}</p>
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
          <div className="mt-4 border-l-4 border-outline bg-white/70 px-4 py-3">
            <p className="text-xs font-extrabold text-primary">公表資料だけでは確認できないこと</p>
            <ul className="mt-2 space-y-1 text-xs leading-6 text-on-surface-variant">
              {editorialContext.limitations.map((limitation) => (
                <li key={limitation}>・{limitation}</li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-right text-xs text-on-surface-variant">確認日：{editorialContext.checkedAt}</p>
        </div>
      ) : (
        <p className="border-t border-outline-variant bg-surface-container-low px-5 py-4 text-xs leading-6 text-on-surface-variant md:px-7">
          業務内容と人事の因果関係、採用理由、政策への影響は、公表資料で直接確認できない限り断定しません。
        </p>
      )}
    </section>
  );
}
