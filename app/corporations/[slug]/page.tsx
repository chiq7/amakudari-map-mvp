import Link from "next/link";
import { Breadcrumb, HighlightStatCard, SourceLinkList, StatCard, TagChip } from "@/components/ui";
import { corporations, getCorporation, persons } from "@/lib/static-content";

const waitDistribution = [
  { label: "退職翌日", value: 12, height: "48%" },
  { label: "7日以内", value: 18, height: "72%" },
  { label: "30日以内", value: 25, height: "100%" },
  { label: "31日以上", value: 17, height: "68%" },
];

export function generateStaticParams() {
  return corporations.map((corporation) => ({ slug: corporation.slug }));
}

export default function CorporationDetailPage({ params }: { params: { slug: string } }) {
  const corporation = getCorporation(params.slug);
  const relatedPersons = persons.filter((person) => person.corporationSlug === corporation.slug);

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        items={[
          { label: "TOP", href: "/" },
          { label: "法人検索", href: "/corporations" },
          { label: corporation.name },
        ]}
      />

      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary md:text-4xl">{corporation.name}</h1>
          <p className="mt-2 text-base text-on-surface-variant">公表資料に基づく再就職情報</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TagChip href={`/corporations?ministry=${encodeURIComponent(corporation.topMinistry)}`}>{corporation.topMinistry}</TagChip>
          <TagChip href={`/corporations?type=${encodeURIComponent(corporation.type)}`}>{corporation.type}</TagChip>
          <TagChip href={`/corporations?region=${encodeURIComponent(corporation.region)}`}>{corporation.region}</TagChip>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="公表再就職者数" value={corporation.count} unit="人" />
        <StatCard label="最多出身省庁" value={`${corporation.topMinistry}（${corporation.topMinistryCount}人）`} />
        <StatCard label="平均待機日数" value={corporation.averageWaitDays} unit="日" />
        <HighlightStatCard label="退職翌日再就職" value={corporation.nextDay} unit="件" />
      </section>

      {corporation.basicInfo && (
        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="text-xl font-bold text-primary">法人基本情報</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            国税庁 法人番号公表サイトに基づく法人基本情報です。
          </p>
          <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {[
              ["法人番号", corporation.basicInfo.corporateNumber],
              ["正式名称", corporation.basicInfo.officialName],
              ["所在地", corporation.basicInfo.registeredAddress],
              ["都道府県", corporation.basicInfo.prefecture],
              ["市区町村", corporation.basicInfo.city],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm font-semibold text-on-surface-variant">{label}</dt>
                <dd className="mt-1 text-base text-primary">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-sm font-semibold text-on-surface-variant">出典</dt>
              <dd className="mt-1">
                <a
                  href={corporation.basicInfo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-secondary hover:underline"
                >
                  {corporation.basicInfo.sourceName}
                </a>
              </dd>
            </div>
          </dl>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-primary">公表再就職者一覧</h2>
        <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface-container-lowest">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">元省庁</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">離職時官職</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">氏名</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">再就職先での地位</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">離職日</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">再就職日</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">待機日数</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">出典</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {relatedPersons.map((person) => (
                <tr key={person.slug} className="hover:bg-surface-container-low">
                  <td className="px-4 py-4 text-sm">{person.ministry}</td>
                  <td className="px-4 py-4 text-sm">{person.formerPosition}</td>
                  <td className="px-4 py-4 text-sm font-bold">
                    <Link href={`/persons/${person.slug}`} className="text-secondary hover:underline">
                      {person.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm">{person.newPosition}</td>
                  <td className="px-4 py-4 font-mono text-sm">{person.retiredAt}</td>
                  <td className="px-4 py-4 font-mono text-sm">{person.reemployedAt}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={person.waitDays === 0 ? "rounded-full bg-secondary-fixed px-3 py-1 text-sm font-bold text-secondary" : "text-sm"}>
                      {person.waitDays}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant">{person.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-xl font-bold text-primary">元省庁の内訳</h2>
          <div className="space-y-3">
            {["国土交通省", "経済産業省", "総務省"].map((ministry, index) => (
              <div key={ministry}>
                <div className="mb-1 flex justify-between text-sm font-semibold">
                  <span>{ministry}</span>
                  <span>{[18, 12, 8][index]}人</span>
                </div>
                <div className="h-2 rounded-full bg-surface-container">
                  <div className="h-2 rounded-full bg-secondary" style={{ width: `${[42, 28, 19][index]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-xl font-bold text-primary">待機日数の分布</h2>
          <div className="flex h-52 items-end justify-between gap-4 px-2 pt-6">
            {waitDistribution.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end">
                  <div className="relative w-full rounded-t bg-secondary-container" style={{ height: item.height }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold">{item.value}</span>
                  </div>
                </div>
                <span className="text-center text-xs font-semibold text-on-surface-variant">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="mb-5 text-2xl font-bold text-primary">関連情報</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <h3 className="mb-2 text-sm font-bold text-on-surface-variant">関連話題</h3>
              <div className="flex flex-wrap gap-2">
                {["独立行政法人", "公益法人", "官民人材交流センター"].map((label) => (
                  <TagChip key={label} href={`/corporations?topic=${encodeURIComponent(label)}`}>
                    {label}
                  </TagChip>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-on-surface-variant">関連省庁</h3>
              <div className="flex flex-wrap gap-2">
                {["国土交通省", "経済産業省", "総務省"].map((label) => (
                  <TagChip key={label} href={`/corporations?ministry=${encodeURIComponent(label)}`}>
                    {label}
                  </TagChip>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold text-on-surface-variant">出典資料</h3>
            <SourceLinkList
              links={[
                { label: "内閣官房：再就職等監視委員会公表資料", href: "https://www.cas.go.jp/" },
                { label: "国土交通省：職員の再就職状況の公表について", href: "https://www.mlit.go.jp/" },
                { label: "経済産業省：離職者再就職情報の定期公表", href: "https://www.meti.go.jp/" },
                { label: "本サイトのデータ方針について", href: "/data-policy" },
              ]}
            />
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              本ページは政府・各省庁等の公表資料に基づき、官民の人材移動を中立的に整理したものです。特定の因果関係や不適切性を断定・示すものではありません。
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["法人情報を詳しく見る", corporation.name, `/corporations/${corporation.slug}`],
          ["省庁別の集計を見る", `${corporation.topMinistry}の再就職統計を見る`, `/corporations?ministry=${encodeURIComponent(corporation.topMinistry)}`],
          ["待機日数から探す", "退職翌日再就職ランキングを見る", "/rankings"],
          ["事例を比較する", "類似の再就職事例を見る", `/corporations?ministry=${encodeURIComponent(corporation.topMinistry)}&waitDays=0`],
        ].map(([label, title, href]) => (
          <Link key={label} href={href} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 hover:border-secondary">
            <span className="text-sm font-semibold text-on-surface-variant">{label}</span>
            <p className="mt-1 font-bold text-primary">{title}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
