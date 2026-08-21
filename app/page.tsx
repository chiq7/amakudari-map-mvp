import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  corporations,
  getCorporationPersonHighlights,
  meta,
  topics,
  totals,
} from "@/lib/static-content";
import { newsArticles } from "@/lib/news";
import { SearchBox } from "@/components/ui";
import DiscoveryRouteVisual from "@/components/DiscoveryRouteVisual";
import {
  ArrowRightIcon,
  BuildingIcon,
  CheckIcon,
  DocumentIcon,
  MinistryIcon,
  NewsIcon,
  PersonIcon,
} from "@/components/icons";
import { getMinistryPath } from "@/lib/ministry-pages";

export const metadata: Metadata = {
  title: "天下り先・企業一覧を公表資料から探す｜天下りマップ",
  description:
    "官僚・国家公務員の天下り先企業や法人を、財務省・国土交通省・警察庁などの省庁別、人物別に検索できます。政府公表の再就職情報と一次資料を掲載しています。",
  alternates: { canonical: "/" },
};

const explainerCorporation = corporations.find((corporation) => corporation.slug === "corporation-luup");
const recordRichCorporations = [...corporations]
  .filter((corporation) => corporation.slug !== explainerCorporation?.slug && corporation.count > 1)
  .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "ja"));
const featuredCorporations = [
  explainerCorporation ?? recordRichCorporations[0] ?? corporations[0],
  ...recordRichCorporations.slice(0, 2),
].filter((corporation, index, list) =>
  corporation && list.findIndex((item) => item?.slug === corporation.slug) === index,
);

const featuredCorporationCards = featuredCorporations.map((corporation) => {
  const highlights = getCorporationPersonHighlights(corporation);
  return {
    corporation,
    highlights,
    selectionReason:
      corporation.slug === explainerCorporation?.slug
        ? "最新の解説とつながる法人"
        : `公表記録が複数（${corporation.count}人）`,
  };
});

const ministryTopic = topics.find((topic) => topic.queryKey === "ministry");
const ministryItems = ministryTopic?.items ?? [
  "国土交通省",
  "経済産業省",
  "厚生労働省",
  "総務省",
  "警察庁",
  "内閣府",
];
const featuredMinistries = [
  "財務省",
  "国土交通省",
  ...ministryItems.filter((name) => name !== "財務省" && name !== "国土交通省"),
]
  .map((name) => ({
    name,
    corporationCount: corporations.filter((corporation) => corporation.ministries.includes(name)).length,
  }))
  .filter((ministry) => ministry.corporationCount > 0)
  .slice(0, 6);

function formatDate(value: string) {
  return value.replace(/-/g, ".");
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-extrabold tracking-[0.14em] text-secondary">{eyebrow}</p>
      <h2 className="mt-2 text-balance text-2xl font-extrabold tracking-tight text-primary md:text-3xl">
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

function ExplainerSection() {
  const [featuredArticle, ...otherArticles] = newsArticles;

  if (!featuredArticle) {
    return null;
  }

  return (
    <section aria-labelledby="featured-explainer-title" className="border-y border-outline-variant py-10 md:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="PUBLIC RECORDS EXPLAINED"
          title="記録の背景まで読む"
          description="人がどこへ移ったかだけでなく、法人の業務、元の役職、制度上の接点を一次資料から整理します。"
        />
        <Link
          href="/news"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-secondary bg-secondary px-4 text-sm font-bold text-white transition hover:bg-primary"
        >
          解説をすべて見る <ArrowRightIcon size={17} />
        </Link>
      </div>

      <article className="mt-7 overflow-hidden border border-outline-variant bg-white shadow-card">
        <div className="grid lg:grid-cols-[180px_1fr_320px]">
          <div className="flex flex-row items-center justify-between gap-3 bg-primary px-5 py-4 text-white lg:flex-col lg:items-start lg:justify-start lg:px-6 lg:py-7">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.08em]">
              <NewsIcon size={16} /> {featuredArticle.kind}
            </span>
            <time className="text-xs text-white/70 lg:mt-auto" dateTime={featuredArticle.dateModified}>
              {featuredArticle.dateModified !== featuredArticle.datePublished ? "更新 " : ""}{formatDate(featuredArticle.dateModified)}
            </time>
          </div>

          <div className="p-5 md:p-7">
            <p className="text-xs font-extrabold text-secondary">最新の解説</p>
            <h2 id="featured-explainer-title" className="mt-2 text-balance text-xl font-extrabold leading-8 text-primary md:text-2xl">
              {featuredArticle.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{featuredArticle.description}</p>
            <Link
              href={`/news/${featuredArticle.slug}`}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 border border-primary px-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
            >
              この解説を読む <ArrowRightIcon size={17} />
            </Link>
          </div>

          <aside className="border-t border-outline-variant bg-surface-container-low p-5 lg:border-l lg:border-t-0 lg:p-7" aria-label="記事で確認できること">
            <p className="text-xs font-extrabold tracking-[0.08em] text-secondary">この記事で確認できること</p>
            <ul className="mt-4 space-y-3">
              {featuredArticle.verifiedFacts.slice(0, 2).map((fact) => (
                <li key={fact.title} className="flex gap-3 text-sm font-bold leading-6 text-primary">
                  <CheckIcon className="mt-0.5 shrink-0 text-secondary" size={17} />
                  <span>{fact.title}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </article>

      {otherArticles.length > 0 ? (
        <div className="mt-4 divide-y divide-outline-variant border-y border-outline-variant">
          {otherArticles.slice(0, 2).map((article) => (
            <Link
              key={article.slug}
              href={`/news/${article.slug}`}
              className="group grid gap-2 py-4 sm:grid-cols-[120px_1fr_auto] sm:items-center"
            >
              <time className="text-xs font-bold text-on-surface-variant" dateTime={article.dateModified}>
                {article.dateModified !== article.datePublished ? "更新 " : ""}{formatDate(article.dateModified)}
              </time>
              <span className="text-sm font-extrabold leading-6 text-primary">{article.title}</span>
              <ArrowRightIcon className="hidden text-outline transition group-hover:translate-x-1 group-hover:text-secondary sm:block" size={17} />
            </Link>
          ))}
        </div>
      ) : null}
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
          { "@type": "PropertyValue", name: "受け入れ法人", value: totals.corporations, unitText: "法人" },
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col gap-20 md:gap-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <section
        className="relative overflow-hidden rounded-3xl bg-[#eee6da] shadow-soft ring-1 ring-[#dfd4c5] lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch"
        data-analytics-location="home_hero"
      >
        <div className="relative z-10 flex flex-col justify-center px-5 py-8 sm:px-8 md:px-12 md:py-12 lg:px-14 lg:py-16">
          <p className="inline-flex w-fit items-center gap-2 border-b-2 border-accent pb-2 text-xs font-extrabold tracking-[0.1em] text-primary">
            <DocumentIcon size={16} />
            PUBLIC RECORDS, VISUALIZED
          </p>
          <h1 className="mt-6 text-balance text-[34px] font-extrabold leading-[1.25] tracking-[-0.035em] sm:text-[42px] md:leading-[1.22] xl:text-[46px]">
            <span className="block">官民の人の動きを、</span>
            <span className="block text-accent">公表資料からたどる。</span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base font-medium leading-8 text-on-surface-variant md:text-lg">
            官僚・国家公務員の天下り先企業や法人を、誰が、どこから、どこへ移ったか一本の線で確認できます。
          </p>

          <figure className="mt-6 overflow-hidden rounded-2xl bg-[#f6f0e6] ring-1 ring-[#dfd4c5] lg:hidden">
            <div className="relative aspect-[3/2] w-full">
              <Image
                src="/images/relationship-editorial-v1.webp"
                alt="省庁から人物、法人への移動と、それを裏付ける公表資料の関係図"
                fill
                priority
                unoptimized
                sizes="100vw"
                className="object-contain object-center"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-2 border-t border-[#dfd4c5] bg-white/80 px-3 py-2 text-[11px] font-bold text-primary">
              <span>省庁 → 人物 → 法人</span>
              <span className="text-secondary">公表資料で照合</span>
            </figcaption>
          </figure>

          <SearchBox className="mt-7 max-w-xl" />

          <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
            <Link href="/persons" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-primary shadow-sm transition hover:-translate-y-0.5">
              <PersonIcon size={18} /> 人から探す <ArrowRightIcon size={15} />
            </Link>
            <Link href="/corporations" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-primary shadow-sm transition hover:-translate-y-0.5">
              <BuildingIcon size={18} /> 法人から探す <ArrowRightIcon size={15} />
            </Link>
            <Link href="/topics" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-primary shadow-sm transition hover:-translate-y-0.5">
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
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-contain object-center"
            />
          </div>
          <figcaption className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-bold text-primary shadow-sm backdrop-blur md:bottom-5 md:left-5 md:right-5 md:px-4 md:py-3 md:text-xs">
            <span>省庁 → 人物 → 法人</span>
            <span className="text-secondary">公表資料で照合</span>
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="data-summary-title">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="CURRENT DATA"
            title="公表データをひと目で"
          />
          <p className="text-xs font-semibold text-on-surface-variant">データ更新日 {formatDate(meta.lastUpdated)}</p>
        </div>
        <h2 id="data-summary-title" className="sr-only">データ概要</h2>
        <dl className="mt-7 grid grid-cols-2 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-outline-variant/70 lg:grid-cols-4">
          {[
            ["公表された再就職記録", totals.publicRecords.toLocaleString(), "件"],
            ["再就職先として掲載", totals.corporations.toLocaleString(), "法人"],
            ["30日以内の再就職", totals.within30DaysCorporations.toLocaleString(), "件"],
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

      <section id="start-here" className="scroll-mt-28">
        <SectionHeading
          eyebrow="START HERE"
          title="知りたい入口から、まっすぐ探せます"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              href: "/persons",
              number: "01",
              title: "人から探す",
              description: "氏名から経歴資料を確認し、再就職先をたどる",
              route: "person" as const,
              tone: "bg-[#e9edf8]",
              diagramTone: "text-secondary",
            },
            {
              href: "/corporations",
              number: "02",
              title: "法人から探す",
              description: "法人から公表人物を確認し、出身省庁をたどる",
              route: "corporation" as const,
              tone: "bg-[#f7e7e1]",
              diagramTone: "text-accent",
            },
            {
              href: "/topics",
              number: "03",
              title: "省庁・テーマから探す",
              description: "省庁から公表人物を確認し、関係法人をたどる",
              route: "ministry" as const,
              tone: "bg-[#f1e3c8]",
              diagramTone: "text-primary",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex min-h-[250px] flex-col overflow-hidden rounded-2xl border border-outline-variant/70 p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft md:p-6 ${item.tone}`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-extrabold text-primary md:text-2xl">{item.title}</h3>
                <span className="font-mono text-sm font-extrabold tracking-[0.14em] text-on-surface-variant">{item.number}</span>
              </div>
              <div className={item.diagramTone}>
                <DiscoveryRouteVisual variant={item.route} />
              </div>
              <span className="sr-only">{item.description}</span>
              <div className="mt-auto flex items-center justify-between pt-4 text-sm font-bold text-primary">
                <span>一覧を見る</span>
                <ArrowRightIcon className="transition-transform group-hover:translate-x-1" size={18} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="PUBLIC RECORDS"
            title="公表情報を、つながりで見る"
            description="最新の解説に関連する法人と、公表記録が複数ある法人を選んでいます。"
          />
          <Link href="/corporations" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-secondary hover:underline">
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
                詳細を見る <ArrowRightIcon size={17} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 rounded-3xl bg-[#e9edf8] p-6 md:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="BROWSE BY MINISTRY"
            title="省庁から関係をたどる"
          />
          <Link href="/topics" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline">
            すべての省庁・テーマを見る <ArrowRightIcon size={17} />
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {featuredMinistries.map((ministry) => (
            <Link
              key={ministry.name}
              href={getMinistryPath(ministry.name)}
              className="group flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 font-bold text-primary shadow-sm ring-1 ring-outline-variant/50 transition hover:ring-secondary/30"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-fixed text-secondary">
                  <MinistryIcon size={18} />
                </span>
                {ministry.name}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant">
                  {ministry.corporationCount}法人
                </span>
                <ArrowRightIcon className="text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ExplainerSection />
    </div>
  );
}
