import { formatDate, isSelfEmployed } from "@/lib/display-text";
import Link from "next/link";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";
import {
  corporations,
  getCorporationPersonHighlights,
  meta,
  recordCoverage,
  records,
  totals,
} from "@/lib/static-content";
import { newsArticles } from "@/lib/news";
import { SearchBox } from "@/components/ui";
import {
  ArrowRightIcon,
  BuildingIcon,
  MinistryIcon,
  NewsIcon,
  PersonIcon,
} from "@/components/icons";
import { getMinistryPath, ministryPages } from "@/lib/ministry-pages";
import { buttonLink } from "@/lib/ui-classes";

const homeTitle = "天下りとは？意味と天下り先一覧【省庁・企業別の再就職公表記録】";
export const metadata = {
  ...pageMetadata(homeTitle, "天下りと天下り先の意味を解説。国家公務員の公表再就職記録から、財務省・国土交通省などの出身者がどの企業や団体のどの役職に就いたか、省庁・法人・氏名で調べられます。", "/"),
  title: { absolute: `${homeTitle}｜天下りマップ` },
};

const latestExplainerCorporationSlugs = new Set(
  (newsArticles[0]?.relatedLinks ?? [])
    .map((link) => link.href.match(/^\/corporations\/([^/]+)$/)?.[1])
    .filter((slug): slug is string => Boolean(slug)),
);
const latestExplainerCorporations = corporations.filter((corporation) =>
  latestExplainerCorporationSlugs.has(corporation.slug),
);
const recordRichCorporations = [...corporations]
  .filter((corporation) => corporation.count > 1 && !isSelfEmployed(corporation.name))
  .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "ja"));
const featuredCorporations = [
  ...latestExplainerCorporations,
  ...recordRichCorporations,
].filter((corporation, index, list) =>
  corporation && list.findIndex((item) => item?.slug === corporation.slug) === index,
).slice(0, 3);

const featuredCorporationCards = featuredCorporations.map((corporation) => {
  const highlights = getCorporationPersonHighlights(corporation);
  return {
    corporation,
    highlights,
    selectionReason:
      latestExplainerCorporationSlugs.has(corporation.slug)
        ? "最新の解説で読む法人"
        : `公表記録が複数（${corporation.count}件）`,
  };
});

// 省庁ページがある省庁を、公表記録の多い順にすべて並べる
const featuredMinistries = ministryPages
  .map(({ name }) => {
    const ministryRecords = records.filter((record) => record.fromMinistry === name);
    return {
      name,
      path: getMinistryPath(name),
      recordCount: ministryRecords.length,
      corporationCount: new Set(ministryRecords.map((record) => record.corporationSlug)).size,
    };
  })
  .filter((ministry) => ministry.corporationCount > 0)
  .sort((left, right) => right.recordCount - left.recordCount || left.name.localeCompare(right.name, "ja"));

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-balance text-2xl font-extrabold tracking-tight text-primary md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-pretty text-sm leading-7 text-on-surface-variant md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function SearchIntentSection() {
  const listLink = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-white px-3 text-sm font-bold text-primary transition hover:border-secondary hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

  return (
    <section aria-label="調べたいことから探す" className="grid min-w-0 divide-y divide-outline-variant rounded-2xl border border-outline-variant bg-surface-container-lowest md:grid-cols-2 md:divide-x md:divide-y-0">
      <div className="min-w-0 px-4 py-3 sm:px-5" data-analytics-location="home_intent_definition">
        <h2 className="text-base font-extrabold text-primary">天下りとは？</h2>
        <p className="mt-1 text-pretty text-sm leading-relaxed text-on-surface-variant">
          政府が「天下り」として問題にしてきたのは、退職した職員が府省庁のあっせんを受け、企業や団体に再就職することです。再就職の公表記録で分かるのは、元の官職や再就職先、就任時の役職です。勤務先の名前だけから、あっせんの有無は判断できません。
        </p>
        <Link href="/about#reemployment-rules" className={`mt-2 ${buttonLink}`}>
          再就職等規制と公表制度を読む <ArrowRightIcon size={15} />
        </Link>
      </div>
      <div className="min-w-0 px-4 py-3 sm:px-5" data-analytics-location="home_intent_lists">
        <h2 className="text-base font-extrabold text-primary">天下り先とは？</h2>
        <p className="mt-1 text-pretty text-sm leading-relaxed text-on-surface-variant">こうした再就職で職員を受け入れる企業や団体を指す言い方です。ここでは公表された再就職先を一覧にまとめ、株式会社のほか学校法人や公益法人も掲載しています。</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link href="/ministries" className={listLink}>
            省庁別一覧 <ArrowRightIcon size={15} />
          </Link>
          <Link href="/corporations" className={listLink}>
            企業・法人一覧 <ArrowRightIcon size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ExplainerSection() {
  const [featuredArticle, ...otherArticles] = newsArticles;

  if (!featuredArticle) {
    return null;
  }
  const featuredMinistryLink = featuredArticle.relatedLinks.find((link) => /^\/ministries\/[^/]+$/.test(link.href));

  return (
    <section aria-labelledby="featured-explainer-title" data-analytics-location="home_featured_news">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary pb-3">
        <h2 id="featured-explainer-title" className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-primary md:text-2xl">
          <NewsIcon size={22} /> いま注目のテーマ
        </h2>
        <Link
          href="/news"
          className={buttonLink}
        >
          解説をすべて見る <ArrowRightIcon size={17} />
        </Link>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <article className="min-w-0 overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-card">
          <div className="p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold">
              <span className="rounded-full bg-secondary-fixed px-3 py-1 text-secondary">{featuredArticle.kind}</span>
              <time className="text-on-surface-variant" dateTime={featuredArticle.dateModified}>
                {featuredArticle.dateModified !== featuredArticle.datePublished ? "更新 " : "公開 "}{formatDate(featuredArticle.dateModified)}
              </time>
            </div>
            <h3 className="mt-4 text-pretty text-2xl font-extrabold leading-[1.5] tracking-tight text-primary md:text-3xl">
              <Link href={`/news/${featuredArticle.slug}`} className="hover:text-secondary">{featuredArticle.title}</Link>
            </h3>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{featuredArticle.description}</p>
            <Link
              href={`/news/${featuredArticle.slug}`}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 border border-primary px-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
            >
              記事を読む <ArrowRightIcon size={17} />
            </Link>
            {featuredMinistryLink ? (
              <Link href={featuredMinistryLink.href} className={`mt-2 sm:ml-3 ${buttonLink}`}>
                {featuredMinistryLink.label}
              </Link>
            ) : null}
          </div>

          {featuredArticle.featuredEntities?.length ? (
            <div className="border-t border-outline-variant bg-surface-container-low p-5 md:px-7" aria-label="記事に登場する企業">
              <p className="text-xs font-bold text-on-surface-variant">記事に登場する企業と役割</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {featuredArticle.featuredEntities.map((entity) => (
                  <Link
                    key={entity.name}
                    href={`/news/${featuredArticle.slug}`}
                    className="group flex min-h-11 flex-col justify-center rounded-xl bg-white px-3 py-2 ring-1 ring-outline-variant/70 transition hover:ring-secondary"
                  >
                    <span className="inline-flex items-center justify-between gap-2 text-sm font-extrabold text-primary">
                      {entity.name} <ArrowRightIcon className="shrink-0 text-secondary" size={14} />
                    </span>
                    <span className="mt-1 text-xs leading-5 text-on-surface-variant">{entity.role}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </article>
        {otherArticles.length > 0 ? (
          <aside className="min-w-0" aria-label="あわせて読みたい解説">
            <p className="border-b border-outline-variant pb-3 text-sm font-extrabold text-primary">あわせて読みたい</p>
            <div className="divide-y divide-outline-variant">
              {otherArticles.slice(0, 2).map((article) => (
                <Link
                  key={article.slug}
                  href={`/news/${article.slug}`}
                  className="group -mx-2 flex flex-col gap-2 rounded-lg px-2 py-4 transition hover:bg-surface-container-low"
                >
                  <time className="text-xs font-bold text-on-surface-variant" dateTime={article.dateModified}>
                    {article.dateModified !== article.datePublished ? "更新 " : "公開 "}{formatDate(article.dateModified)}
                  </time>
                  <span className="text-sm font-extrabold leading-6 text-primary group-hover:text-secondary">{article.title}</span>
                  <span className="hidden text-sm leading-6 text-on-surface-variant lg:line-clamp-2">{article.description}</span>
                </Link>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "天下りマップ",
        alternateName: "amakudari.jp",
        url: "https://amakudari.jp/",
        description:
          "政府・各省庁等の公表資料に基づく再就職情報を、人・法人・省庁から確認できるデータベースです。",
        inLanguage: "ja-JP",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://amakudari.jp/search?keyword={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Dataset",
        name: "天下りマップ公表再就職情報データセット",
        url: "https://amakudari.jp/",
        description:
          "政府・各省庁等の公表資料をもとに、再就職先法人、出身省庁、待機日数などを検索・閲覧できるよう整理したデータセットです。",
        inLanguage: "ja-JP",
        dateModified: meta.lastUpdated,
        creator: { "@type": "Organization", name: "天下りマップ", url: "https://amakudari.jp/" },
        publisher: { "@type": "Organization", name: "天下りマップ", url: "https://amakudari.jp/" },
        license: {
          "@type": "CreativeWork",
          name: "天下りマップ データ利用条件（2026年8月2日版）",
          url: "https://amakudari.jp/data-policy#dataset-license",
        },
        variableMeasured: [
          { "@type": "PropertyValue", name: "公表再就職情報", value: totals.publicRecords, unitText: "件" },
          { "@type": "PropertyValue", name: "掲載している法人（役員情報のみの法人を含む）", value: totals.corporations, unitText: "法人" },
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col gap-12 md:gap-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <SearchIntentSection />

      <section
        className="relative overflow-hidden rounded-3xl bg-[#eee6da] shadow-soft ring-1 ring-[#dfd4c5] lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch"
        data-analytics-location="home_hero"
      >
        <div className="relative z-10 flex flex-col justify-center px-5 py-8 sm:px-8 md:px-12 md:py-12 lg:px-14 lg:py-16">
          <h1 className="mt-6 text-balance text-[34px] font-extrabold leading-[1.25] tracking-[-0.035em] sm:text-[42px] md:leading-[1.22] xl:text-[46px]">
            <span className="block">天下り先を、</span>
            <span className="block text-accent">省庁・法人・人物から探す。</span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base font-medium leading-8 text-on-surface-variant md:text-lg">
            国家公務員の再就職先企業・法人を、誰が、どこから、どこへ移ったか、法人の業務とあわせて確認できます。
          </p>

          <details className="mt-3 lg:hidden"><summary className="cursor-pointer py-2 text-sm font-semibold text-secondary">省庁・人物・法人の関係を図で見る</summary>
          <figure className="overflow-hidden rounded-2xl bg-[#f6f0e6] ring-1 ring-[#dfd4c5]">
            <div className="relative aspect-[3/2] w-full">
              <Image
                src="/images/relationship-editorial-v1.webp"
                alt="省庁から人物、法人への移動と、それを裏付ける公表資料の関係図"
                fill
                unoptimized
                sizes="100vw"
                className="object-contain object-center"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-2 border-t border-[#dfd4c5] bg-white/80 px-3 py-2 text-[11px] font-bold text-primary">
              <span>省庁 → 人物 → 法人</span>
              <span className="text-secondary">出典は各ページに掲載</span>
            </figcaption>
          </figure></details>

          <SearchBox className="mt-7 max-w-xl" />

          <div id="start-here" className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
            <Link href="/persons" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-primary shadow-sm transition hover:-translate-y-0.5">
              <PersonIcon size={18} /> 人から探す <ArrowRightIcon size={15} />
            </Link>
            <Link href="/corporations" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-primary shadow-sm transition hover:-translate-y-0.5">
              <BuildingIcon size={18} /> 法人から探す <ArrowRightIcon size={15} />
            </Link>
            <Link href="/ministries" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-primary shadow-sm transition hover:-translate-y-0.5">
              <MinistryIcon size={18} /> 省庁から探す <ArrowRightIcon size={15} />
            </Link>
          </div>
        </div>

        <figure className="relative hidden min-w-0 border-l border-[#dfd4c5] bg-[#f6f0e6] lg:block">
          <div className="relative aspect-[3/2] min-h-[290px] w-full lg:aspect-auto lg:h-full lg:min-h-[520px]">
            <Image
              src="/images/relationship-editorial-v1.webp"
              alt="省庁から人物、法人への移動と、それを裏付ける公表資料の関係図"
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-contain object-center"
            />
          </div>
          <figcaption className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-bold text-primary shadow-sm backdrop-blur md:bottom-5 md:left-5 md:right-5 md:px-4 md:py-3 md:text-xs">
            <span>省庁 → 人物 → 法人</span>
            <span className="text-secondary">出典は各ページに掲載</span>
          </figcaption>
        </figure>
      </section>

      <ExplainerSection />
      <section aria-labelledby="data-summary-title">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title="天下りマップの収録件数"
          />
          <Link href="/data-policy#coverage" className={buttonLink}>収録期間と数え方を見る</Link>
        </div>
        <p className="mt-4 text-sm leading-7 text-on-surface-variant">
          内閣官房などが公表した再就職記録のうち、当サイトに収録した分を集計しています。
          掲載記録の離職日は{recordCoverage.retirement}、再就職日は{recordCoverage.reemployment}です。
        </p>
        <h2 id="data-summary-title" className="sr-only">データ概要</h2>
        <dl className="mt-7 grid grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-outline-variant/70 lg:grid-cols-4">
          {[
            ["公表された再就職記録", totals.publicRecords.toLocaleString(), "件"],
            ["掲載している法人", totals.corporations.toLocaleString(), "法人"],
            ["出身の省庁など", new Set(records.map((record) => record.fromMinistry)).size.toLocaleString(), "機関"],
            ["人物ページ", meta.personCount.toLocaleString(), "人"],
          ].map(([label, value, unit], index) => (
            <div
              key={label}
              className={`p-5 md:p-7 ${index % 2 === 0 ? "border-r border-outline-variant/70" : ""} ${index < 2 ? "border-b border-outline-variant/70 lg:border-b-0" : ""} ${index === 1 ? "lg:border-r" : ""} ${index === 2 ? "lg:border-r" : ""}`}
            >
              <dt className="text-xs font-bold leading-5 text-on-surface-variant">{label}</dt>
              <dd className="mt-3 flex items-baseline gap-1 text-primary">
                <span className="text-3xl font-extrabold tracking-tight md:text-4xl">{value}</span>
                <span className="text-xs font-bold text-on-surface-variant">{unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            title="公表情報を、つながりで見る"
            description="最新の解説に出た法人を先頭に、公表記録が多い法人をあわせて表示しています。記事やデータが更新されると入れ替わります。"
          />
          <Link href="/corporations" className={`shrink-0 ${buttonLink}`}>
            法人一覧を見る <ArrowRightIcon size={17} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {featuredCorporationCards.map(({ corporation, highlights, selectionReason }) => (
            <article key={corporation.slug} className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-outline-variant/70">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">
                  <BuildingIcon size={14} /> {corporation.type}
                </span>
                {corporation.region !== "不明" ? <span className="text-xs font-bold text-on-surface-variant">{corporation.region}</span> : null}
              </div>
              <p className="mt-4 border-l-2 border-accent pl-3 text-xs font-extrabold text-accent">{selectionReason}</p>
              <h3 className="mt-5 text-xl font-extrabold leading-snug text-primary">{corporation.name}</h3>
              <div className="mt-5 rounded-2xl bg-surface-container-low p-4">
                <p className="text-[11px] font-extrabold tracking-[0.08em] text-on-surface-variant">
                  {highlights.kind === "public-officer" ? "公表役員プロフィール" : "公表再就職記録"}
                </p>
                {highlights.people[0] ? (
                  <div className="mt-3 flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-secondary">
                      <PersonIcon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-primary">{highlights.people[0].name}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-on-surface-variant">
                        {highlights.people[0].formerOrganization} → {highlights.people[0].role}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-on-surface-variant">関連する公表記録を詳細ページで確認できます。</p>
                )}
              </div>

              <Link href={`/corporations/${corporation.slug}`} className="mt-5 inline-flex items-center justify-between border-t border-outline-variant/70 pt-4 text-sm font-bold text-secondary">
                <span><span className="sr-only">{corporation.name}の</span>詳細を見る</span> <ArrowRightIcon size={17} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 rounded-3xl bg-[#e9edf8] p-6 md:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <SectionHeading
            title="省庁から関係をたどる"
          />
          <Link href="/ministries" className={`mt-6 ${buttonLink}`}>
            すべての省庁を見る <ArrowRightIcon size={17} />
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {featuredMinistries.map((ministry) => (
            <Link
              key={ministry.name}
              href={ministry.path}
              className="group flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 font-bold text-primary shadow-sm ring-1 ring-outline-variant/50 transition hover:ring-secondary/30"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-secondary">
                  <MinistryIcon size={18} />
                </span>
                <span className="whitespace-nowrap">{ministry.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant">
                  {`${ministry.corporationCount}法人`}
                </span>
                <ArrowRightIcon className="text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
