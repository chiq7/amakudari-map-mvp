import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb, SourceLinkList, StatCard, TagChip } from "@/components/ui";
import { getPerson, persons } from "@/lib/static-content";

export function generateStaticParams() {
  return persons.map((person) => ({ person_slug: person.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { person_slug: string };
}): Metadata {
  const person = getPerson(params.person_slug);
  const title = `${person.name}氏の公表再就職情報`;
  const description = `${person.name}氏の${person.ministry}における官職と、${person.corporationName}への再就職に関する公表資料を整理しています。`;
  return {
    title,
    description,
    alternates: { canonical: `/persons/${params.person_slug}` },
    openGraph: {
      title,
      description,
      url: `/persons/${params.person_slug}`,
      images: ["/ogp.png"],
    },
    twitter: { title, description, images: ["/ogp.png"] },
  };
}

export default function PersonDetailPage({ params }: { params: { person_slug: string } }) {
  const person = getPerson(params.person_slug);
  const [corporationType, ...corporationNameParts] = person.corporationName.split(" ");
  const corporationDisplayName = corporationNameParts.join(" ");

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        items={[
          { label: "TOP", href: "/" },
          { label: "法人検索", href: "/corporations" },
          { label: person.corporationName, href: `/corporations/${person.corporationSlug}` },
          { label: person.name },
        ]}
      />

      <section>
        <h1 className="text-3xl font-bold text-primary md:text-4xl">{person.name} 氏の公表再就職情報</h1>
        <p className="mt-2 text-base text-on-surface-variant">政府・各省庁等の公表資料に基づく再就職情報</p>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
        <p className="text-sm leading-relaxed text-on-surface-variant">
          本ページは公表資料に記載された氏名・官職・再就職先を整理したものです。同姓同名の別人が含まれる可能性があるため、人物の特定には出典資料もあわせて確認してください。個人への評価や違法性を断定するものではありません。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="元省庁" value={person.ministry} />
        <StatCard label="離職時官職" value={person.formerPosition} />
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
          <p className="mb-1 text-sm text-on-surface-variant">再就職先</p>
          <p className="text-sm font-semibold text-on-surface-variant">{corporationType}</p>
          <p className="mt-1 text-xl font-bold text-primary">{corporationDisplayName}</p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-secondary/30 bg-secondary-fixed p-4 shadow-sm">
          <p className="text-sm text-on-surface-variant">待機日数</p>
          <p className="flex shrink-0 items-baseline gap-1 text-primary">
            <span className="text-4xl font-bold">{person.waitDays}</span>
            <span className="text-sm font-semibold text-on-surface-variant">日</span>
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-6 text-2xl font-bold text-primary">再就職プロフィール・フロー</h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded bg-on-surface-variant px-2 py-1 text-sm font-semibold text-surface">離職時</span>
              <span className="font-mono text-sm text-on-surface-variant">{person.retiredAt} 離職</span>
            </div>
            <p className="text-sm text-on-surface-variant">所属省庁</p>
            <p className="mt-1 text-lg font-bold">{person.ministry}</p>
            <div className="my-4 border-t border-outline-variant" />
            <p className="text-sm text-on-surface-variant">役職名</p>
            <p className="mt-1">{person.formerPosition}</p>
          </div>

          <div className="rounded-lg border border-secondary/20 bg-surface-container-lowest p-4 text-center shadow-sm">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-lg font-bold text-on-secondary">
              →
            </div>
            <p className="text-sm font-bold text-secondary">待機期間 {person.waitDays}日</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {person.waitDays === 0 ? "離職翌日の再就職として整理" : "公表日付に基づき算出"}
            </p>
          </div>

          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded bg-secondary px-2 py-1 text-sm font-semibold text-on-secondary">再就職先</span>
              <span className="font-mono text-sm text-on-surface-variant">{person.reemployedAt} 就任</span>
            </div>
            <p className="text-sm text-on-surface-variant">法人名</p>
            <Link href={`/corporations/${person.corporationSlug}`} className="mt-1 block text-lg font-bold text-secondary hover:underline">
              {person.corporationName}
            </Link>
            <div className="my-4 border-t border-outline-variant" />
            <p className="text-sm text-on-surface-variant">役職名</p>
            <p className="mt-1">{person.newPosition}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold text-on-surface-variant">関連タグ</h2>
        <div className="flex flex-wrap gap-2">
          <TagChip href={`/corporations?ministry=${encodeURIComponent(person.ministry)}`}>国土交通省</TagChip>
          <TagChip href="/corporations?nextDay=true" active={person.waitDays === 0}>
            退職翌日再就職
          </TagChip>
          <TagChip href="/corporations?type=一般財団法人">一般財団法人</TagChip>
          <TagChip href="/corporations?region=東京都">東京都</TagChip>
          <TagChip href={`/corporations?position=${encodeURIComponent(person.newPosition)}`}>専務理事</TagChip>
          <TagChip href="/corporations?position=管理職">管理職</TagChip>
          <TagChip href="/corporations?tag=再就職情報">再就職情報</TagChip>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-xl font-bold text-primary">出典・公表資料</h2>
          <SourceLinkList
            links={[
              { label: person.source, href: "https://www.cas.go.jp/" },
              { label: "国土交通省：退職公務員の再就職状況報告", href: "https://www.mlit.go.jp/" },
            ]}
          />
          <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
            本ページに記載されている情報は、公的資料に基づき機械的に整理したものです。掲載されている個人の資質や再就職の正当性について評価を行うものではありません。
          </p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-xl font-bold text-primary">関連リンク</h2>
          <div className="flex flex-col gap-3">
            <Link href={`/corporations/${person.corporationSlug}`} className="font-semibold text-secondary hover:underline">
              法人情報を詳しく見る
            </Link>
            <Link href={`/corporations?ministry=${encodeURIComponent(person.ministry)}`} className="font-semibold text-secondary hover:underline">
              国土交通省の再就職統計を見る
            </Link>
            <Link href="/rankings" className="font-semibold text-secondary hover:underline">
              ランキングを見る
            </Link>
            <Link href={`/corporations?ministry=${encodeURIComponent(person.ministry)}&waitDays=0`} className="font-semibold text-secondary hover:underline">
              類似の再就職事例を見る
            </Link>
            <Link href="/data-policy" className="font-semibold text-secondary hover:underline">
              データ方針について
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
