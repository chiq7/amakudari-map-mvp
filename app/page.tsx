import Link from "next/link";
import { corporations, totals } from "@/lib/static-content";
import { SearchBox, TagChip } from "@/components/ui";

const cutGroups = [
  {
    title: "省庁から見る",
    queryKey: "ministry",
    links: ["国土交通省", "経済産業省", "厚生労働省", "防衛省"].map((label) => ({
      label,
    })),
  },
  {
    title: "業界から見る",
    queryKey: "industry",
    links: ["建設・不動産", "IT・通信", "医療・福祉", "金融", "エネルギー"].map((label) => ({
      label,
    })),
  },
  {
    title: "法人種別から見る",
    queryKey: "type",
    links: ["株式会社", "公益財団法人", "独立行政法人", "一般社団法人"].map((label) => ({
      label,
    })),
  },
  {
    title: "テーマから見る",
    queryKey: "topic",
    links: ["ライドシェア", "再エネ", "防衛", "医療", "インフラ"].map((label) => ({
      label,
    })),
  },
  {
    title: "地域から見る",
    queryKey: "region",
    links: ["東京都", "大阪府", "関東地方"].map((label) => ({
      label,
    })),
  },
];

const featuredCorporations = [
  corporations[0],
  corporations[2],
  corporations[1],
];

const corporationDirectory = [
  { name: "一般財団法人 公共政策総合研究所", count: 42, href: "/corporations/public-policy-research" },
  { name: "株式会社 日本インフラ整備機構", count: 35, href: "/corporations/infrastructure-development" },
  { name: "公益財団法人 国際技術交流協会", count: 28, href: "/corporations/international-technology-exchange" },
  { name: "独立行政法人 都市再生機構", count: 24, href: "/corporations/urban-renaissance" },
  { name: "日本電信電話株式会社", count: 18, href: "/corporations?keyword=日本電信電話" },
  { name: "東日本旅客鉄道株式会社", count: 15, href: "/corporations?keyword=東日本旅客鉄道" },
];

const rankingBlocks = [
  {
    title: "公表再就職者数",
    unit: "人",
    href: "/rankings",
    items: [
      ["一般財団法人 公共政策総合研究所", 42, "/corporations/public-policy-research"],
      ["株式会社 日本インフラ整備機構", 35, "/corporations/infrastructure-development"],
      ["公益財団法人 国際技術交流協会", 28, "/corporations/international-technology-exchange"],
    ],
  },
  {
    title: "退職翌日再就職件数",
    unit: "件",
    href: "/rankings",
    items: [
      ["株式会社 日本インフラ整備機構", 14, "/corporations/infrastructure-development"],
      ["一般財団法人 公共政策総合研究所", 12, "/corporations/public-policy-research"],
      ["公益財団法人 国際技術交流協会", 8, "/corporations/international-technology-exchange"],
    ],
  },
  {
    title: "30日以内再就職件数",
    unit: "件",
    href: "/rankings",
    items: [
      ["一般財団法人 公共政策総合研究所", 25, "/corporations/public-policy-research"],
      ["株式会社 日本インフラ整備機構", 22, "/corporations/infrastructure-development"],
      ["公益財団法人 国際技術交流協会", 15, "/corporations/international-technology-exchange"],
    ],
  },
  {
    title: "平均待機日数が短い法人",
    unit: "日",
    href: "/rankings",
    items: [
      ["株式会社 日本インフラ整備機構", 12, "/corporations/infrastructure-development"],
      ["公益財団法人 国際技術交流協会", 32, "/corporations/international-technology-exchange"],
      ["一般財団法人 公共政策総合研究所", 45, "/corporations/public-policy-research"],
    ],
  },
];

const aggregateGroups = [
  {
    title: "省庁別集計",
    links: [
      ["国土交通省", 124],
      ["経済産業省", 98],
      ["厚生労働省", 85],
      ["財務省", 72],
      ["警察庁", 45],
      ["農林水産省", 38],
    ],
    queryKey: "ministry",
  },
  {
    title: "業務内容別集計",
    links: [
      ["IT・通信", 156],
      ["建設・不動産", 142],
      ["医療・福祉", 118],
      ["金融・保険", 94],
      ["製造", 82],
      ["運輸・物流", 64],
    ],
    queryKey: "industry",
  },
];

function StatTile({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "flex min-h-[132px] flex-col justify-between rounded-lg border p-5 shadow-sm",
        accent
          ? "border-secondary/30 bg-secondary-fixed"
          : "border-outline-variant bg-surface-container-lowest",
      ].join(" ")}
    >
      <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={accent ? "text-4xl font-bold text-secondary" : "text-4xl font-bold text-primary"}>
          {value}
        </span>
        <span className="text-sm font-bold text-on-surface-variant">{unit}</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-5 py-4 text-center md:py-6">
        <div>
          <h1 className="text-4xl font-bold tracking-normal text-primary md:text-5xl">
            公式資料から見る、官民人材移動データベース
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-on-surface-variant md:text-lg">
            政府・各省庁等が公表する再就職関連資料をもとに、法人・省庁・待機日数・地域などの切り口から検索しやすく整理しています。
          </p>
        </div>
        <SearchBox className="w-full max-w-2xl" />
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/corporations" className="rounded bg-primary px-5 py-2 text-sm font-bold text-white">
            法人を検索
          </Link>
          <Link href="/rankings" className="rounded border border-outline-variant px-5 py-2 text-sm font-bold text-on-surface">
            ランキング
          </Link>
          <Link href="/data-policy" className="rounded border border-outline-variant px-5 py-2 text-sm font-bold text-on-surface">
            データ方針
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatTile label="公表再就職情報" value={totals.publicRecords.toLocaleString()} unit="件" />
        <StatTile label="受け入れ法人" value={totals.corporations.toLocaleString()} unit="法人" />
        <StatTile label="退職翌日再就職" value={totals.nextDayCorporations.toLocaleString()} unit="件" accent />
        <StatTile label="30日以内再就職" value={totals.within30DaysCorporations.toLocaleString()} unit="件" />
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-primary">注目の公表情報</h2>
            <p className="mt-1 text-sm text-on-surface-variant">件数や待機日数の観点から、確認されることが多い法人を表示しています。</p>
          </div>
          <Link href="/corporations" className="text-sm font-bold text-secondary hover:underline">
            すべて見る
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {featuredCorporations.map((corporation) => (
            <article key={corporation.slug} className="flex min-h-[260px] flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
              <h3 className="text-lg font-bold text-primary">{corporation.name}</h3>
              <dl className="mt-4 flex flex-col divide-y divide-outline-variant text-sm">
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-on-surface-variant">公表再就職者数</dt>
                  <dd className="font-bold text-secondary">{corporation.count}人</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-on-surface-variant">最多出身省庁</dt>
                  <dd className="font-bold text-primary">{corporation.topMinistry}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-on-surface-variant">退職翌日再就職件数</dt>
                  <dd className="font-bold text-secondary">{corporation.nextDay}件</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-on-surface-variant">30日以内再就職件数</dt>
                  <dd className="font-bold text-secondary">{corporation.within30Days}件</dd>
                </div>
              </dl>
              <Link href={`/corporations/${corporation.slug}`} className="mt-auto pt-4 text-sm font-bold text-secondary hover:underline">
                詳細を見る →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-primary">ランキングから探す</h2>
            <p className="mt-1 text-sm text-on-surface-variant">主要指標ごとの上位法人を一覧できます。</p>
          </div>
          <Link href="/rankings" className="text-sm font-bold text-secondary hover:underline">
            ランキング一覧へ
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          {rankingBlocks.map((block) => (
            <section key={block.title} className="rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
              <div className="border-b border-outline-variant px-4 py-3">
                <h3 className="font-bold text-primary">{block.title}</h3>
              </div>
              <ol className="divide-y divide-outline-variant">
                {block.items.map(([label, value, href], index) => (
                  <li key={label}>
                    <Link href={String(href)} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-container-low">
                      <span className="min-w-0 truncate text-sm font-semibold">
                        <span className="mr-2 text-outline">{index + 1}</span>
                        {label}
                      </span>
                      <span className="shrink-0 text-sm text-on-surface-variant">
                        <strong className="text-lg text-primary">{value}</strong>{block.unit}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <div className="border-t border-outline-variant px-4 py-3 text-right">
                <Link href={block.href} className="text-sm font-bold text-secondary hover:underline">
                  もっと見る
                </Link>
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">法人名から探す</h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              公表資料に記載された受け入れ法人を、法人名や公表再就職者数から確認できます。法人詳細では出身省庁や待機日数の内訳も確認できます。
            </p>
          </div>
          <Link href="/corporations" className="w-fit rounded bg-primary px-5 py-2 text-sm font-bold text-white">
            すべての法人を見る
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {corporationDirectory.map((corporation) => (
            <Link
              key={corporation.name}
              href={corporation.href}
              className="flex items-center justify-between gap-3 rounded border border-outline-variant bg-surface-container-low px-4 py-3 hover:border-secondary"
            >
              <span className="min-w-0 truncate text-sm font-bold text-primary">{corporation.name}</span>
              <span className="shrink-0 text-sm font-semibold text-on-surface-variant">{corporation.count}人</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-primary">話題のタグ</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              省庁・業界・法人種別・テーマ別に、公表情報をたどれます。
            </p>
          </div>
          <Link href="/corporations" className="text-sm font-bold text-secondary hover:underline">
            すべての切り口を見る →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {cutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-xs font-bold text-on-surface-variant">{group.title}</h3>
              <div className="flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <TagChip
                    key={link.label}
                    href={`/corporations?${group.queryKey}=${encodeURIComponent(link.label)}`}
                  >
                    {link.label}
                  </TagChip>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-outline-variant pt-3">
          <p className="mb-2 text-xs font-bold text-on-surface-variant">注目指標</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Link
              href="/corporations?nextDay=true"
              className="flex items-center justify-between rounded border border-secondary/20 bg-secondary-fixed/50 px-3 py-2 hover:border-secondary"
            >
              <span className="text-sm font-bold text-secondary">退職翌日再就職</span>
              <span className="text-right">
                <strong className="text-lg font-bold text-primary">84</strong>
                <span className="ml-1 text-sm font-bold text-on-surface-variant">件</span>
              </span>
            </Link>
            <Link
              href="/corporations?within30Days=true"
              className="flex items-center justify-between rounded border border-secondary/20 bg-secondary-fixed/50 px-3 py-2 hover:border-secondary"
            >
              <span className="text-sm font-bold text-secondary">30日以内再就職</span>
              <span className="text-right">
                <strong className="text-lg font-bold text-primary">248</strong>
                <span className="ml-1 text-sm font-bold text-on-surface-variant">件</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-primary">集計データから探す</h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {aggregateGroups.map((group) => (
            <section key={group.title} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-primary">{group.title}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.links.map(([label, count]) => (
                  <Link
                    key={label}
                    href={`/corporations?${group.queryKey}=${encodeURIComponent(String(label))}`}
                    className="flex items-center justify-between rounded border border-outline-variant bg-surface-container-low px-3 py-2 hover:border-secondary"
                  >
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="font-mono text-sm text-on-surface-variant">{count}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl rounded-lg border border-outline-variant bg-surface-container-low p-7 text-center">
        <h2 className="bg-transparent text-2xl font-bold text-primary">データの見方について</h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          本サイトでは、政府・各省庁等の公表資料をもとに、再就職情報を検索しやすい形に整理しています。ランキングや待機日数は比較のための指標であり、特定の不適切性を示すものではありません。
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-xs leading-relaxed text-on-surface-variant">
          本サイトは公表資料に基づく情報を中立的に整理したものです。掲載情報は、特定の個人・法人・省庁について不適切性を断定するものではありません。
        </p>
        <Link href="/data-policy" className="mt-5 inline-block rounded bg-primary px-6 py-2 text-sm font-bold text-white">
          データ方針を見る
        </Link>
      </section>
    </div>
  );
}
