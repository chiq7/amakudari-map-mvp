import { rankingLists } from "@/lib/static-content";
import { DataNotice, RankingCard, TagChip } from "@/components/ui";

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
  return (
    <div className="flex flex-col gap-7">
      <section>
        <h1 className="text-3xl font-bold text-primary md:text-4xl">ランキングから探す</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          政府・各省庁等の公表資料に基づく再就職情報を、件数・待機日数などの指標別に整理しています。
        </p>
      </section>

      <DataNotice>
        ランキングは公表資料上の件数や日付を比較しやすく表示するものです。特定の評価や判断を示すものではありません。
      </DataNotice>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <span className="shrink-0 text-sm font-semibold text-on-surface-variant">絞り込み:</span>
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
              <label>
                <span className="sr-only">省庁で絞り込む</span>
                <select
                  defaultValue=""
                  className="h-9 w-full rounded border border-outline-variant bg-surface px-2 text-sm text-on-surface-variant"
                >
                  <option value="">すべての省庁</option>
                  <option>国土交通省</option>
                  <option>経済産業省</option>
                  <option>総務省</option>
                  <option>内閣府</option>
                </select>
              </label>
              <label>
                <span className="sr-only">法人種別で絞り込む</span>
                <select
                  defaultValue=""
                  className="h-9 w-full rounded border border-outline-variant bg-surface px-2 text-sm text-on-surface-variant"
                >
                  <option value="">すべての法人種別</option>
                  <option>公益法人</option>
                  <option>独立行政法人</option>
                  <option>一般財団法人</option>
                  <option>株式会社</option>
                </select>
              </label>
              <label>
                <span className="sr-only">地域で絞り込む</span>
                <select
                  defaultValue=""
                  className="h-9 w-full rounded border border-outline-variant bg-surface px-2 text-sm text-on-surface-variant"
                >
                  <option value="">すべての地域</option>
                  <option>東京都</option>
                  <option>関東地方</option>
                  <option>大阪府</option>
                  <option>近畿地方</option>
                </select>
              </label>
            </div>
            <label className="relative w-full lg:w-56">
              <span className="sr-only">キーワード検索</span>
              <input
                type="search"
                placeholder="キーワード検索"
                className="h-9 w-full rounded border border-outline-variant bg-surface px-3 text-sm text-on-surface placeholder:text-on-surface-variant"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-outline-variant pt-3 md:grid-cols-4">
            {["公表再就職者数", "退職翌日再就職", "30日以内再就職", "平均待機日数"].map((label, index) => (
              <button
                key={label}
                type="button"
                className={`min-h-10 rounded border px-3 py-2 text-sm font-semibold ${
                  index === 0
                    ? "border-secondary/40 bg-secondary-fixed text-secondary"
                    : "border-outline-variant bg-surface text-on-surface-variant"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RankingCard
          title="公表再就職者数ランキング"
          unit="人"
          items={rankingLists.publicRecords.map((item) => ({
            label: item.label,
            value: item.value,
            href: `/corporations/${item.corporationSlug}`,
          }))}
        />
        <RankingCard
          title="退職翌日再就職件数ランキング"
          unit="件"
          items={rankingLists.nextDay.map((item) => ({
            label: item.label,
            value: item.value,
            href: `/corporations/${item.corporationSlug}`,
          }))}
        />
        <RankingCard
          title="30日以内再就職ランキング"
          unit="件"
          items={rankingLists.within30Days.map((item) => ({
            label: item.label,
            value: item.value,
            href: `/corporations/${item.corporationSlug}`,
          }))}
        />
        <RankingCard
          title="平均待機日数が短い法人"
          unit="日"
          items={rankingLists.shortestAverageWaitingDays.map((item) => ({
            label: item.label,
            value: item.value,
            href: `/corporations/${item.corporationSlug}`,
          }))}
        />
      </section>

      <section className="border-t border-outline-variant pt-7">
        <h2 className="mb-4 text-2xl font-bold text-primary">ランキングを別の切り口で見る</h2>
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest sm:grid-cols-2 lg:grid-cols-4">
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
