import Link from "next/link";
import type { Metadata } from "next";
import CorporationsDirectoryClient from "@/components/CorporationsDirectoryClient";
import { corporations, totals } from "@/lib/static-content";

export const metadata: Metadata = {
  title: "天下り先の法人一覧｜公表再就職情報を法人から探す",
  description:
    "政府・各省庁等の公表資料に記載された再就職先法人を一覧で確認できます。法人ごとの公表記録数、主な出身省庁、出典を掲載しています。",
  alternates: { canonical: "/corporations" },
};

const featuredCorporations = [...corporations]
  .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "ja"))
  .slice(0, 20);

export default function CorporationsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-bold text-secondary">PUBLIC REEMPLOYMENT RECORDS</p>
        <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">天下り先の法人一覧</h1>
        <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
          公表資料に記載された受け入れ法人を、再就職者数・主な出身省庁・出典とあわせて確認できます。
          人物や法人への評価ではなく、公表記録を探すための一覧です。
        </p>
      </section>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        {[
          ["受け入れ法人", totals.corporations.toLocaleString(), "法人"],
          ["公表再就職記録", totals.publicRecords.toLocaleString(), "件"],
          ["30日以内の記録", totals.within30DaysCorporations.toLocaleString(), "件"],
        ].map(([label, value, unit]) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-outline-variant/70">
            <dt className="text-sm font-semibold text-on-surface-variant">{label}</dt>
            <dd className="mt-2 text-3xl font-extrabold text-primary">
              {value}<span className="ml-1 text-sm">{unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      <nav aria-label="よく見られる省庁の一覧" className="flex flex-wrap justify-center gap-3">
        <Link href="/ministries/finance" className="rounded-full border border-secondary bg-white px-4 py-2 text-sm font-bold text-secondary hover:bg-secondary-fixed">
          財務省の天下り先一覧を見る
        </Link>
        <Link href="/ministries/mlit" className="rounded-full border border-secondary bg-white px-4 py-2 text-sm font-bold text-secondary hover:bg-secondary-fixed">
          国土交通省の天下り先一覧を見る
        </Link>
      </nav>

      <section id="featured-corporations-directory" aria-labelledby="featured-corporations-title" className="rounded-2xl bg-surface-container-lowest p-5 shadow-card ring-1 ring-outline-variant/70 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="featured-corporations-title" className="text-2xl font-bold text-primary">公表記録数が多い法人</h2>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">まずは主要な法人から、人物・出身省庁・一次資料を確認できます。</p>
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
