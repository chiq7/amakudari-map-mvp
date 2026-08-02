import { rankingLists } from "@/lib/static-content";
import { DataNotice, TagChip } from "@/components/ui";
import RankingExplorer, { type ComparisonGroup } from "@/components/RankingExplorer";
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
  const comparisonGroups: ComparisonGroup[] = [
    {
      id: "public_records",
      label: "複数の公表記録",
      title: "公表記録が複数ある法人",
      description: "1件のみの法人を大量に並べず、2件以上の記録がある法人だけを比較します。",
      unit: "人",
      items: rankingLists.publicRecords.filter((item) => item.value > 1),
    },
    {
      id: "within_30_days",
      label: "30日以内が複数",
      title: "30日以内の記録が複数ある法人",
      description: "30日以内の記録が2件以上ある法人だけを表示し、差がある部分に絞っています。",
      unit: "件",
      items: rankingLists.within30Days.filter((item) => item.value > 1),
    },
    {
      id: "waiting_days",
      label: "待機日数の差",
      title: "平均待機日数に差がある法人",
      description: "大半を占める平均1日の法人を除き、平均待機日数が2日以上の法人を長い順に比較します。",
      unit: "日",
      items: rankingLists.shortestAverageWaitingDays
        .filter((item) => item.value > 1)
        .sort((left, right) => right.value - left.value)
        .slice(0, 12),
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="border-b-2 border-primary pb-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">DATA SUMMARY</p>
        <h1 className="mt-3 text-3xl font-extrabold text-primary md:text-4xl">集計を見る</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
          政府・各省庁等の公表資料に基づく再就職情報を、件数・待機日数などの指標別に整理しています。
        </p>
      </section>

      <details className="group border border-outline-variant bg-surface-container-lowest">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-extrabold text-primary [&::-webkit-details-marker]:hidden">
          <span>集計の見方・4つの指標について</span>
          <span className="text-xs text-secondary">
            <span className="group-open:hidden">確認する ＋</span>
            <span className="hidden group-open:inline">閉じる －</span>
          </span>
        </summary>
        <div className="border-t border-outline-variant p-4">
          <DataNotice className="mb-4">
            件数や日付を比較しやすくした集計です。特定の評価や判断を示すものではありません。
          </DataNotice>
          <dl className="grid gap-x-8 gap-y-4 md:grid-cols-2">
            {[
              ["公表再就職者数", "公表資料に含まれる再就職記録の件数"],
              ["退職翌日再就職", "公表日付から退職翌日として整理した記録の件数"],
              ["30日以内再就職", "離職日から30日以内の再就職記録の件数"],
              ["平均待機日数", "法人ごとの離職日から再就職日までの日数の平均"],
            ].map(([title, description]) => (
              <div key={title}>
                <dt className="text-sm font-extrabold text-primary">{title}</dt>
                <dd className="mt-1 text-xs leading-6 text-on-surface-variant">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>

      <section aria-labelledby="aggregate-result-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="aggregate-result-title" className="text-2xl font-extrabold text-primary">法人別の集計結果</h2>
          <p className="text-xs font-bold text-on-surface-variant">各行から出典付き詳細へ移動できます</p>
        </div>
        {nextDayItems.length === 0 ? (
          <DataNotice className="mb-6 border-l-accent bg-accent/10">
            <strong className="block text-primary">退職翌日の再就職記録は0件でした</strong>
            現在の公開データでは比較対象がないため、この指標のランキングは表示していません。
          </DataNotice>
        ) : null}
        <RankingExplorer groups={comparisonGroups} />
      </section>

      <section className="border-t border-outline-variant pt-7">
        <h2 className="mb-4 text-2xl font-bold text-primary">別の切り口で絞り込む</h2>
        <div className="grid grid-cols-1 border border-outline-variant bg-surface-container-lowest sm:grid-cols-3">
          {linkGroups.map((group) => (
            <div
              key={group.title}
              className="border-b border-outline-variant p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
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
