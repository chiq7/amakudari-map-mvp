import Link from "next/link";
import { corporations, rankingLists, records } from "@/lib/static-content";
import RankingExplorer, { type ComparisonGroup } from "@/components/RankingExplorer";
import { ArrowRightIcon, MinistryIcon } from "@/components/icons";
import { pageMetadata } from "@/lib/seo";
import { formatDate, isSelfEmployed } from "@/lib/display-text";
import { getMinistryPath } from "@/lib/ministry-pages";

const corporationRows = corporations
  .filter((corporation) => !isSelfEmployed(corporation.name) && corporation.count > 1)
  .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "ja"))
  .slice(0, 30);

const ministryRows = Array.from(
  records.reduce((groups, record) => {
    const group = groups.get(record.fromMinistry) ?? { records: 0, persons: new Set<string>(), corporations: new Set<string>() };
    group.records += 1;
    group.persons.add(record.personSlug);
    group.corporations.add(record.corporationSlug);
    groups.set(record.fromMinistry, group);
    return groups;
  }, new Map<string, { records: number; persons: Set<string>; corporations: Set<string> }>()),
)
  .map(([name, group]) => ({
    name,
    path: getMinistryPath(name),
    records: group.records,
    persons: group.persons.size,
    corporations: group.corporations.size,
  }))
  .sort((left, right) => right.records - left.records || left.name.localeCompare(right.name, "ja"));

const reemploymentDates = records.map((record) => record.reemploymentDate).filter(Boolean).sort();
const dateRange = reemploymentDates.length
  ? `${formatDate(reemploymentDates[0])}〜${formatDate(reemploymentDates[reemploymentDates.length - 1])}`
  : "";

export const metadata = pageMetadata(
  "天下り先の多い企業・法人ランキング｜公表された再就職記録の件数で比較",
  `国家公務員の公表再就職記録${records.length}件を、受け入れ件数の多い企業・法人、出身省庁、離職から就任までの日数で比べられます。`,
  "/rankings",
);

function withoutSelfEmployed(items: ComparisonGroup["items"]) {
  return items.filter((item) => !isSelfEmployed(item.label));
}

export default function RankingsPage() {
  const comparisonGroups: ComparisonGroup[] = [
    {
      id: "next_day",
      label: "退職翌日",
      title: "退職翌日に就任した記録が多い法人",
      description: "離職日の翌日に就任した記録の件数順です。",
      unit: "件",
      items: withoutSelfEmployed(rankingLists.nextDay.filter((item) => item.value > 1)),
    },
    {
      id: "within_30_days",
      label: "30日以内",
      title: "離職から30日以内の記録が多い法人",
      description: "離職日から30日以内に就任した記録が2件以上ある法人です。",
      unit: "件",
      items: withoutSelfEmployed(rankingLists.within30Days.filter((item) => item.value > 1)),
    },
    {
      id: "waiting_days",
      label: "待機日数が長い",
      title: "離職から就任までの平均日数が長い法人",
      description: "離職日から就任日までの日数の平均が長い順に、上位20法人です。",
      unit: "日",
      items: withoutSelfEmployed(rankingLists.shortestAverageWaitingDays)
        .filter((item) => item.value > 1)
        .sort((left, right) => right.value - left.value)
        .slice(0, 20),
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="border-b-2 border-primary pb-8">
        <h1 className="text-3xl font-extrabold text-primary md:text-4xl">天下り先の多い企業・法人ランキング</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
          国家公務員の再就職の公表記録{records.length}件{dateRange ? `（再就職日 ${dateRange}）` : ""}から、
          受け入れた件数の多い企業・法人と、出身省庁ごとの件数を並べています。
        </p>
      </section>

      <section aria-labelledby="corporation-ranking-title">
        <h2 id="corporation-ranking-title" className="text-2xl font-extrabold text-primary">受け入れ件数の多い企業・法人</h2>
        <p className="mt-1 text-sm text-on-surface-variant">公表記録が2件以上ある法人の上位{corporationRows.length}法人です。</p>
        <ol className="mt-4 divide-y divide-outline-variant border-y border-outline-variant bg-surface-container-lowest">
          {corporationRows.map((corporation, index) => (
            <li key={corporation.slug}>
              <Link href={`/corporations/${corporation.slug}`} className="group grid min-h-16 grid-cols-[40px_1fr_auto] items-center gap-3 px-3 py-3 hover:bg-surface-container-low">
                <span className="font-mono text-xs font-extrabold text-on-surface-variant">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block font-bold leading-6 text-primary group-hover:text-secondary">{corporation.name}</span>
                  <span className="block text-xs text-on-surface-variant">主な出身：{corporation.topMinistry}</span>
                </span>
                <span className="flex items-center gap-3 text-on-surface-variant">
                  <span><strong className="text-xl text-primary">{corporation.count}</strong> 件</span>
                  <ArrowRightIcon className="transition group-hover:translate-x-1" size={16} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="ministry-ranking-title">
        <h2 id="ministry-ranking-title" className="text-2xl font-extrabold text-primary">再就職の記録が多い省庁</h2>
        <p className="mt-1 text-sm text-on-surface-variant">離職時の所属ごとの件数です。省庁を選ぶと再就職先の一覧を見られます。</p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {ministryRows.map((ministry, index) => (
            <li key={ministry.name}>
              <Link href={ministry.path} className="group flex min-h-14 items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-outline-variant/60 transition hover:ring-secondary/40">
                <span className="w-6 shrink-0 font-mono text-xs font-extrabold text-on-surface-variant">{index + 1}</span>
                <MinistryIcon className="shrink-0 text-secondary" size={18} />
                <span className="min-w-0 flex-1 font-bold text-primary">{ministry.name}</span>
                <span className="shrink-0 text-xs text-on-surface-variant">
                  <strong className="text-base text-primary">{ministry.records}</strong>件・{ministry.persons}人
                </span>
                <ArrowRightIcon className="shrink-0 text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={15} />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="other-ranking-title">
        <h2 id="other-ranking-title" className="mb-4 text-2xl font-extrabold text-primary">離職から就任までの日数で比べる</h2>
        <RankingExplorer groups={comparisonGroups} />
      </section>

      <section className="grid gap-3 border-t border-outline-variant pt-7 sm:grid-cols-2">
        <Link href="/ministries" className="group flex min-h-14 items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 font-bold text-primary ring-1 ring-outline-variant/60 hover:ring-secondary/40">
          省庁別の天下り先一覧 <ArrowRightIcon className="text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={16} />
        </Link>
        <Link href="/corporations" className="group flex min-h-14 items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 font-bold text-primary ring-1 ring-outline-variant/60 hover:ring-secondary/40">
          企業・法人を名前や種別で探す <ArrowRightIcon className="text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={16} />
        </Link>
      </section>
    </div>
  );
}
