import Link from "next/link";
import type { Metadata } from "next";
import CorporationsDirectoryClient from "@/components/CorporationsDirectoryClient";
import { corporations, totals } from "@/lib/static-content";

export const metadata: Metadata = {
  title: "天下り先企業・法人一覧｜省庁別の公表再就職情報を探す",
  description:
    "天下り先の企業・法人を一覧で探せます。法人名から公表された人物・出身省庁を確認し、省庁別・法人種別でも絞り込めます。",
  alternates: { canonical: "/corporations" },
};

const featuredCorporations = [...corporations]
  .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "ja"))
  .slice(0, 20);

export default function CorporationsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-bold text-secondary">FIND DESTINATIONS</p>
        <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">天下り先の企業・法人を探す</h1>
        <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
          法人名から公表された人物と出身省庁を確認できます。省庁別・法人種別でも絞り込めます。
        </p>
      </section>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        {[
          ["受け入れ法人", totals.corporations.toLocaleString(), "法人"],
          ["公表再就職記録", totals.publicRecords.toLocaleString(), "件"],
          ["30日以内の記録がある法人", totals.within30DaysCorporations.toLocaleString(), "法人"],
        ].map(([label, value, unit]) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-outline-variant/70">
            <dt className="text-sm font-semibold text-on-surface-variant">{label}</dt>
            <dd className="mt-2 text-3xl font-extrabold text-primary">
              {value}<span className="ml-1 text-sm">{unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      <section aria-label="法人一覧の使い方" className="grid gap-px overflow-hidden rounded-2xl border border-outline-variant bg-outline-variant sm:grid-cols-3">
        {[
          ["法人名が分かる", "名前で検索して、人物と出身省庁を確認"],
          ["省庁から探す", "財務省・国土交通省などの一覧へ進む"],
          ["種別から絞る", "株式会社・公益法人などを比較する"],
        ].map(([title, description]) => (
          <div key={title} className="bg-surface-container-lowest px-5 py-4 text-left">
            <p className="font-extrabold text-primary">{title}</p>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">{description}</p>
          </div>
        ))}
      </section>

      <nav aria-label="よく見られる省庁の一覧" className="border-y border-outline-variant py-5">
        <p className="text-center text-sm font-bold text-on-surface-variant">出身省庁から天下り先の企業・法人を探す</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {[
            ["財務省", "/ministries/finance"],
            ["国土交通省", "/ministries/mlit"],
            ["警察庁", "/ministries/npa"],
            ["総務省", "/ministries/mic"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center border border-secondary bg-white px-4 text-sm font-bold text-secondary hover:bg-secondary-fixed">
              {label}の天下り先一覧 →
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
          <Link href="/corporations?show=all#corporation-search-tools" className="text-sm font-bold text-secondary hover:underline">
            すべての法人を検索・絞り込む →
          </Link>
        </div>
        <ul className="mt-5 divide-y divide-outline-variant border-y border-outline-variant">
          {featuredCorporations.map((corporation) => (
            <li key={corporation.slug}>
              <Link href={`/corporations/${corporation.slug}`} className="grid gap-2 px-1 py-4 transition hover:bg-surface-container-low sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5">
                <span className="font-bold text-primary">{corporation.name}</span>
                <span className="text-sm text-on-surface-variant">主な出身省庁：{corporation.topMinistry}</span>
                <span className="text-sm font-extrabold text-secondary">公表再就職者 {corporation.count}人 →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CorporationsDirectoryClient />
    </div>
  );
}
