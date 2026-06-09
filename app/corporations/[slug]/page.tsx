import Link from "next/link";
import { Breadcrumb, HighlightStatCard, SourceLinkList, StatCard, TagChip } from "@/components/ui";
import { corporations, getCorporation, persons, records, sources } from "@/lib/static-content";

export function generateStaticParams() {
  return corporations.map((corporation) => ({ slug: corporation.slug }));
}

export default function CorporationDetailPage({ params }: { params: { slug: string } }) {
  const corporation = getCorporation(params.slug);
  const relatedPersons = persons.filter((person) => person.corporationSlug === corporation.slug);
  const relatedRecords = records.filter((record) => record.corporationSlug === corporation.slug);
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
  const relatedSourceIds = new Set(relatedRecords.map((record) => record.sourceId));
  const relatedSources = sources.filter((source) => relatedSourceIds.has(source.id));

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        items={[
          { label: "TOP", href: "/" },
          { label: "法人検索", href: "/corporations" },
          { label: corporation.name },
        ]}
      />

      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary md:text-4xl">{corporation.name}</h1>
          <p className="mt-2 text-base text-on-surface-variant">公表資料に基づく再就職情報</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {topMinistry && (
            <TagChip href={`/corporations?ministry=${encodeURIComponent(topMinistry.name)}`}>{topMinistry.name}</TagChip>
          )}
          <TagChip href={`/corporations?type=${encodeURIComponent(corporation.type)}`}>{corporation.type}</TagChip>
          <TagChip href={`/corporations?region=${encodeURIComponent(corporation.region)}`}>{corporation.region}</TagChip>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="公表再就職者数" value={relatedRecords.length} unit="人" />
        <StatCard
          label="最多出身省庁"
          value={topMinistry ? `${topMinistry.name}（${topMinistry.count}人）` : "該当なし"}
        />
        <StatCard label="平均待機日数" value={averageWaitDays} unit="日" />
        <HighlightStatCard label="退職翌日再就職" value={nextDayCount} unit="件" />
      </section>

      {corporation.basicInfo && (
        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="text-xl font-bold text-primary">法人基本情報</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            国税庁 法人番号公表サイトに基づく法人基本情報です。
          </p>
          <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {[
              ["法人番号", corporation.basicInfo.corporateNumber],
              ["正式名称", corporation.basicInfo.officialName],
              ["所在地", corporation.basicInfo.registeredAddress],
              ["都道府県", corporation.basicInfo.prefecture],
              ["市区町村", corporation.basicInfo.city],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm font-semibold text-on-surface-variant">{label}</dt>
                <dd className="mt-1 text-base text-primary">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-sm font-semibold text-on-surface-variant">出典</dt>
              <dd className="mt-1">
                <a
                  href={corporation.basicInfo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-secondary hover:underline"
                >
                  {corporation.basicInfo.sourceName}
                </a>
              </dd>
            </div>
          </dl>
        </section>
      )}

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

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-xl font-bold text-primary">元省庁の内訳</h2>
          {ministryBreakdown.length > 0 ? (
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
          ) : (
            <p className="text-sm text-on-surface-variant">集計対象の公表記録はありません。</p>
          )}
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

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-5 text-2xl font-bold text-primary">関連情報</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
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
                {ministryBreakdown.map((ministry) => (
                  <TagChip key={ministry.name} href={`/corporations?ministry=${encodeURIComponent(ministry.name)}`}>
                    {ministry.name}
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
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              本ページは政府・各省庁等の公表資料に基づき、官民の人材移動を中立的に整理したものです。特定の因果関係や不適切性を断定・示すものではありません。
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["法人情報を詳しく見る", corporation.name, `/corporations/${corporation.slug}`],
          ["省庁別の集計を見る", `${topMinistry?.name ?? "省庁"}の再就職統計を見る`, `/corporations?ministry=${encodeURIComponent(topMinistry?.name ?? "")}`],
          ["待機日数から探す", "退職翌日再就職ランキングを見る", "/rankings"],
          ["事例を比較する", "類似の再就職事例を見る", `/corporations?ministry=${encodeURIComponent(topMinistry?.name ?? "")}&waitDays=0`],
        ].map(([label, title, href]) => (
          <Link key={label} href={href} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 hover:border-secondary">
            <span className="text-sm font-semibold text-on-surface-variant">{label}</span>
            <p className="mt-1 font-bold text-primary">{title}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
