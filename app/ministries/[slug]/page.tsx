import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui";
import ShareButton from "@/components/ShareButton";
import { corporations, persons } from "@/lib/static-content";
import { ministryPages } from "@/lib/ministry-pages";
import { newsArticles } from "@/lib/news";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getMinistry(slug: string) {
  return ministryPages.find((ministry) => ministry.slug === slug);
}

export function generateStaticParams() {
  return ministryPages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
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

export default async function MinistryPage(props: PageProps) {
  const params = await props.params;
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
  const totalWithin30Days = matchingPeople.filter((person) => person.waitDays <= 30).length;
  const relatedMinistries = ministryPages
    .filter((candidate) => candidate.slug !== ministry.slug)
    .sort((left, right) => {
      const priority = ["finance", "mlit"];
      const leftPriority = priority.indexOf(left.slug);
      const rightPriority = priority.indexOf(right.slug);
      return (leftPriority === -1 ? priority.length : leftPriority) - (rightPriority === -1 ? priority.length : rightPriority);
    })
    .slice(0, 4);
  const disclosureGuide = newsArticles.find(
    (article) => article.slug === "how-to-read-national-public-servant-reemployment-disclosure-2025",
  );

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
            現在の公開データでは{matchingPeople.length}人・{matchingCorporations.length}法人の記録を確認できます。掲載内容は公表資料の記録であり、個人・法人・省庁の適法性や妥当性を評価するものではありません。
          </p>
        </div>
        <ShareButton title={`${ministry.name}の天下り先一覧 | 天下りマップ`} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["公表再就職者数", `${matchingPeople.length}人`],
          ["関連する再就職先法人", `${matchingCorporations.length}法人`],
          ["30日以内の再就職記録", `${totalWithin30Days}件`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </section>

      {totalNextDay === 0 ? (
        <p className="border-l-4 border-outline bg-surface-container-low px-5 py-4 text-sm leading-7 text-on-surface-variant">
          退職翌日の再就職記録は、現在の公開データでは0件です。
        </p>
      ) : null}

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

        <div className="mt-4 grid gap-3 md:hidden">
          {matchingCorporations.map(({ corporation, people }) => {
            const waitingLabel = people.length === 1
              ? `${people[0].waitDays}日`
              : `平均${Math.round(people.reduce((sum, person) => sum + person.waitDays, 0) / people.length)}日`;
            return (
              <article key={corporation.slug} className="border border-outline-variant bg-surface-container-lowest p-5">
                <h3 className="font-extrabold leading-6 text-primary">{corporation.name}</h3>
                <dl className="mt-3 grid grid-cols-[1fr_auto] gap-3 border-y border-outline-variant py-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold text-on-surface-variant">公表された人物</dt>
                    <dd className="mt-1 space-y-1">
                      {people.map((person) => (
                        <Link key={person.slug} href={`/persons/${person.slug}`} className="block font-bold text-primary hover:underline">
                          {person.name}
                        </Link>
                      ))}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-xs font-semibold text-on-surface-variant">待機日数</dt>
                    <dd className="mt-1 font-extrabold text-primary">{waitingLabel}</dd>
                  </div>
                </dl>
                <Link href={`/corporations/${corporation.slug}`} className="mt-4 inline-flex min-h-11 items-center font-bold text-secondary hover:underline">
                  法人詳細と出典を見る →
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-4 hidden max-w-full overflow-x-auto rounded-lg border border-outline-variant bg-surface-container-lowest md:block">
          <table className="w-full min-w-[620px] text-left">
            <caption className="sr-only">{ministry.name}出身者の再就職先法人と公表人物、待機日数</caption>
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th scope="col" className="px-4 py-3 text-sm font-semibold text-on-surface-variant">法人名</th>
                <th scope="col" className="px-4 py-3 text-sm font-semibold text-on-surface-variant">公表された人物</th>
                <th scope="col" className="px-4 py-3 text-center text-sm font-semibold text-on-surface-variant">待機日数</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">法人詳細</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {matchingCorporations.map(({ corporation, people }) => (
                <tr key={corporation.slug} className="hover:bg-surface-container-low">
                  <td className="px-4 py-4 font-bold text-primary">{corporation.name}</td>
                  <td className="px-4 py-4">
                    <ul className="space-y-1">
                      {people.map((person) => (
                        <li key={person.slug}>
                          <Link href={`/persons/${person.slug}`} className="text-sm font-bold text-primary hover:text-secondary hover:underline">
                            {person.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-semibold text-primary">
                    {people.length === 1
                      ? `${people[0].waitDays}日`
                      : `平均${Math.round(people.reduce((sum, person) => sum + person.waitDays, 0) / people.length)}日`}
                  </td>
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

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-xl font-bold text-primary">ほかの省庁の天下り先一覧を見る</h2>
        <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">同じ形式で、出身省庁ごとの公表再就職情報を確認できます。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {relatedMinistries.map((candidate) => (
            <Link
              key={candidate.slug}
              href={`/ministries/${candidate.slug}`}
              className="rounded-full border border-secondary bg-white px-3 py-2 text-sm font-bold text-secondary hover:bg-secondary-fixed"
            >
              {candidate.name}の天下り先一覧
            </Link>
          ))}
        </div>
      </section>

      {disclosureGuide ? (
        <section className="rounded-lg border border-secondary/25 bg-secondary-fixed/40 p-5">
          <p className="text-xs font-bold tracking-[0.08em] text-secondary">PUBLIC RECORDS EXPLAINED</p>
          <h2 className="mt-2 text-xl font-bold text-primary">公表資料の読み方も確認する</h2>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            この一覧で確認できる範囲と、資料だけでは判断できない事項を解説しています。
          </p>
          <Link href={`/news/${disclosureGuide.slug}`} className="mt-4 inline-flex text-sm font-bold text-secondary hover:underline">
            {disclosureGuide.title} →
          </Link>
        </section>
      ) : null}

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
