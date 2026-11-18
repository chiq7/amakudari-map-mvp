"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getMinistryPath, ministryPages } from "@/lib/ministry-pages";
import { SearchBox, TagChip } from "@/components/ui";
import { ArrowRightIcon, BuildingIcon } from "@/components/icons";

import { getDirectoryPage, type DirectoryCorporation } from "@/lib/directory-filters";

type DirectoryProps = {
  corporations: DirectoryCorporation[];
  totals: {
    corporations: number;
    nextDayCorporations: number;
    within30DaysCorporations: number;
  };
};

const ministryLinks = ministryPages.map((ministry) => ministry.name);
const typeLinks = ["独立行政法人", "公益財団法人", "一般財団法人", "公益社団法人", "株式会社"];

function CorporationsContent({ corporations, totals }: DirectoryProps) {
  const searchParams = useSearchParams();
  const { ministry, type, flag, activeFilters, primaryFilter, filteredCorporations, isFiltered, pageCount, page, first, visibleCorporations, renderDirectory } = getDirectoryPage(corporations, searchParams);
  function pageHref(destination: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(destination));
    return `/corporations?${params}#directory-results`;
  }

  useEffect(() => {
    const staticDirectory = document.getElementById("featured-corporations-directory");
    staticDirectory?.toggleAttribute("hidden", renderDirectory);
    return () => staticDirectory?.removeAttribute("hidden");
  }, [renderDirectory]);

  return (
    <div className="flex flex-col gap-8">
      <section id="corporation-search-tools" className="mx-auto flex w-full max-w-4xl flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <h2 className="font-bold text-primary">法人一覧を検索・絞り込み</h2>
        <SearchBox action="/corporations" />
        <div className="flex flex-wrap gap-2">
          <TagChip href="/corporations?ministry=警察庁" active={ministry === "警察庁"}>警察庁の関連法人で絞り込む</TagChip>
          <TagChip href="/corporations?type=一般財団法人" active={type === "一般財団法人"}>一般財団法人</TagChip>
          {totals.nextDayCorporations > 0 ? (
            <TagChip href="/corporations?flag=nextDay" active={flag === "nextDay"}>退職翌日再就職あり</TagChip>
          ) : null}
          <TagChip href="/corporations?flag=within30Days" active={flag === "within30Days"}>30日以内再就職あり</TagChip>
        </div>
      </section>

      {isFiltered ? (
        <section className="flex flex-col gap-3 rounded-lg border border-secondary/30 bg-secondary-fixed/50 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-primary">
              {primaryFilter ? primaryFilter.heading : "絞り込み中"}
            </h2>
            <Link href="/corporations" className="text-sm font-bold text-secondary hover:underline">
              すべての法人を見る
            </Link>
          </div>
          {primaryFilter ? <p className="text-sm text-on-surface-variant">{primaryFilter.description}</p> : null}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-on-surface-variant">絞り込み条件：</span>
            {activeFilters.map((filter) => (
              <TagChip key={`${filter.label}-${filter.value}`} active>
                {filter.value}
              </TagChip>
            ))}
          </div>
        </section>
      ) : null}

      {renderDirectory ? <section id="directory-results" className="flex scroll-mt-24 flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-primary">法人一覧</h2>
          <p className="text-base font-bold text-primary">
            {filteredCorporations.length}法人中 {filteredCorporations.length ? first + 1 : 0}〜{first + visibleCorporations.length}法人を表示
          </p>
        </div>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          件数は公表資料に含まれる再就職記録を法人単位で集計したものです。最多出身省庁や待機日数とあわせて、絞り込み結果の傾向を確認できます。
        </p>
        {filteredCorporations.length > 0 ? (
          <>
          <div className="grid gap-3 md:hidden">
            {visibleCorporations.map((corporation) => (
              <Link
                key={corporation.slug}
                href={`/corporations/${corporation.slug}`}
                className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-outline-variant/70"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-secondary">
                    <BuildingIcon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-on-surface-variant">
                      {corporation.type}{corporation.region !== "不明" ? `・${corporation.region}` : ""}
                    </p>
                    <h3 className="mt-1 text-base font-extrabold leading-6 text-primary">{corporation.name}</h3>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-outline-variant py-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold text-on-surface-variant">公表再就職記録</dt>
                    <dd className="mt-1 font-extrabold text-primary">{corporation.count ? `${corporation.personCount}人・${corporation.count}件` : "未収録"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-on-surface-variant">主な出身省庁</dt>
                    <dd className="mt-1 truncate font-extrabold text-primary">{corporation.topMinistry}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-on-surface-variant">平均待機日数</dt>
                    <dd className="mt-1 font-extrabold text-primary">{corporation.averageWaitDays}日</dd>
                  </div>
                </dl>
                {corporation.within30Days > 1 ? (
                  <p className="mt-3 inline-flex border border-accent/20 bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
                    30日以内の記録が複数（{corporation.within30Days}件）
                  </p>
                ) : null}
                <span className="mt-4 flex items-center justify-between text-sm font-bold text-secondary">
                  詳細を見る <ArrowRightIcon size={17} />
                </span>
              </Link>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl bg-surface-container-lowest shadow-card ring-1 ring-outline-variant/70 md:block">
            <table className="w-full min-w-[700px] text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">法人名</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">再就職記録数</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">最多出身省庁</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">平均待機日数</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {visibleCorporations.map((corporation) => (
                <tr key={corporation.slug} className="hover:bg-surface-container-low">
                  <td className="px-4 py-4 font-bold text-primary">
                    {corporation.name}
                    {corporation.within30Days > 1 ? (
                      <span className="mt-1 block w-fit border border-accent/20 bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                        30日以内が複数
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold">{corporation.count ? `${corporation.personCount}人・${corporation.count}件` : "未収録"}</td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant">
                    <span
                      className={
                        ministry && corporation.topMinistry === ministry
                          ? "rounded-full bg-secondary-fixed px-2 py-1 font-bold text-secondary"
                          : ""
                      }
                    >
                      {corporation.topMinistry}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-semibold text-primary">{corporation.averageWaitDays}日</td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/corporations/${corporation.slug}`} className="text-sm font-bold text-secondary hover:underline">
                      <span className="sr-only">{corporation.name}の</span>詳細を見る
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {pageCount > 1 ? (
            <nav aria-label="法人一覧のページ送り" className="flex flex-wrap items-center justify-center gap-4 border-t border-outline-variant pt-4 text-sm font-bold">
              {page > 1 ? <Link href={pageHref(page - 1)} className="inline-flex min-h-11 items-center px-4 text-secondary underline">前の20法人</Link> : null}
              <span>{page} / {pageCount} ページ</span>
              {page < pageCount ? <Link href={pageHref(page + 1)} className="inline-flex min-h-11 items-center px-4 text-secondary underline">次の法人を見る</Link> : null}
            </nav>
          ) : null}
          </>
        ) : (
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-10 text-center">
            <p className="font-bold text-primary">条件に一致する法人は見つかりませんでした。</p>
            <Link href="/corporations?show=all" className="mt-2 inline-flex min-h-11 items-center font-bold text-secondary underline">条件を外して全法人を見る</Link>
          </div>
        )}
      </section> : null}

      <section className="flex flex-col gap-8 border-t border-outline-variant pt-8">
        <h2 className="text-2xl font-bold text-primary">関連する切り口から探す</h2>

        <section>
          <Link href="/corporations?flag=within30Days" className="flex items-center justify-between gap-4 rounded-lg border border-secondary/30 bg-secondary-fixed p-5 hover:border-secondary">
            <h3 className="text-xl font-bold text-primary">30日以内再就職がある法人</h3>
            <p className="flex shrink-0 items-baseline gap-1 text-on-surface">
              <span className="text-3xl font-bold">{totals.within30DaysCorporations}</span>
              <span className="text-sm font-semibold">法人</span>
            </p>
          </Link>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <h3 className="text-xl font-bold text-primary">出身省庁のつながりから探す</h3>
            <p className="mt-1 text-sm text-on-surface-variant">省庁ごとに、主な再就職先法人を確認できます。</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {ministryLinks.map((label) => (
                <TagChip key={label} href={getMinistryPath(label)}>
                  {label}{getMinistryPath(label).startsWith("/ministries/") ? "の省庁別一覧" : "の関連法人で絞り込む"}
                </TagChip>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <h3 className="text-xl font-bold text-primary">法人の種類から探す</h3>
            <p className="mt-1 text-sm text-on-surface-variant">法人種別ごとの受け入れ傾向を確認できます。</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {typeLinks.map((label) => (
                <Link key={label} href={`/corporations?type=${encodeURIComponent(label)}`} className="rounded border border-outline-variant bg-surface-container-low p-3 text-sm font-bold hover:border-secondary">
                  {label}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <h3 className="text-xl font-bold text-primary">ランキングから探す</h3>
            <div className="mt-4 divide-y divide-outline-variant rounded border border-outline-variant">
              {[
                ["公表再就職記録数ランキング", "/corporations?sort=publicRecords"],
                ...(totals.nextDayCorporations > 0
                  ? [["退職翌日の再就職記録がある法人", "/corporations?flag=nextDay"]]
                  : []),
                ["30日以内再就職ランキング", "/corporations?flag=within30Days"],
                ["平均待機日数が短い法人", "/corporations?sort=shortestAverageWaitingDays"],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="block px-4 py-3 text-sm font-semibold hover:bg-surface-container-low">
                  {label}
                </Link>
              ))}
            </div>
          </section>

        </div>

      </section>
    </div>
  );
}

export default function CorporationsDirectoryClient(props: DirectoryProps) {
  return (
    <Suspense>
      <CorporationsContent {...props} />
    </Suspense>
  );
}
