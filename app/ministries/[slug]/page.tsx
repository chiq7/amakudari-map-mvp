import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumb } from "@/components/ui";
import ShareButton from "@/components/ShareButton";
import MinistryRecordFinder from "@/components/MinistryRecordFinder";
import { corporations, records, sources } from "@/lib/static-content";
import { formatDate, isSelfEmployed } from "@/lib/display-text";
import { ministryPages } from "@/lib/ministry-pages";
import { newsArticles } from "@/lib/news";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getMinistry(slug: string) {
  return ministryPages.find((ministry) => ministry.slug === slug);
}

export function generateStaticParams() {
  return ministryPages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const ministry = getMinistry(params.slug);
  if (!ministry) return {};

  const title = `${ministry.name}の天下り先一覧｜再就職先と公表記録`;
  const description = ministry.slug === "meti"
    ? "経済産業省出身者の再就職先を、就職年度・法人名・人物名で絞り込めます。公表記録ごとに就職日と就任時の役職を確認できます。"
    : `${ministry.name}出身者の再就職先を、内閣官房の公表記録から一覧で確認できます。就任年度・法人種別・離職時の官職で絞り込み、再就職先と就任時の役職を比較できます。`;

  return pageMetadata(title, description, `/ministries/${ministry.slug}`);
}

export default async function MinistryPage(props: PageProps) {
  const params = await props.params;
  const ministry = getMinistry(params.slug);
  if (!ministry) notFound();

  const ministryRecords = records.filter((record) => record.fromMinistry === ministry.name);
  const personCount = new Set(ministryRecords.map((record) => record.personSlug)).size;
  const entries = [...ministryRecords]
    .sort((left, right) => right.reemploymentDate.localeCompare(left.reemploymentDate) || left.name.localeCompare(right.name, "ja"))
    .map((record) => ({
      id: record.rawId,
      name: record.name,
      personSlug: record.personSlug,
      corporation: record.corporationName,
      corporationSlug: record.corporationSlug,
      aliases: corporations.find((corporation) => corporation.slug === record.corporationSlug)?.aliases ?? [],
      corporationType: corporations.find((corporation) => corporation.slug === record.corporationSlug)?.type ?? "未分類",
      date: record.reemploymentDate,
      position: record.newPosition,
      formerPosition: record.previousPosition,
    }));
  const ids = new Set(ministryRecords.map((record) => record.sourceId));
  const publishedSources = sources.filter((source) => ids.has(source.id));
  const latestPublished = publishedSources.map((source) => source.publishedAt).filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)).sort().at(-1);
  const recordsByCorporation = new Map<string, typeof ministryRecords>();
  ministryRecords.forEach((record) => {
    const group = recordsByCorporation.get(record.corporationSlug) ?? [];
    group.push(record);
    recordsByCorporation.set(record.corporationSlug, group);
  });
  const matchingCorporations = Array.from(recordsByCorporation.entries())
    .flatMap(([corporationSlug, group]) => {
      const corporation = corporations.find((candidate) => candidate.slug === corporationSlug);
      if (!corporation) return [];
      const people = Array.from(new Map(group.map((record) => [record.personSlug, record.name])),
        ([slug, name]) => ({ slug, name }));
      const days = Math.round(group.reduce((sum, record) => sum + record.waitingDays, 0) / group.length);
      return [{ corporation, people, count: group.length, waitingLabel: `${group.length > 1 ? "平均" : ""}${days}日` }];
    })
    .sort((left, right) =>
      Number(isSelfEmployed(left.corporation.name)) - Number(isSelfEmployed(right.corporation.name)) ||
      right.count - left.count || left.corporation.name.localeCompare(right.corporation.name, "ja"));
  const totalNextDay = ministryRecords.filter((record) => record.waitingDays === 1).length;
  const totalWithin30Days = ministryRecords.filter((record) => record.waitingDays <= 30).length;
  const corporationTypeCounts = Array.from(
    matchingCorporations.reduce((counts, { corporation, count }) => {
      const type = corporation.type?.trim() || "未分類";
      counts.set(type, (counts.get(type) ?? 0) + count);
      return counts;
    }, new Map<string, number>()),
  )
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "ja"))
    .slice(0, 4);
  const relatedMinistries = ministryPages
    .filter((candidate) => candidate.slug !== ministry.slug)
    .sort((left, right) => {
      const priority = ["finance", "mlit"];
      const leftPriority = priority.indexOf(left.slug);
      const rightPriority = priority.indexOf(right.slug);
      return (leftPriority === -1 ? priority.length : leftPriority) - (rightPriority === -1 ? priority.length : rightPriority);
    })
    .slice(0, 4);
  const disclosureGuide = newsArticles.find(
    (article) => article.slug === "how-to-read-national-public-servant-reemployment-disclosure-2025",
  );

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        items={[
          { label: "TOP", href: "/" },
          { label: "省庁別一覧", href: "/ministries" },
          { label: ministry.name },
        ]}
      />
      <section className="mx-auto flex max-w-4xl flex-wrap items-start justify-between gap-3 text-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-secondary">省庁別の公表再就職情報</p>
          <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">
            {ministry.name}の天下り先一覧・公表再就職記録
          </h1>
          <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
            政府公表資料に記載された{ministry.name}出身者の再就職情報を、再就職先法人ごとに整理しています。
            {personCount}人が{matchingCorporations.length}法人に再就職した計{ministryRecords.length}件の記録を掲載しています。
            {entries.length ? `収録した再就職日は${formatDate(entries[entries.length - 1].date)}〜${formatDate(entries[0].date)}です。` : ""}
            {ministry.slug === "npa" ? "この一覧は離職時の所属が警察庁の記録を対象としています。" : ""}
          </p>
        </div>
        <ShareButton title={`${ministry.name}の天下り先一覧 | 天下りマップ`} />
      </section>

      {ministry.slug === "meti" ? <p className="text-sm leading-7 text-on-surface-variant">
        この一覧には、複数年度にわたり当サイトが収録した{entries.length}件を掲載しています。
        <Link href="/news/meti-reemployment-disclosure-fy2025" className="font-semibold text-secondary underline">令和7年度の公表表で数えた74件の解説</Link>では、同年度の離職後の事後届出を集計しています。
      </p> : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["公表再就職者数", `${personCount}人`],
          ["関連する再就職先法人", `${matchingCorporations.length}法人`],
          ["退職翌日の再就職記録", `${totalNextDay}件`],
          ["30日以内の再就職記録", `${totalWithin30Days}件`],
          ["収録資料の公表日（確認できた最新）", latestPublished ? formatDate(latestPublished) : "掲載資料に日付の記載なし"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </section>
      <MinistryRecordFinder entries={entries} ministry={ministry.name} headingId={`${ministry.slug}-records`} />

      {corporationTypeCounts.length > 0 ? (
        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="text-xl font-bold text-primary">再就職先の法人種別</h2>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            {ministry.name}出身者の公表記録を、再就職先法人の種別ごとに見られます。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {corporationTypeCounts.map(([type, count]) => (
              <Link
                key={type}
                href={`/corporations?ministry=${encodeURIComponent(ministry.name)}&type=${encodeURIComponent(type)}`}
                className="rounded-lg border border-outline-variant bg-white px-4 py-3 transition hover:border-secondary hover:bg-secondary-fixed"
              >
                <span className="block text-sm font-bold text-primary">{type}</span>
                <span className="mt-1 block text-sm font-extrabold text-secondary">公表記録 {count}件 →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-primary">再就職先法人一覧</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              公表記録の多い順に表示しています。法人名から就任時の役職と業務内容を確認できます。
            </p>
          </div>
          <Link href={`/corporations?ministry=${encodeURIComponent(ministry.name)}`} className="text-sm font-bold text-secondary hover:underline">
            条件を変えて法人検索する
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {matchingCorporations.map(({ corporation, people, waitingLabel }) => {
            return (
              <article key={corporation.slug} className="border border-outline-variant bg-surface-container-lowest p-5">
                <h3 className="font-extrabold leading-6 text-primary">{corporation.name}</h3>
                <dl className="mt-3 grid grid-cols-[1fr_auto] gap-3 border-y border-outline-variant py-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold text-on-surface-variant">公表された人物</dt>
                    <dd className="mt-1 space-y-1">
                      {people.map((person) => (
                        <Link key={person.slug} href={`/persons/${person.slug}`} className="block font-bold text-primary hover:underline">
                          {person.name}
                        </Link>
                      ))}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-xs font-semibold text-on-surface-variant">待機日数</dt>
                    <dd className="mt-1 font-extrabold text-primary">{waitingLabel}</dd>
                  </div>
                </dl>
                <Link href={`/corporations/${corporation.slug}`} className="mt-4 inline-flex min-h-11 items-center font-bold text-secondary hover:underline">
                  <span className="sr-only">{corporation.name}の</span>法人詳細を見る →
                </Link>
              </article>
            );
          })}
        </div>

      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-xl font-bold text-primary">ほかの省庁の天下り先一覧を見る</h2>
        <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">同じ形式で、出身省庁ごとの公表再就職情報を確認できます。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {relatedMinistries.map((candidate) => (
            <Link
              key={candidate.slug}
              href={`/ministries/${candidate.slug}`}
              className="rounded-full border border-secondary bg-white px-3 py-2 text-sm font-bold text-secondary hover:bg-secondary-fixed"
            >
              {candidate.name}の天下り先一覧
            </Link>
          ))}
        </div>
      </section>

      {disclosureGuide ? (
        <section className="rounded-lg border border-secondary/25 bg-secondary-fixed/40 p-5">
          <p className="text-xs font-bold tracking-[0.08em] text-secondary">PUBLIC RECORDS EXPLAINED</p>
          <h2 className="mt-2 text-xl font-bold text-primary">制度と記録を読む</h2>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            再就職制度と記録の見方を、具体例とともに解説しています。
          </p>
          <Link href={`/news/${disclosureGuide.slug}`} className="mt-4 inline-flex text-sm font-bold text-secondary hover:underline">
            {disclosureGuide.title} →
          </Link>
        </section>
      ) : null}

    </div>
  );
}
