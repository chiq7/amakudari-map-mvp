import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb, TagChip } from "@/components/ui";
import CorporationBusinessContext from "@/components/CorporationBusinessContext";
import ShareButton from "@/components/ShareButton";
import { getCorporation, getPublicOfficer, publicOfficers } from "@/lib/static-content";

export function generateStaticParams() {
  return publicOfficers.map((officer) => ({ slug: officer.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const officer = getPublicOfficer(params.slug);
  const title = officer ? `${officer.name}氏の公表役員プロフィール` : "公表役員プロフィール";
  const description = officer
    ? `${officer.corporationName}が公表している${officer.name}氏の役員・経歴情報を整理しています。`
    : "法人の公表情報に基づく役員プロフィールです。";
  return {
    title,
    description,
    alternates: { canonical: `/public-officers/${params.slug}` },
    openGraph: { title, description, url: `/public-officers/${params.slug}`, images: ["/ogp.png"] },
    twitter: { title, description, images: ["/ogp.png"] },
  };
}

export default async function PublicOfficerPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const officer = getPublicOfficer(params.slug);
  if (!officer) notFound();

  const corporation = getCorporation(officer.corporationSlug);
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

      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-secondary">公表役員プロフィール</p>
          <h1 className="mt-1 text-3xl font-bold text-primary md:text-4xl">{officer.name} 氏</h1>
          <p className="mt-2 text-base text-on-surface-variant">
            {officer.corporationName}が公表している役員・経歴情報
          </p>
        </div>
        <ShareButton title={`${officer.name}氏の公表役員プロフィール | 天下りマップ`} />
      </section>

      <CorporationBusinessContext
        corporation={corporation}
        connection={`${officer.name}氏について、${officer.formerOrganization}での経歴と、${officer.corporationName}の「${officer.role}」への就任が法人公式情報で公表されています。`}
      />

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
          {corporation.topics.slice(0, 3).map((topic) => (
            <TagChip key={topic} href={`/corporations?topic=${encodeURIComponent(topic)}`}>
              {topic}
            </TagChip>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-xl font-bold text-primary">関連リンク</h2>
          <Link
            href={`/corporations/${officer.corporationSlug}`}
            className="font-semibold text-secondary hover:underline"
          >
            {officer.corporationName}の法人情報を見る
          </Link>
      </section>
    </div>
  );
}
