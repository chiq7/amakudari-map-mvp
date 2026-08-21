"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { corporations, totals } from "@/lib/static-content";
import { getMinistryPath } from "@/lib/ministry-pages";
import { DataNotice, SearchBox, TagChip } from "@/components/ui";
import { ArrowRightIcon, BuildingIcon } from "@/components/icons";
import type { Corporation } from "@/lib/types";

const ministryLinks = ["警察庁", "国土交通省", "経済産業省", "厚生労働省", "防衛省"];
const typeLinks = ["独立行政法人", "公益財団法人", "一般財団法人", "公益社団法人", "株式会社"];
const areaPrefectures: Record<string, string[]> = {
  関東地方: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  近畿地方: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
};

type ActiveFilter = {
  label: string;
  heading: string;
  description: string;
  value: string;
};

function matchesType(corporation: Corporation, type: string) {
  return corporation.type === type || corporation.name.includes(type);
}

function matchesArea(corporation: Corporation, area: string) {
  const prefectures = areaPrefectures[area];
  return prefectures ? prefectures.includes(corporation.region) : corporation.region === area;
}

function matchesTag(corporation: Corporation, tag: string) {
  const normalizedTag = tag.toLocaleLowerCase("ja");
  return [
    corporation.name,
    ...corporation.aliases,
    corporation.description,
    ...corporation.topics,
    ...corporation.relatedTags,
    ...corporation.publicOfficers.flatMap((officer) => [
      officer.name,
      officer.role,
      officer.formerOrganization,
      officer.formerPosition,
      officer.profile,
    ]),
  ].some((value) => value.toLocaleLowerCase("ja").includes(normalizedTag));
}

function getActiveFilters({
  ministry,
  type,
  area,
  flag,
  tag,
  keyword,
  sort,
}: {
  ministry: string;
  type: string;
  area: string;
  flag: string;
  tag: string;
  keyword: string;
  sort: string;
}) {
  const filters: ActiveFilter[] = [];

  if (ministry) {
    filters.push({
      label: "省庁",
      heading: `${ministry}に関連する法人を表示中`,
      description: `最多出身省庁が『${ministry}』の法人を表示しています。`,
      value: ministry,
    });
  }
  if (type) {
    filters.push({
      label: "法人種別",
      heading: `${type}の法人を表示中`,
      description: `法人種別が『${type}』の法人を表示しています。`,
      value: type,
    });
  }
  if (area) {
    filters.push({
      label: "地域",
      heading: `${area}の法人を表示中`,
      description: `所在地が『${area}』の法人を表示しています。`,
      value: area,
    });
  }
  if (flag === "nextDay") {
    filters.push({
      label: "指標",
      heading: "退職翌日再就職がある法人を表示中",
      description: "退職翌日再就職の記録がある法人を表示しています。",
      value: "退職翌日再就職",
    });
  }
  if (flag === "within30Days") {
    filters.push({
      label: "指標",
      heading: "30日以内再就職がある法人を表示中",
      description: "30日以内再就職の記録がある法人を表示しています。",
      value: "30日以内再就職",
    });
  }
  if (tag) {
    filters.push({
      label: "タグ",
      heading: `「${tag}」に関連する法人を表示中`,
      description: `「${tag}」に関連する法人を表示しています。`,
      value: tag,
    });
  }
  if (keyword) {
    filters.push({
      label: "検索語",
      heading: `「${keyword}」の検索結果を表示中`,
      description: `「${keyword}」を含む法人を表示しています。`,
      value: keyword,
    });
  }
  if (sort === "publicRecords") {
    filters.push({
      label: "並び順",
      heading: "公表再就職者数の多い順で表示中",
      description: "公表再就職者数の多い順で表示しています。",
      value: "公表再就職者数",
    });
  }
  if (sort === "shortestAverageWaitingDays") {
    filters.push({
      label: "並び順",
      heading: "平均待機日数が短い順で表示中",
      description: "平均待機日数が短い順で表示しています。",
      value: "平均待機日数",
    });
  }

  return filters;
}

function CorporationsContent() {
  const searchParams = useSearchParams();
  const requestedShowAll = searchParams.get("show") === "all";
  const [expanded, setExpanded] = useState(false);
  const showAll = requestedShowAll || expanded;
  const ministry = searchParams.get("ministry")?.trim() ?? "";
  const type = searchParams.get("type")?.trim() ?? "";
  const area =
    searchParams.get("area")?.trim() ??
    searchParams.get("region")?.trim() ??
    "";
  const flag =
    searchParams.get("flag")?.trim() ??
    (searchParams.get("nextDay") === "true"
      ? "nextDay"
      : searchParams.get("within30Days") === "true"
        ? "within30Days"
        : "");
  const sort = searchParams.get("sort")?.trim() ?? "";
  const tag =
    searchParams.get("tag")?.trim() ??
    searchParams.get("topic")?.trim() ??
    searchParams.get("industry")?.trim() ??
    "";
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const activeFilters = getActiveFilters({ ministry, type, area, flag, tag, keyword, sort });
  const primaryFilter = activeFilters[0];

  const filteredCorporations = corporations
    .filter((corporation) => !ministry || corporation.ministries.includes(ministry))
    .filter((corporation) => !type || matchesType(corporation, type))
    .filter((corporation) => !area || matchesArea(corporation, area))
    .filter((corporation) => flag !== "nextDay" || corporation.nextDay > 0)
    .filter((corporation) => flag !== "within30Days" || corporation.within30Days > 0)
    .filter((corporation) => !tag || matchesTag(corporation, tag))
    .filter((corporation) => {
      if (!keyword) return true;
      const normalizedKeyword = keyword.toLocaleLowerCase("ja");
      return [
        corporation.name,
        ...corporation.aliases,
        corporation.type,
        corporation.region,
        corporation.description,
        ...corporation.ministries,
        ...corporation.topics,
        ...corporation.relatedTags,
        ...corporation.publicOfficers.flatMap((officer) => [
          officer.name,
          officer.role,
          officer.formerOrganization,
          officer.formerPosition,
          officer.profile,
        ]),
      ].some((value) => value.toLocaleLowerCase("ja").includes(normalizedKeyword));
    })
    .sort((left, right) => {
      if (sort === "publicRecords") return right.count - left.count;
      if (sort === "shortestAverageWaitingDays") {
        return left.averageWaitDays - right.averageWaitDays;
      }
      return 0;
    });

  const isFiltered = activeFilters.length > 0;
  const initialLimit = 20;
  const visibleCorporations =
    isFiltered || showAll ? filteredCorporations : filteredCorporations.slice(0, initialLimit);
  const hiddenCount = filteredCorporations.length - visibleCorporations.length;

  const renderDirectory = isFiltered || showAll;

  useEffect(() => {
    const staticDirectory = document.getElementById("featured-corporations-directory");
    staticDirectory?.toggleAttribute("hidden", renderDirectory);
    return () => staticDirectory?.removeAttribute("hidden");
  }, [renderDirectory]);

  return (
    <div className="flex flex-col gap-8">
      <section id="corporation-search-tools" className="mx-auto flex w-full max-w-4xl flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <SearchBox action="/corporations" />
        <div className="flex flex-wrap gap-2">
          <TagChip href="/corporations?ministry=警察庁" active={ministry === "警察庁"}>警察庁</TagChip>
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

      {!isFiltered && totals.nextDayCorporations === 0 ? (
        <DataNotice>
          <strong className="text-primary">退職翌日の再就職記録は0件です。</strong>
          現在の公開データでは該当法人がないため、一覧の列や絞り込み条件には表示していません。
        </DataNotice>
      ) : null}

      {renderDirectory ? <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-primary">法人一覧</h2>
          <p className="text-base font-bold text-primary">
            全 {totals.corporations}件中 {visibleCorporations.length}件を表示
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
                    <dt className="text-xs font-semibold text-on-surface-variant">公表再就職者</dt>
                    <dd className="mt-1 font-extrabold text-primary">{corporation.count}人</dd>
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
                <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">再就職者数</th>
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
                  <td className="px-4 py-4 text-center font-semibold">{corporation.count}人</td>
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
                      詳細を見る
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {hiddenCount > 0 ? (
            <div className="border-t border-outline-variant pt-5 text-center">
              <p className="text-sm text-on-surface-variant">
                最初の{initialLimit}法人を表示しています。法人名が分かる場合は上の検索が便利です。
              </p>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mt-3 min-h-11 border border-primary bg-white px-6 text-sm font-bold text-primary transition hover:bg-surface-container-low"
              >
                残り{hiddenCount}法人をすべて表示
              </button>
            </div>
          ) : null}
          </>
        ) : (
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-10 text-center">
            <p className="font-bold text-primary">該当する法人データはまだありません。</p>
            <p className="mt-2 text-sm text-on-surface-variant">公表資料をもとに順次追加予定です。</p>
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
                  {label}
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
                ["公表再就職者数ランキング", "/corporations?sort=publicRecords"],
                ...(totals.nextDayCorporations > 0
                  ? [["退職翌日再就職件数ランキング", "/corporations?flag=nextDay"]]
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

export default function CorporationsDirectoryClient() {
  return (
    <Suspense>
      <CorporationsContent />
    </Suspense>
  );
}
