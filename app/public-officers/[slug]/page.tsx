import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb, SourceLinkList, TagChip } from "@/components/ui";
import { getPublicOfficer, publicOfficers, sources } from "@/lib/static-content";

export function generateStaticParams() {
  return publicOfficers.map((officer) => ({ slug: officer.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const officer = getPublicOfficer(params.slug);
  const title = officer ? `${officer.name}氏の公表役員プロフィール` : "公表役員プロフィール";
  const description = officer
    ? `${officer.corporationName}が公表している${officer.name}氏の役員・経歴情報を、出典とあわせて整理しています。`
    : "法人の公表情報に基づく役員プロフィールです。";
  return {
    title,
    description,
    alternates: { canonical: `/public-officers/${params.slug}` },
    openGraph: { title, description, url: `/public-officers/${params.slug}`, images: ["/ogp.png"] },
    twitter: { title, description, images: ["/ogp.png"] },
  };
}

export default function PublicOfficerPage({ params }: { params: { slug: string } }) {
  const officer = getPublicOfficer(params.slug);
  if (!officer) notFound();

  const relatedSources = sources.filter((source) => officer.sourceIds.includes(source.id));

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        items={[
          { label: "TOP", href: "/" },
          { label: "法人検索", href: "/corporations" },
          { label: officer.corporationName, href: `/corporations/${officer.corporationSlug}` },
          { label: officer.name },
        ]}
      />

      <section>
        <p className="text-sm font-semibold text-secondary">公表役員プロフィール</p>
        <h1 className="mt-1 text-3xl font-bold text-primary md:text-4xl">{officer.name} 氏</h1>
        <p className="mt-2 text-base text-on-surface-variant">
          {officer.corporationName}が公表している役員・経歴情報
        </p>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
        <p className="text-sm leading-relaxed text-on-surface-variant">
          本ページは法人の公式発表・会社情報に掲載された公開プロフィールを整理したものです。国家公務員の再就職状況公表資料に基づく記録とは区別しており、退職日・就任日は確認できる範囲を超えて推測していません。個人への評価、違法性、責任を断定するものではありません。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["元行政機関", officer.formerOrganization],
          ["公表経歴", officer.formerPosition],
          ["現在の役職", `${officer.corporationName} ${officer.role}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-sm text-on-surface-variant">{label}</p>
            <p className="mt-2 font-bold text-primary">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-xl font-bold text-primary">公開プロフィールに基づく経歴</h2>
        <p className="mt-3 leading-relaxed text-on-surface-variant">{officer.profile}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <TagChip href={`/corporations?ministry=${encodeURIComponent(officer.formerOrganization)}`}>
            {officer.formerOrganization}
          </TagChip>
          <TagChip href="/corporations?tag=モビリティ">モビリティ</TagChip>
          <TagChip href="/corporations?tag=電動キックボード">電動キックボード</TagChip>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-xl font-bold text-primary">出典・公開情報</h2>
          <SourceLinkList
            links={relatedSources.map((source) => ({
              label: `${source.publisher}：${source.title}`,
              href: source.url,
            }))}
          />
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-xl font-bold text-primary">関連リンク</h2>
          <Link
            href={`/corporations/${officer.corporationSlug}`}
            className="font-semibold text-secondary hover:underline"
          >
            {officer.corporationName}の法人情報を見る
          </Link>
        </div>
      </section>
    </div>
  );
}
