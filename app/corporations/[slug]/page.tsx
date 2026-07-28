import Link from "next/link";
import type { Metadata } from "next";
import type { GbizInfoCollection } from "@/lib/types";
import { Breadcrumb, HighlightStatCard, SourceLinkList, StatCard, TagChip } from "@/components/ui";
import {
  corporations,
  getCorporation,
  getCorporationPersonHighlights,
  getSourceSummary,
  persons,
  records,
  sources,
} from "@/lib/static-content";

const numberFormatter = new Intl.NumberFormat("ja-JP");

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatCurrency(value: number) {
  return `${formatNumber(value)}円`;
}

function getFormerPositionLabels(value: string) {
  return value
    .split(/[、,]/)
    .map((label) => label.trim())
    .filter(Boolean);
}

function PublicDataCollection({
  title,
  collection,
  showAmount = false,
}: {
  title: string;
  collection: GbizInfoCollection;
  showAmount?: boolean;
}) {
  return (
    <div className="rounded border border-outline-variant bg-surface-container-low p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-bold text-primary">{title}</h3>
        <p className="text-sm font-semibold text-on-surface-variant">
          {formatNumber(collection.count)}件
          {collection.totalAmount !== undefined
            ? ` / 合計 ${formatCurrency(collection.totalAmount)}`
            : ""}
        </p>
      </div>
      <ul className="mt-3 space-y-3">
        {collection.examples.map((example, index) => (
          <li
            key={`${example.title}-${index}`}
            className="border-t border-outline-variant pt-3 first:border-t-0 first:pt-0"
          >
            <p className="text-sm font-semibold leading-relaxed">{example.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
              {[
                example.date || example.applicationDate,
                example.governmentDepartment,
                example.registrationNumber
                  ? `登録番号 ${example.registrationNumber}`
                  : "",
                showAmount && example.amount !== undefined
                  ? formatCurrency(example.amount)
                  : "",
              ]
                .filter(Boolean)
                .join(" / ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function generateStaticParams() {
  return corporations.map((corporation) => ({ slug: corporation.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const corporation = getCorporation(params.slug);
  const highlights = getCorporationPersonHighlights(corporation);
  const peopleDescription = highlights.people
    .map((person) => {
      const former =
        person.kind === "public-officer"
          ? person.formerPosition
          : `元${person.formerOrganization}`;
      return `${person.name}（${person.role}、${former}）`;
    })
    .join("、");
  const description =
    highlights.kind === "public-officer"
      ? `${corporation.name}の公表役員プロフィール。${peopleDescription}など、公式発表・gBizINFOに基づく公開情報を整理。`
      : highlights.kind === "reemployment-record"
        ? `${corporation.name}の公表再就職情報。${peopleDescription}など、国家公務員再就職状況の公表資料に基づく情報を整理。`
        : `${corporation.name}の法人情報を、公表資料と公的法人情報に基づいて整理。`;
  const title = `${corporation.name}の公表再就職情報`;
  return {
    title,
    alternates: { canonical: `/corporations/${params.slug}` },
    description,
    openGraph: {
      title,
      description,
      url: `/corporations/${params.slug}`,
      images: ["/ogp.png"],
    },
    twitter: { title, description, images: ["/ogp.png"] },
  };
}

export default function CorporationDetailPage({ params }: { params: { slug: string } }) {
  const corporation = getCorporation(params.slug);
  const relatedPersons = persons.filter((person) => person.corporationSlug === corporation.slug);
  const relatedRecords = records.filter((record) => record.corporationSlug === corporation.slug);
  const personHighlights = getCorporationPersonHighlights(corporation);
  const highlightSourceSummary = getSourceSummary(
    personHighlights.people.flatMap((person) => person.sourceIds),
  );
  const ministryCounts = relatedRecords.reduce<Map<string, number>>((counts, record) => {
    counts.set(record.fromMinistry, (counts.get(record.fromMinistry) ?? 0) + 1);
    return counts;
  }, new Map());
  const ministryBreakdown = Array.from(ministryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "ja"));
  const topMinistry = ministryBreakdown[0];
  const averageWaitDays =
    relatedRecords.length > 0
      ? Math.round(
          (relatedRecords.reduce((total, record) => total + record.waitingDays, 0) /
            relatedRecords.length) *
            10,
        ) / 10
      : 0;
  const nextDayCount = relatedRecords.filter((record) => record.waitingDays === 0).length;
  const waitDistribution = [
    {
      label: "退職翌日",
      value: relatedRecords.filter((record) => record.waitingDays === 0).length,
    },
    {
      label: "7日以内",
      value: relatedRecords.filter(
        (record) => record.waitingDays >= 1 && record.waitingDays <= 7,
      ).length,
    },
    {
      label: "30日以内",
      value: relatedRecords.filter(
        (record) => record.waitingDays >= 8 && record.waitingDays <= 30,
      ).length,
    },
    {
      label: "31日以上",
      value: relatedRecords.filter((record) => record.waitingDays >= 31).length,
    },
  ];
  const maxWaitDistributionCount = Math.max(
    1,
    ...waitDistribution.map((item) => item.value),
  );
  const relatedSourceIds = new Set([
    ...corporation.sources,
    ...relatedRecords.map((record) => record.sourceId),
    ...corporation.publicOfficers.flatMap((officer) => officer.sourceIds),
  ]);
  const relatedSources = sources.filter((source) => relatedSourceIds.has(source.id));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "TOP", href: "/" },
          { label: "法人検索", href: "/corporations" },
          { label: corporation.name },
        ]}
      />

      <section className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary md:text-4xl">{corporation.name}</h1>
          <p className="mt-1.5 text-base leading-snug text-on-surface-variant">
            {corporation.description || "公表資料に基づく法人・人材情報"}
          </p>
          <p className="mt-1.5 max-w-4xl text-sm leading-snug text-on-surface-variant">
            {corporation.publicOfficers.length > 0
              ? `${corporation.name}について、公的法人情報と同社が公表している役員・経歴情報をもとに、法人情報および元行政機関出身者の就任情報を整理しています。表示内容は公開情報に基づく記録整理であり、違法性や責任を断定するものではありません。`
              : `このページでは、${corporation.name}に関する公表再就職記録を法人単位で整理し、元府省庁、再就職者数、再就職時期、出典資料を確認できるようにしています。表示内容は公表資料の記録を整理したものです。`}
          </p>
        </div>
        {personHighlights.people.length > 0 && (
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-secondary">
                  {personHighlights.kind === "public-officer"
                    ? "公式発表に基づく役員情報"
                    : "公表資料に基づく再就職情報"}
                </p>
                <h2 className="mt-1 text-xl font-bold text-primary">
                  {personHighlights.kind === "public-officer"
                    ? `公表役員プロフィール ${personHighlights.total}人`
                    : `公表再就職者 ${personHighlights.total}人`}
                </h2>
              </div>
              {personHighlights.remaining > 0 && (
                <p className="text-sm font-semibold text-on-surface-variant">
                  ほか{personHighlights.remaining}人
                </p>
              )}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {personHighlights.people.map((person) => (
                <article
                  key={`${person.kind}-${person.slug}`}
                  className="rounded border border-outline-variant bg-surface p-3.5"
                >
                  <h3 className="text-xl font-bold leading-tight text-primary">
                    <Link href={person.href} className="hover:underline">
                      {person.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm font-medium text-on-surface-variant">
                    {person.role}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {getFormerPositionLabels(
                      person.formerPosition || `元${person.formerOrganization}`,
                    ).map((label) => (
                      <span
                        key={label}
                        className="inline-flex max-w-full rounded border border-outline-variant bg-surface-container-low px-2 py-1 text-sm font-semibold leading-tight text-primary"
                      >
                        <span className="line-clamp-2">{label}</span>
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            {highlightSourceSummary && (
              <p className="mt-2 text-xs text-on-surface-variant">
                出典：{highlightSourceSummary}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {topMinistry && (
            <TagChip href={`/corporations?ministry=${encodeURIComponent(topMinistry.name)}`}>{topMinistry.name}</TagChip>
          )}
          <TagChip href={`/corporations?type=${encodeURIComponent(corporation.type)}`}>{corporation.type}</TagChip>
          <TagChip href={`/corporations?region=${encodeURIComponent(corporation.region)}`}>{corporation.region}</TagChip>
        </div>
      </section>

      {relatedRecords.length > 0 ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="公表再就職者数" value={relatedRecords.length} unit="人" />
          <StatCard
            label="最多出身省庁"
            value={topMinistry ? `${topMinistry.name}（${topMinistry.count}人）` : "該当なし"}
          />
          <StatCard label="平均待機日数" value={averageWaitDays} unit="日" />
          <HighlightStatCard label="退職翌日再就職" value={nextDayCount} unit="件" />
        </section>
      ) : corporation.publicOfficers.length > 0 ? (
        <p className="border-l-2 border-outline-variant px-3 py-1.5 text-xs leading-relaxed text-on-surface-variant">
          国家公務員再就職状況の公表における該当記録は確認されていません。このページでは、法人公式発表などに基づく公表役員プロフィールを表示しています。
        </p>
      ) : null}

      {(corporation.basicInfo || corporation.gbizInfo) && (
        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-xl font-bold text-primary">法人概要</h2>
          <p className="mt-1 max-w-4xl text-sm leading-relaxed text-on-surface-variant">
            gBizINFO・法人番号公表サイト・法人公式発表などの公開情報を整理しています。再就職情報とは独立した公的法人情報です。
          </p>
          {corporation.gbizInfo?.businessSummary && (
            <div className="mt-3 rounded border border-outline-variant bg-surface p-3">
              <p className="text-sm font-semibold text-on-surface-variant">事業概要</p>
              <p className="mt-1 text-sm leading-relaxed">
                {corporation.gbizInfo.businessSummary}
              </p>
            </div>
          )}
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 md:grid-cols-2">
            {corporation.gbizInfo?.representativeName && (
              <div>
                <dt className="text-sm font-semibold text-on-surface-variant">代表者</dt>
                <dd className="mt-0.5 text-sm text-primary">
                  {corporation.gbizInfo.representativeName}
                </dd>
              </div>
            )}
            {corporation.gbizInfo?.employeeNumber !== undefined && (
              <div>
                <dt className="text-sm font-semibold text-on-surface-variant">従業員数</dt>
                <dd className="mt-0.5 text-sm text-primary">
                  {formatNumber(corporation.gbizInfo.employeeNumber)}人
                </dd>
              </div>
            )}
            {corporation.gbizInfo?.establishmentDate && (
              <div>
                <dt className="text-sm font-semibold text-on-surface-variant">設立日</dt>
                <dd className="mt-0.5 text-sm text-primary">
                  {corporation.gbizInfo.establishmentDate}
                </dd>
              </div>
            )}
            {corporation.gbizInfo?.capitalStock !== undefined && (
              <div>
                <dt className="text-sm font-semibold text-on-surface-variant">資本金</dt>
                <dd className="mt-0.5 text-sm text-primary">
                  {formatCurrency(corporation.gbizInfo.capitalStock)}
                </dd>
              </div>
            )}
            {corporation.basicInfo &&
              [
                ["所在地", corporation.basicInfo.registeredAddress],
                ["都道府県", corporation.basicInfo.prefecture],
                ["市区町村", corporation.basicInfo.city],
                ["法人番号", corporation.basicInfo.corporateNumber],
                ["正式名称", corporation.basicInfo.officialName],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm font-semibold text-on-surface-variant">{label}</dt>
                  <dd className="mt-0.5 text-sm text-primary">{value}</dd>
                </div>
              ))}
          </dl>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-outline-variant pt-3 text-sm">
            {corporation.basicInfo && (
              <a
                href={corporation.basicInfo.sourceUrl}
                target="_blank"
                rel="noreferrer"
                data-analytics-event="source_link"
                data-source-type="corporate_registry"
                data-analytics-location="corporation_overview"
                className="font-semibold text-secondary hover:underline"
              >
                出典：{corporation.basicInfo.sourceName}
              </a>
            )}
            {corporation.gbizInfo &&
              corporation.gbizInfo.sourceUrl !== corporation.basicInfo?.sourceUrl && (
                <a
                  href={corporation.gbizInfo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-analytics-event="source_link"
                  data-source-type="gbizinfo"
                  data-analytics-location="corporation_overview"
                  className="font-semibold text-secondary hover:underline"
                >
                  出典：{corporation.gbizInfo.sourceName}
                </a>
              )}
          </div>
        </section>
      )}

      {corporation.gbizInfo &&
        (corporation.gbizInfo.subsidies ||
          corporation.gbizInfo.procurements ||
          corporation.gbizInfo.certifications ||
          corporation.gbizInfo.awards ||
          corporation.gbizInfo.patents ||
          corporation.gbizInfo.finance ||
          corporation.gbizInfo.workplaceInfo) && (
        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-primary">公的法人情報の詳細</h2>
              <p className="mt-1 max-w-4xl text-sm leading-relaxed text-on-surface-variant">
                gBizINFOで公開されている補助金・調達・認定などの情報です。再就職情報とは独立した公的法人情報として表示しています。
              </p>
            </div>
            <a
              href={corporation.gbizInfo.sourceUrl}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="source_link"
              data-source-type="gbizinfo"
              data-analytics-location="corporation_public_info"
              className="shrink-0 text-sm font-semibold text-secondary hover:underline"
            >
              gBizINFOで確認
            </a>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {corporation.gbizInfo.subsidies && (
              <PublicDataCollection
                title="補助金"
                collection={corporation.gbizInfo.subsidies}
                showAmount
              />
            )}
            {corporation.gbizInfo.procurements && (
              <PublicDataCollection
                title="調達"
                collection={corporation.gbizInfo.procurements}
                showAmount
              />
            )}
            {corporation.gbizInfo.certifications && (
              <PublicDataCollection
                title="認定・届出"
                collection={corporation.gbizInfo.certifications}
              />
            )}
            {corporation.gbizInfo.awards && (
              <PublicDataCollection
                title="表彰"
                collection={corporation.gbizInfo.awards}
              />
            )}
            {corporation.gbizInfo.patents && (
              <PublicDataCollection
                title="特許"
                collection={corporation.gbizInfo.patents}
              />
            )}
          </div>

          {corporation.gbizInfo.finance && (
            <div className="mt-4 rounded border border-outline-variant bg-surface-container-low p-4">
              <h3 className="font-bold text-primary">財務情報</h3>
              {corporation.gbizInfo.finance.fiscalYear && (
                <p className="mt-1 text-xs text-on-surface-variant">
                  {corporation.gbizInfo.finance.fiscalYear}
                </p>
              )}
              <dl className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["売上・営業収益等", corporation.gbizInfo.finance.latestPeriod?.revenue],
                  ["経常損益", corporation.gbizInfo.finance.latestPeriod?.ordinaryIncome],
                  ["当期純損益", corporation.gbizInfo.finance.latestPeriod?.netIncome],
                  ["総資産", corporation.gbizInfo.finance.latestPeriod?.totalAssets],
                ].map(([label, value]) =>
                  typeof value === "number" ? (
                    <div key={label}>
                      <dt className="text-xs font-semibold text-on-surface-variant">{label}</dt>
                      <dd className="mt-1 text-sm font-bold">{formatCurrency(value)}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </div>
          )}

          {corporation.gbizInfo.workplaceInfo && (
            <div className="mt-4 rounded border border-outline-variant bg-surface-container-low p-4">
              <h3 className="font-bold text-primary">職場情報</h3>
              <dl className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  [
                    "平均勤続年数",
                    corporation.gbizInfo.workplaceInfo.averageContinuousServiceYears,
                    "年",
                  ],
                  [
                    "男性の平均勤続年数",
                    corporation.gbizInfo.workplaceInfo
                      .averageContinuousServiceYearsMale,
                    "年",
                  ],
                  [
                    "女性の平均勤続年数",
                    corporation.gbizInfo.workplaceInfo
                      .averageContinuousServiceYearsFemale,
                    "年",
                  ],
                  [
                    "女性労働者比率",
                    corporation.gbizInfo.workplaceInfo.femaleWorkersProportion,
                    "%",
                  ],
                  [
                    "月平均所定外労働時間",
                    corporation.gbizInfo.workplaceInfo.monthlyAverageOvertimeHours,
                    "時間",
                  ],
                ].map(([label, value, unit]) =>
                  typeof value === "number" ? (
                    <div key={label}>
                      <dt className="text-xs font-semibold text-on-surface-variant">{label}</dt>
                      <dd className="mt-1 text-sm font-bold">
                        {formatNumber(value)}
                        {unit}
                      </dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </div>
          )}

          <p className="mt-4 text-xs text-on-surface-variant">
            取得日: {corporation.gbizInfo.fetchedAt.slice(0, 10)}
          </p>
        </section>
      )}

      {corporation.publicOfficers.length > 0 && (
        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-2xl font-bold text-primary">公表役員情報</h2>
          <p className="mt-1.5 max-w-4xl text-sm leading-snug text-on-surface-variant">
            同社の公式発表・会社情報に掲載された元行政機関出身者の役員プロフィールです。国家公務員の再就職状況公表資料に基づく記録とは区別して表示しています。
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {corporation.publicOfficers.map((officer) => (
              <article key={officer.slug} className="rounded border border-outline-variant bg-surface p-3">
                <h3 className="text-xl font-bold leading-tight text-primary">
                  <Link href={`/public-officers/${officer.slug}`} className="hover:underline">
                    {officer.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm font-medium text-on-surface-variant">
                  {officer.role}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {getFormerPositionLabels(officer.formerPosition).map((label) => (
                    <span
                      key={label}
                      className="inline-flex rounded border border-outline-variant bg-surface-container-low px-2 py-1 text-sm font-semibold leading-tight text-primary"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-sm leading-snug text-on-surface-variant">{officer.profile}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {relatedPersons.length > 0 ? (
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-primary">公表再就職者一覧</h2>
        <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface-container-lowest">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">元省庁</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">離職時官職</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">氏名</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">再就職先での地位</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">離職日</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">再就職日</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">待機日数</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">出典</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {relatedPersons.map((person) => (
                <tr key={person.slug} className="hover:bg-surface-container-low">
                  <td className="px-4 py-4 text-sm">{person.ministry}</td>
                  <td className="px-4 py-4 text-sm">{person.formerPosition}</td>
                  <td className="px-4 py-4 text-sm font-bold">
                    <Link href={`/persons/${person.slug}`} className="text-secondary hover:underline">
                      {person.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm">{person.newPosition}</td>
                  <td className="px-4 py-4 font-mono text-sm">{person.retiredAt}</td>
                  <td className="px-4 py-4 font-mono text-sm">{person.reemployedAt}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={person.waitDays === 0 ? "rounded-full bg-secondary-fixed px-3 py-1 text-sm font-bold text-secondary" : "text-sm"}>
                      {person.waitDays}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant">{person.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : corporation.publicOfficers.length === 0 ? (
        <p className="text-sm leading-relaxed text-on-surface-variant">
          国家公務員再就職状況の公表における該当記録は確認されていません。
        </p>
      ) : null}

      {relatedRecords.length > 0 && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <h2 className="mb-4 text-xl font-bold text-primary">元省庁の内訳</h2>
            <div className="space-y-3">
              {ministryBreakdown.map((ministry) => (
                <div key={ministry.name}>
                  <div className="mb-1 flex justify-between text-sm font-semibold">
                    <span>{ministry.name}</span>
                    <span>{ministry.count}人</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container">
                    <div
                      className="h-2 rounded-full bg-secondary"
                      style={{ width: `${(ministry.count / relatedRecords.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <h2 className="mb-4 text-xl font-bold text-primary">待機日数の分布</h2>
            <div className="flex h-52 items-end justify-between gap-4 px-2 pt-6">
              {waitDistribution.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end">
                    <div
                      className="relative w-full rounded-t bg-secondary-container"
                      style={{ height: `${(item.value / maxWaitDistributionCount) * 100}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold">{item.value}</span>
                    </div>
                  </div>
                  <span className="text-center text-xs font-semibold text-on-surface-variant">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
        <h2 className="mb-3 text-2xl font-bold text-primary">関連情報</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div>
              <h3 className="mb-2 text-sm font-bold text-on-surface-variant">関連話題</h3>
              <div className="flex flex-wrap gap-2">
                {corporation.topics.map((label) => (
                  <TagChip key={label} href={`/corporations?topic=${encodeURIComponent(label)}`}>
                    {label}
                  </TagChip>
                ))}
                {corporation.topics.length === 0 && (
                  <span className="text-sm text-on-surface-variant">関連話題は登録されていません。</span>
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-on-surface-variant">関連省庁</h3>
              <div className="flex flex-wrap gap-2">
                {corporation.ministries.filter(Boolean).map((ministry) => (
                  <TagChip key={ministry} href={`/corporations?ministry=${encodeURIComponent(ministry)}`}>
                    {ministry}
                  </TagChip>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold text-on-surface-variant">出典資料</h3>
            <SourceLinkList
              links={relatedSources.map((source) => ({
                label: `${source.publisher}：${source.title}`,
                href: source.url,
              }))}
            />
            <p className="mt-3 text-xs leading-snug text-on-surface-variant">
              本ページは政府・各省庁等の公表資料に基づき、官民の人材移動を中立的に整理したものです。特定の因果関係や不適切性を断定・示すものではありません。
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["法人情報を詳しく見る", corporation.name, `/corporations/${corporation.slug}`],
          ["省庁別の集計を見る", `${topMinistry?.name ?? "省庁"}の再就職統計を見る`, `/corporations?ministry=${encodeURIComponent(topMinistry?.name ?? "")}`],
          ["待機日数から探す", "退職翌日再就職ランキングを見る", "/rankings"],
          ["事例を比較する", "類似の再就職事例を見る", `/corporations?ministry=${encodeURIComponent(topMinistry?.name ?? "")}&waitDays=0`],
        ].map(([label, title, href]) => (
          <Link key={label} href={href} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3 hover:border-secondary">
            <span className="text-sm font-semibold text-on-surface-variant">{label}</span>
            <p className="mt-1 font-bold text-primary">{title}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
