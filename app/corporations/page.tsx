"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { corporations, totals } from "@/lib/static-content";
import { HighlightStatCard, SearchBox, StatCard, TagChip } from "@/components/ui";
import type { Corporation } from "@/lib/types";

const ministryLinks = ["警察庁", "国土交通省", "経済産業省", "厚生労働省", "防衛省"];
const typeLinks = ["独立行政法人", "公益財団法人", "一般財団法人", "公益社団法人", "株式会社"];
const regionLinks = ["東京都", "関東地方", "大阪府", "近畿地方", "愛知県", "福岡県"];

const areaPrefectures: Record<string, string[]> = {
  関東地方: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  近畿地方: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
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
    corporation.description,
    ...corporation.topics,
    ...corporation.relatedTags,
  ].some((value) => value.toLocaleLowerCase("ja").includes(normalizedTag));
}

function CorporationsContent() {
  const searchParams = useSearchParams();
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
        corporation.type,
        corporation.region,
        corporation.description,
        ...corporation.ministries,
        ...corporation.topics,
        ...corporation.relatedTags,
      ].some((value) => value.toLocaleLowerCase("ja").includes(normalizedKeyword));
    })
    .sort((left, right) => {
      if (sort === "publicRecords") return right.count - left.count;
      if (sort === "shortestAverageWaitingDays") {
        return left.averageWaitDays - right.averageWaitDays;
      }
      return 0;
    });

  const conditionLabels = [
    ministry ? `${ministry}に関連する法人` : "",
    type ? `${type}の法人` : "",
    area ? `${area}の法人` : "",
    flag === "nextDay" ? "退職翌日再就職がある法人" : "",
    flag === "within30Days" ? "30日以内再就職がある法人" : "",
    tag ? `「${tag}」に関連する法人` : "",
    keyword ? `「${keyword}」の検索結果` : "",
    sort === "publicRecords" ? "公表再就職者数の多い順" : "",
    sort === "shortestAverageWaitingDays" ? "平均待機日数が短い順" : "",
  ].filter(Boolean);
  const isFiltered = conditionLabels.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">法人検索</h1>
        <p className="mt-2 text-base text-on-surface-variant">公表資料に記載された受け入れ法人を探せます。</p>
      </section>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <SearchBox action="/corporations" />
        <div className="flex flex-wrap gap-2">
          <TagChip href="/corporations?ministry=警察庁" active={ministry === "警察庁"}>警察庁</TagChip>
          <TagChip href="/corporations?type=一般財団法人" active={type === "一般財団法人"}>一般財団法人</TagChip>
          <TagChip href="/corporations?area=東京都" active={area === "東京都"}>東京都</TagChip>
          <TagChip href="/corporations?flag=nextDay" active={flag === "nextDay"}>
            退職翌日再就職あり
          </TagChip>
          <TagChip href="/corporations?flag=within30Days" active={flag === "within30Days"}>30日以内再就職あり</TagChip>
        </div>
      </section>

      {isFiltered ? (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-secondary/30 bg-secondary-fixed/50 px-5 py-4">
          <h2 className="text-xl font-bold text-primary">{conditionLabels.join("・")}</h2>
          <Link href="/corporations" className="text-sm font-bold text-secondary hover:underline">
            すべての法人を見る
          </Link>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="受け入れ法人" value={totals.corporations.toLocaleString()} unit="法人" />
        <StatCard label="公表再就職者数" value={totals.publicRecords.toLocaleString()} unit="人" />
        <HighlightStatCard label="退職翌日再就職あり" value={totals.nextDayCorporations} unit="法人" />
        <HighlightStatCard label="30日以内再就職あり" value={totals.within30DaysCorporations} unit="法人" />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-primary">法人一覧</h2>
          <p className="text-sm text-on-surface-variant">
            全 {totals.corporations}件中 {filteredCorporations.length}件を表示
          </p>
        </div>
        {filteredCorporations.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface-container-lowest">
          <table className="w-full min-w-[840px] text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">法人名</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">再就職者数</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">最多出身省庁</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">退職翌日</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">30日以内</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">所在地域</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredCorporations.map((corporation) => (
                <tr key={corporation.slug} className="hover:bg-surface-container-low">
                  <td className="px-4 py-4 font-bold text-primary">{corporation.name}</td>
                  <td className="px-4 py-4 text-center font-semibold">{corporation.count}人</td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant">{corporation.topMinistry}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="rounded-full bg-secondary-fixed px-2 py-1 text-sm font-bold text-secondary">
                      {corporation.nextDay}件
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-semibold text-secondary">{corporation.within30Days}件</td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant">{corporation.region}</td>
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
        ) : (
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-10 text-center">
            <p className="font-bold text-primary">該当する法人データはまだありません。</p>
            <p className="mt-2 text-sm text-on-surface-variant">公表資料をもとに順次追加予定です。</p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-8 border-t border-outline-variant pt-8">
        <h2 className="text-2xl font-bold text-primary">関連する切り口から探す</h2>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link href="/corporations?flag=nextDay" className="flex items-center justify-between gap-4 rounded-lg border border-secondary/30 bg-secondary-fixed p-5 hover:border-secondary">
            <h3 className="text-xl font-bold text-primary">退職翌日再就職がある法人</h3>
            <p className="flex shrink-0 items-baseline gap-1 text-on-surface">
              <span className="text-3xl font-bold">{totals.nextDayCorporations}</span>
              <span className="text-sm font-semibold">法人</span>
            </p>
          </Link>
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
                <TagChip key={label} href={`/corporations?ministry=${encodeURIComponent(label)}`}>
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
                ["退職翌日再就職件数ランキング", "/corporations?flag=nextDay"],
                ["30日以内再就職ランキング", "/corporations?flag=within30Days"],
                ["平均待機日数が短い法人", "/corporations?sort=shortestAverageWaitingDays"],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="block px-4 py-3 text-sm font-semibold hover:bg-surface-container-low">
                  {label}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <h3 className="text-xl font-bold text-primary">地域から探す</h3>
            <p className="mt-1 text-sm text-on-surface-variant">法人所在地ベースで、地域ごとの受け入れ法人を確認できます。</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {regionLinks.map((label) => (
                <TagChip key={label} href={`/corporations?area=${encodeURIComponent(label)}`}>
                  {label}
                </TagChip>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-outline-variant bg-surface-container-low p-6 text-center">
          <h3 className="text-xl font-bold text-primary">データの前提を確認する</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            本サイトのデータは、公表資料をもとに客観的に整理しています。表示項目や待機期間の算出方法はデータ方針で確認できます。
          </p>
          <Link href="/data-policy" className="mt-4 inline-block rounded bg-primary px-5 py-2 text-sm font-bold text-white">
            データ方針を見る
          </Link>
        </section>
      </section>
    </div>
  );
}

export default function CorporationsPage() {
  return (
    <Suspense>
      <CorporationsContent />
    </Suspense>
  );
}
