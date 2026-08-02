import { rankingLists } from "@/lib/static-content";
import { DataNotice, RankingCard, TagChip } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "集計を見る",
  description: "公表された再就職記録を、法人別件数や待機日数などの指標で確認できます。",
  alternates: { canonical: "/rankings" },
};

const linkGroups = [
  {
    title: "省庁別に見る",
    links: ["国土交通省", "経済産業省", "総務省", "内閣府"].map((label) => ({
      label,
      href: `/corporations?ministry=${encodeURIComponent(label)}`,
    })),
  },
  {
    title: "地域別に見る",
    links: ["東京都", "関東地方", "大阪府", "近畿地方"].map((label) => ({
      label,
      href: `/corporations?region=${encodeURIComponent(label)}`,
    })),
  },
  {
    title: "法人種別で見る",
    links: ["公益法人", "独立行政法人", "一般財団法人", "株式会社"].map((label) => ({
      label,
      href: `/corporations?type=${encodeURIComponent(label)}`,
    })),
  },
  {
    title: "話題タグで見る",
    links: ["ライドシェア", "再エネ", "医療報酬", "公益法人", "官民人材交流センター"].map((label) => ({
      label,
      href: `/corporations?topic=${encodeURIComponent(label)}`,
    })),
  },
];

export default function RankingsPage() {
  const nextDayItems = rankingLists.nextDay.filter((item) => item.value > 0);

  return (
    <div className="flex flex-col gap-10">
      <section className="border-b-2 border-primary pb-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">DATA SUMMARY</p>
        <h1 className="mt-3 text-3xl font-extrabold text-primary md:text-4xl">集計を見る</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
          政府・各省庁等の公表資料に基づく再就職情報を、件数・待機日数などの指標別に整理しています。
        </p>
      </section>

      <DataNotice>
        この集計は公表資料上の件数や日付を比較しやすく表示するものです。特定の評価や判断を示すものではありません。
      </DataNotice>

      <section aria-labelledby="metric-definition-title">
        <h2 id="metric-definition-title" className="mb-4 text-xl font-extrabold text-primary">指標の意味</h2>
        <div className="grid border-y border-outline-variant bg-white/45 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["公表再就職者数", "公表資料に含まれる再就職記録の件数です。"],
          ["退職翌日再就職", "公表された日付から退職翌日として整理した記録の件数です。"],
          ["30日以内再就職", "離職日から30日以内の再就職記録を集計しています。"],
          ["平均待機日数", "法人ごとの離職日から再就職日までの日数の平均です。"],
        ].map(([title, description]) => (
          <div key={title} className="border-b border-outline-variant p-5 last:border-b-0 md:odd:border-r md:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
            <h3 className="font-extrabold text-primary">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
          </div>
        ))}
        </div>
      </section>

      <section aria-labelledby="aggregate-result-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="aggregate-result-title" className="text-2xl font-extrabold text-primary">法人別の集計結果</h2>
          <p className="text-xs font-bold text-on-surface-variant">各行から出典付き詳細へ移動できます</p>
        </div>
        {nextDayItems.length === 0 ? (
          <div className="mb-6 border-l-4 border-outline bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            <strong className="text-primary">退職翌日の再就職記録：</strong> 現在の公開データに該当する記録はありません。
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RankingCard
          title="公表記録数が多い法人（上位20）"
          unit="人"
          rankingType="public_records"
          items={rankingLists.publicRecords.slice(0, 20).map((item) => ({
            label: item.label,
            value: item.value,
            href: `/corporations/${item.corporationSlug}`,
          }))}
        />
        {nextDayItems.length > 0 ? (
          <RankingCard
            title="退職翌日の再就職記録（上位20）"
            unit="件"
            rankingType="next_day"
            items={nextDayItems.slice(0, 20).map((item) => ({
              label: item.label,
              value: item.value,
              href: `/corporations/${item.corporationSlug}`,
            }))}
          />
        ) : null}
        <RankingCard
          title="30日以内の再就職記録（上位20）"
          unit="件"
          rankingType="within_30_days"
          items={rankingLists.within30Days.slice(0, 20).map((item) => ({
            label: item.label,
            value: item.value,
            href: `/corporations/${item.corporationSlug}`,
          }))}
        />
        <RankingCard
          title="平均待機日数が短い法人（上位20）"
          unit="日"
          rankingType="shortest_average_wait"
          items={rankingLists.shortestAverageWaitingDays.slice(0, 20).map((item) => ({
            label: item.label,
            value: item.value,
            href: `/corporations/${item.corporationSlug}`,
          }))}
        />
        </div>
      </section>

      <section className="border-t border-outline-variant pt-7">
        <h2 className="mb-4 text-2xl font-bold text-primary">別の切り口で絞り込む</h2>
        <div className="grid grid-cols-1 border border-outline-variant bg-surface-container-lowest sm:grid-cols-2 lg:grid-cols-4">
          {linkGroups.map((group) => (
            <div
              key={group.title}
              className="border-b border-outline-variant p-4 last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <h3 className="mb-2 text-sm font-bold text-primary">{group.title}</h3>
              <div className="flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <TagChip key={link.label} href={link.href}>
                    {link.label}
                  </TagChip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
