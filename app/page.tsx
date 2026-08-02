import Link from "next/link";
import type { Metadata } from "next";
import {
  corporations,
  getCorporationPersonHighlights,
  getSourceSummary,
  meta,
  persons,
  topics,
  totals,
} from "@/lib/static-content";
import { newsArticles } from "@/lib/news";
import { SearchBox } from "@/components/ui";
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
  title: "天下りマップ｜官民の人材移動を公表資料からたどる",
  description:
    "政府・各省庁等が公表する再就職情報を、人・法人・省庁・時系列から確認できるデータベースです。出典と確認日を掲載しています。",
  alternates: { canonical: "/" },
};

const featuredCorporations = [
  corporations.find((corporation) => corporation.slug === "corporation-luup") ?? corporations[0],
  corporations[0],
  corporations[2],
].filter((corporation, index, list) =>
  corporation && list.findIndex((item) => item?.slug === corporation.slug) === index,
);

const featuredCorporationCards = featuredCorporations.map((corporation) => {
  const highlights = getCorporationPersonHighlights(corporation);
  const sourceIds = Array.from(
    new Set([
      ...corporation.sources,
      ...highlights.people.flatMap((person) => person.sourceIds),
    ]),
  );
  return {
    corporation,
    highlights,
    sourceSummary: getSourceSummary(sourceIds),
  };
});

const ministryTopic = topics.find((topic) => topic.queryKey === "ministry");
const featuredMinistries = (ministryTopic?.items ?? [
  "国土交通省",
  "経済産業省",
  "厚生労働省",
  "総務省",
  "警察庁",
  "内閣府",
]).slice(0, 6);

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

export default function Home() {
  const samplePerson = persons[0];
  const sampleCorporation = corporations.find(
    (corporation) => corporation.slug === samplePerson?.corporationSlug,
  );

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
        className="relative overflow-hidden rounded-3xl bg-primary px-5 py-8 text-white shadow-soft sm:px-8 md:px-12 md:py-12 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12 lg:px-14 lg:py-16"
        data-analytics-location="home_hero"
      >
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute -right-6 -top-10 h-52 w-52 rounded-full border border-white/10" aria-hidden="true" />

        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-white/80">
            <DocumentIcon size={16} />
            政府・省庁等の一次資料を整理
          </p>
          <h1 className="mt-6 text-balance text-[34px] font-extrabold leading-[1.25] tracking-[-0.035em] sm:text-5xl md:text-[56px] md:leading-[1.18]">
            官民の人の動きを、
            <span className="block text-[#a9e4d3]">公表資料からたどる。</span>
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-white/78 md:text-lg">
            誰が、どの省庁から、どの法人へ移ったのか。公表された再就職情報を、人・法人・省庁のつながりと時系列で確認できます。
          </p>

          <SearchBox className="mt-7 max-w-2xl text-on-surface" />
          <p className="mt-3 text-xs leading-5 text-white/58">
            例：氏名、法人名、国土交通省、役職名
          </p>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold">
            <Link href="/persons" className="inline-flex items-center gap-2 text-white/88 transition hover:text-white">
              <PersonIcon size={18} /> 人から探す <ArrowRightIcon size={15} />
            </Link>
            <Link href="/corporations" className="inline-flex items-center gap-2 text-white/88 transition hover:text-white">
              <BuildingIcon size={18} /> 法人から探す <ArrowRightIcon size={15} />
            </Link>
            <Link href="/topics" className="inline-flex items-center gap-2 text-white/88 transition hover:text-white">
              <MinistryIcon size={18} /> 省庁から探す <ArrowRightIcon size={15} />
            </Link>
          </div>
        </div>

        {samplePerson ? (
          <div className="relative z-10 mt-10 lg:mt-0">
            <div className="rounded-3xl border border-white/12 bg-white/[0.07] p-4 backdrop-blur md:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.1em] text-white/50">公表資料上の移動例</p>
                  <p className="mt-1 text-sm font-bold text-white/86">組織・人・法人を1本につなぐ</p>
                </div>
                <span className="rounded-full bg-[#a9e4d3] px-3 py-1 text-xs font-extrabold text-primary">出典あり</span>
              </div>

              <div className="mt-5 space-y-2.5">
                <div className="rounded-2xl bg-white p-4 text-on-surface shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                      <MinistryIcon size={21} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-on-surface-variant">出身省庁</p>
                      <p className="truncate font-extrabold text-primary">{samplePerson.ministry}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-5 h-5 border-l-2 border-dashed border-white/28" aria-hidden="true" />
                <Link href={`/persons/${samplePerson.slug}`} className="block rounded-2xl bg-[#d8f1e8] p-4 text-on-surface transition hover:bg-[#c5e9dd]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-secondary">
                      <PersonIcon size={21} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-on-surface-variant">公表された人物</p>
                      <p className="truncate font-extrabold text-primary">{samplePerson.name}</p>
                      <p className="mt-0.5 truncate text-xs text-on-surface-variant">{samplePerson.formerPosition}</p>
                    </div>
                  </div>
                </Link>
                <div className="ml-5 flex h-6 items-center gap-3 border-l-2 border-dashed border-white/28 pl-4 text-[11px] font-bold text-white/62">
                  退職から再就職まで {samplePerson.waitDays}日
                </div>
                <Link href={`/corporations/${samplePerson.corporationSlug}`} className="block rounded-2xl bg-white p-4 text-on-surface shadow-card transition hover:bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <BuildingIcon size={21} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-on-surface-variant">再就職先</p>
                      <p className="truncate font-extrabold text-primary">{samplePerson.corporationName}</p>
                      <p className="mt-0.5 truncate text-xs text-on-surface-variant">{samplePerson.newPosition}</p>
                    </div>
                  </div>
                </Link>
              </div>
              <p className="mt-4 text-xs leading-5 text-white/52">
                出典：{sampleCorporation ? getSourceSummary(sampleCorporation.sources) : samplePerson.source}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="data-summary-title">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="CURRENT DATA"
            title="いま確認できる公表データ"
            description="件数は公表資料に含まれる記録を整理したものです。数字だけで評価せず、各詳細ページの出典と日付をあわせて確認できます。"
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

      <section>
        <SectionHeading
          eyebrow="START HERE"
          title="知りたい入口から、まっすぐ探せます"
          description="専門用語が分からなくても大丈夫です。名前、法人、省庁のどこからでも関連する公表記録へたどれます。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              href: "/persons",
              icon: <PersonIcon size={26} />,
              number: "01",
              title: "人から探す",
              description: "氏名から、離職時の所属・役職、再就職先、待機日数を確認します。",
              example: "氏名・役職で検索",
            },
            {
              href: "/corporations",
              icon: <BuildingIcon size={26} />,
              number: "02",
              title: "法人から探す",
              description: "法人ごとに、公表された人物、出身省庁、時系列と出典を確認します。",
              example: "法人名・法人種別で検索",
            },
            {
              href: "/topics",
              icon: <MinistryIcon size={26} />,
              number: "03",
              title: "省庁・テーマから探す",
              description: "出身省庁や業界テーマから、関連する法人と人物を横断して見ます。",
              example: "省庁・業界で絞り込み",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-[270px] flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-outline-variant/70 transition hover:-translate-y-1 hover:shadow-soft hover:ring-secondary/30 md:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-fixed text-secondary">
                  {item.icon}
                </span>
                <span className="text-xs font-extrabold tracking-[0.14em] text-outline">{item.number}</span>
              </div>
              <h3 className="mt-7 text-2xl font-extrabold text-primary">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">{item.description}</p>
              <div className="mt-auto flex items-center justify-between border-t border-outline-variant/70 pt-5 text-sm font-bold text-secondary">
                <span>{item.example}</span>
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
            description="各カードから人物・法人・出典資料へ進めます。"
          />
          <Link href="/corporations" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-secondary hover:underline">
            法人一覧を見る <ArrowRightIcon size={17} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {featuredCorporationCards.map(({ corporation, highlights, sourceSummary }) => (
            <article key={corporation.slug} className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-outline-variant/70">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-on-surface-variant">
                  <BuildingIcon size={14} /> {corporation.type}
                </span>
                <span className="text-xs font-bold text-on-surface-variant">{corporation.region}</span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold leading-snug text-primary">{corporation.name}</h3>
              <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-on-surface-variant">
                {corporation.description || `${corporation.topMinistry}に関連する公表再就職情報を掲載しています。`}
              </p>

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

              <p className="mt-4 text-xs leading-5 text-on-surface-variant">出典：{sourceSummary || "公表資料"}</p>
              <Link href={`/corporations/${corporation.slug}`} className="mt-5 inline-flex items-center justify-between border-t border-outline-variant/70 pt-4 text-sm font-bold text-secondary">
                詳細と出典を見る <ArrowRightIcon size={17} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 rounded-3xl bg-[#eaf2ed] p-6 md:p-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="BROWSE BY MINISTRY"
            title="省庁から関係をたどる"
            description="省庁ごとに、公表資料に記載された主な再就職先法人と人物を確認できます。"
          />
          <Link href="/topics" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline">
            すべての省庁・テーマを見る <ArrowRightIcon size={17} />
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {featuredMinistries.map((ministry) => (
            <Link
              key={ministry}
              href={getMinistryPath(ministry)}
              className="group flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 font-bold text-primary shadow-sm ring-1 ring-outline-variant/50 transition hover:ring-secondary/30"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-fixed text-secondary">
                  <MinistryIcon size={18} />
                </span>
                {ministry}
              </span>
              <ArrowRightIcon className="text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={16} />
            </Link>
          ))}
        </div>
      </section>

      {newsArticles.length > 0 ? (
        <section>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="NEWS & EXPLAINERS"
              title="一次資料から読むニュース・解説"
              description="再就職制度や行政の動きを、確認できた事実と確認できないことに分けて整理します。"
            />
            <Link href="/news" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-secondary hover:underline">
              ニュース一覧を見る <ArrowRightIcon size={17} />
            </Link>
          </div>
          <div className="mt-8 divide-y divide-outline-variant overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-outline-variant/70">
            {newsArticles.slice(0, 3).map((article) => (
              <article key={article.slug}>
                <Link href={`/news/${article.slug}`} className="group grid gap-4 p-5 transition hover:bg-surface-container-low sm:grid-cols-[150px_1fr_auto] sm:items-center md:p-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant sm:block">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-2.5 py-1 text-secondary">
                      <NewsIcon size={14} /> {article.kind}
                    </span>
                    <time className="sm:mt-2 sm:block" dateTime={article.datePublished}>{formatDate(article.datePublished)}</time>
                  </div>
                  <div>
                    <h3 className="text-balance text-base font-extrabold leading-7 text-primary md:text-lg">{article.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-on-surface-variant">{article.description}</p>
                  </div>
                  <ArrowRightIcon className="hidden text-outline transition group-hover:translate-x-1 group-hover:text-secondary sm:block" size={19} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-8 border-y border-outline-variant py-10 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-12">
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-secondary">HOW TO READ</p>
          <h2 className="mt-2 text-balance text-2xl font-extrabold text-primary md:text-3xl">数字より先に、出典を見る。</h2>
        </div>
        <div className="space-y-3 text-sm leading-7 text-on-surface-variant">
          <p className="flex items-start gap-3"><CheckIcon className="mt-1 shrink-0 text-secondary" size={18} />すべての重要な記録に、公表元と確認日を掲載します。</p>
          <p className="flex items-start gap-3"><CheckIcon className="mt-1 shrink-0 text-secondary" size={18} />公表資料で確認できる事実と、資料だけでは判断できないことを分けます。</p>
          <p className="flex items-start gap-3"><CheckIcon className="mt-1 shrink-0 text-secondary" size={18} />ランキングは件数の整理であり、違法性や妥当性を判定するものではありません。</p>
          <Link href="/data-policy" className="inline-flex items-center gap-2 pt-2 font-bold text-secondary hover:underline">
            データ方針を確認する <ArrowRightIcon size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
