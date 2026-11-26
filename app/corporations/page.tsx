import { directoryCorporations, peopleByCorporation } from "@/lib/directory-data";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import CorporationsDirectoryClient from "@/components/CorporationsDirectoryClient";
import { corporations, totals } from "@/lib/static-content";
import { corporationTypeGroups } from "@/lib/corporation-types";
import { isSelfEmployed } from "@/lib/display-text";
import { buttonLink } from "@/lib/ui-classes";

export const metadata = pageMetadata("天下り先の企業・法人一覧｜民間企業・公益法人などの再就職先", "国家公務員の公表記録に登場する再就職先を一覧で検索できます。民間企業、一般社団・財団法人、公益法人で絞り込み、各法人の収録人数、記録数、主な出身省庁を比較できます。", "/corporations");

const featuredCorporations = [...corporations]
  .filter((corporation) => !isSelfEmployed(corporation.name))
  .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "ja"))
  .slice(0, 20);

const directoryTotals = {
  corporations: totals.corporations,
  nextDayCorporations: totals.nextDayCorporations,
  within30DaysCorporations: totals.within30DaysCorporations,
};

export default function CorporationsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">天下り先の企業・法人を探す</h1>
        <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
          法人名から公表された人物と出身省庁を確認できます。省庁別・法人種別でも絞り込めます。
        </p>
      </section>

      <dl className="grid grid-cols-2 gap-3 md:gap-4">
        {[
          ["掲載している法人", totals.corporations.toLocaleString(), "法人"],
          ["公表再就職記録", totals.publicRecords.toLocaleString(), "件"],
        ].map(([label, value, unit]) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-outline-variant/70">
            <dt className="text-sm font-semibold text-on-surface-variant">{label}</dt>
            <dd className="mt-2 text-3xl font-extrabold text-primary">
              {value}<span className="ml-1 text-sm">{unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      <nav aria-label="法人種別で絞り込む" className="rounded-xl border border-outline-variant bg-white p-4">
        <h2 className="font-bold text-primary">法人種別で絞り込む</h2>
        <div className="mt-2 flex flex-wrap gap-2">{Object.keys(corporationTypeGroups).map((label) => (
          <Link key={label} href={`/corporations?type=${encodeURIComponent(label)}#directory-results`} className="inline-flex min-h-11 items-center rounded-full border border-secondary px-3 text-sm font-bold text-secondary hover:bg-secondary-fixed">{label}</Link>
        ))}</div>
      </nav>

      <nav aria-label="よく見られる省庁の一覧" className="border-y border-outline-variant py-5">
        <p className="text-center text-sm font-bold text-on-surface-variant">出身省庁から天下り先の企業・法人を探す</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {[
            ["財務省", "/ministries/finance"],
            ["国土交通省", "/ministries/mlit"],
            ["経済産業省", "/ministries/meti"],
            ["警察庁", "/ministries/npa"],
            ["法務省", "/ministries/moj"],
            ["総務省", "/ministries/mic"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center border border-secondary bg-white px-4 text-sm font-bold text-secondary hover:bg-secondary-fixed">
              {label}の天下り先一覧
            </Link>
          ))}
        </div>
      </nav>

      <section id="featured-corporations-directory" aria-labelledby="featured-corporations-title" className="rounded-2xl bg-surface-container-lowest p-5 shadow-card ring-1 ring-outline-variant/70 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="featured-corporations-title" className="text-2xl font-bold text-primary">公表記録数が多い法人</h2>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">まずは主要な法人から、人物・出身省庁・業務内容をたどれます。</p>
          </div>
          <Link href="/corporations?show=all#corporation-search-tools" className={buttonLink}>
            すべての法人を検索・絞り込む
          </Link>
        </div>
        <ul className="mt-5 divide-y divide-outline-variant border-y border-outline-variant">
          {featuredCorporations.map((corporation) => (
            <li key={corporation.slug}>
              <Link href={`/corporations/${corporation.slug}`} className="grid gap-2 px-1 py-4 transition hover:bg-surface-container-low sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5">
                <span className="font-bold text-primary">{corporation.name}</span>
                <span className="text-sm text-on-surface-variant">主な出身省庁：{corporation.topMinistry}</span>
                <span className="text-sm font-extrabold text-secondary">収録 {peopleByCorporation.get(corporation.slug)?.size ?? 0}人・再就職記録 {corporation.count}件</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CorporationsDirectoryClient corporations={directoryCorporations} totals={directoryTotals} />
      <noscript id="server-directory" suppressHydrationWarning><p>この画面の条件検索にはJavaScriptを使用します。下の法人名索引では全法人を閲覧できます。省庁別の公表記録は<Link href="/ministries">省庁一覧</Link>から開けます。</p></noscript>
      <details className="border-y border-outline-variant py-4">
        <summary className="cursor-pointer py-2 text-lg font-bold text-primary">掲載法人を名前から探す（{corporations.length}法人）</summary>
        <ul className="mt-4 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...corporations].sort((left, right) => left.name.localeCompare(right.name, "ja")).map((corporation) => (
            <li key={corporation.slug}>
              <Link href={`/corporations/${corporation.slug}`} className="inline-flex min-h-11 items-center text-sm text-primary hover:text-secondary">
                {corporation.name}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
