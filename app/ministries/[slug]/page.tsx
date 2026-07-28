import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui";
import ShareButton from "@/components/ShareButton";
import { corporations, persons } from "@/lib/static-content";
import { ministryPages } from "@/lib/ministry-pages";

type PageProps = {
  params: { slug: string };
};

function getMinistry(slug: string) {
  return ministryPages.find((ministry) => ministry.slug === slug);
}

export function generateStaticParams() {
  return ministryPages.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const ministry = getMinistry(params.slug);
  if (!ministry) return {};

  const title = `${ministry.name}の天下り先一覧`;
  const description = `${ministry.name}出身者に関する公表再就職情報を、再就職先法人・件数・待機日数とともに一覧で確認できます。政府公表資料に基づくデータベースです。`;

  return {
    title,
    description,
    alternates: { canonical: `/ministries/${ministry.slug}` },
    openGraph: { title, description, url: `/ministries/${ministry.slug}`, images: ["/ogp.png"] },
    twitter: { title, description, images: ["/ogp.png"] },
  };
}

export default function MinistryPage({ params }: PageProps) {
  const ministry = getMinistry(params.slug);
  if (!ministry) notFound();

  const matchingPeople = persons.filter((person) => person.ministry === ministry.name);
  const peopleByCorporation = new Map<string, typeof matchingPeople>();
  matchingPeople.forEach((person) => {
    const people = peopleByCorporation.get(person.corporationSlug) ?? [];
    people.push(person);
    peopleByCorporation.set(person.corporationSlug, people);
  });
  const matchingCorporations = Array.from(peopleByCorporation.entries())
    .flatMap(([corporationSlug, people]) => {
      const corporation = corporations.find((candidate) => candidate.slug === corporationSlug);
      return corporation ? [{ corporation, people }] : [];
    })
    .sort((left, right) => right.people.length - left.people.length);
  const totalNextDay = matchingPeople.filter((person) => person.waitDays === 0).length;

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        items={[
          { label: "TOP", href: "/" },
          { label: "省庁別一覧", href: "/corporations" },
          { label: ministry.name },
        ]}
      />
      <section className="mx-auto flex max-w-4xl flex-wrap items-start justify-between gap-3 text-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-secondary">省庁別の公表再就職情報</p>
          <h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">
            {ministry.name}の天下り先一覧
          </h1>
          <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
            政府公表資料に記載された{ministry.name}出身者の再就職情報を、再就職先法人ごとに整理しています。
            掲載内容は公表資料の記録であり、個人・法人・省庁の適法性や妥当性を評価するものではありません。
          </p>
        </div>
        <ShareButton title={`${ministry.name}の天下り先一覧 | 天下りマップ`} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["公表再就職者数", `${matchingPeople.length}人`],
          ["関連する再就職先法人", `${matchingCorporations.length}法人`],
          ["退職翌日再就職の記録", `${totalNextDay}件`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-primary">再就職先法人一覧</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              公表再就職者数の多い順に表示しています。法人詳細では出典や個別の公表記録を確認できます。
            </p>
          </div>
          <Link href={`/corporations?ministry=${encodeURIComponent(ministry.name)}`} className="text-sm font-bold text-secondary hover:underline">
            条件を変えて法人検索する
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-outline-variant bg-surface-container-lowest">
          <table className="w-full min-w-[680px] text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">法人名</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">公表再就職者数</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">退職翌日</th>
                <th className="px-4 py-3 text-sm font-semibold text-on-surface-variant">所在地域</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {matchingCorporations.map(({ corporation, people }) => (
                <tr key={corporation.slug} className="hover:bg-surface-container-low">
                  <td className="px-4 py-4 font-bold text-primary">{corporation.name}</td>
                  <td className="px-4 py-4 text-center font-semibold">{people.length}人</td>
                  <td className="px-4 py-4 text-center font-semibold text-secondary">
                    {people.filter((person) => person.waitDays === 0).length}件
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant">{corporation.region}</td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/corporations/${corporation.slug}`} className="text-sm font-bold text-secondary hover:underline">
                      詳細を見る
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-low p-6">
        <h2 className="text-xl font-bold text-primary">データについて</h2>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          この一覧は、政府・各省庁等が公表する再就職関連資料をもとに作成しています。氏名や所属の表記、対象範囲は出典資料に準じます。
        </p>
        <Link href="/data-policy" className="mt-4 inline-block text-sm font-bold text-secondary hover:underline">
          データ方針を確認する →
        </Link>
      </section>
    </div>
  );
}
