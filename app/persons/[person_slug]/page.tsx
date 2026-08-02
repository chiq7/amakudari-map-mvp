import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb, SourceLinkList, StatCard, TagChip } from "@/components/ui";
import ShareButton from "@/components/ShareButton";
import { getCorporation, getPerson, persons, sources } from "@/lib/static-content";

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
  const corporation = getCorporation(person.corporationSlug);
  const sourceLinks = person.sourceIds.flatMap((sourceId) => {
    const source = sources.find((item) => item.id === sourceId);
    return source
      ? [{ label: `${source.publisher}：${source.title}`, href: source.url }]
      : [];
  });

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-primary md:text-4xl">{person.name} 氏の公表再就職情報</h1>
            <p className="mt-2 text-base text-on-surface-variant">政府・各省庁等の公表資料に基づく再就職情報</p>
          </div>
          <ShareButton title={`${person.name}氏の公表再就職情報 | 天下りマップ`} />
        </div>
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
          <p className="text-sm font-semibold text-on-surface-variant">{corporation.type}</p>
          <p className="mt-1 text-xl font-bold text-primary">{person.corporationName}</p>
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
              {person.waitDays === 0 ? "離職日と再就職日が同日" : "公表日付に基づき算出"}
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
          <TagChip href={`/corporations?ministry=${encodeURIComponent(person.ministry)}`}>{person.ministry}</TagChip>
          <TagChip href={`/corporations?type=${encodeURIComponent(corporation.type)}`}>{corporation.type}</TagChip>
          {corporation.region && corporation.region !== "不明" ? (
            <TagChip href={`/corporations?region=${encodeURIComponent(corporation.region)}`}>{corporation.region}</TagChip>
          ) : null}
          {person.waitDays === 0 ? (
            <TagChip href="/corporations?flag=nextDay" active>
              離職日と再就職日が同日
            </TagChip>
          ) : null}
          {person.tags.filter((tag) => tag !== person.ministry).slice(0, 3).map((tag) => (
            <TagChip key={tag} href={`/corporations?tag=${encodeURIComponent(tag)}`}>{tag}</TagChip>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-xl font-bold text-primary">出典・公表資料</h2>
          <SourceLinkList links={sourceLinks} />
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
              {person.ministry}の関連記録を見る
            </Link>
            <Link href="/rankings" className="font-semibold text-secondary hover:underline">
              ランキングを見る
            </Link>
            <Link href={`/corporations?ministry=${encodeURIComponent(person.ministry)}&sort=waitDays`} className="font-semibold text-secondary hover:underline">
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
