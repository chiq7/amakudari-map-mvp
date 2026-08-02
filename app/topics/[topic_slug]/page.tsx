import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb, DataNotice } from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";
import { corporations, persons, publicOfficers } from "@/lib/static-content";
import topicPagesData from "@/public/data/topics.json";

type TopicPage = {
  topic_slug: string;
  title: string;
  description?: string;
  caution_text?: string;
};

const topicPages = topicPagesData as TopicPage[];

export function generateStaticParams() {
  return topicPages.map((topic) => ({ topic_slug: topic.topic_slug }));
}

export function generateMetadata({ params }: { params: { topic_slug: string } }): Metadata {
  const topic = topicPages.find((item) => item.topic_slug === params.topic_slug);
  return {
    title: topic ? `${topic.title}に関連する公表記録` : "テーマ別公表記録",
    alternates: { canonical: `/topics/${params.topic_slug}` },
    robots: { index: false, follow: true },
  };
}

export default function TopicDetailPage({ params }: { params: { topic_slug: string } }) {
  const topic = topicPages.find((item) => item.topic_slug === params.topic_slug);

  if (!topic) return <p>テーマが見つかりませんでした。</p>;

  const relatedCorporations = corporations.filter((corporation) =>
    [...corporation.topics, ...corporation.relatedTags].includes(topic.title),
  );
  const relatedCorporationSlugs = new Set(relatedCorporations.map((corporation) => corporation.slug));
  const relatedPeople = persons.filter((person) => relatedCorporationSlugs.has(person.corporationSlug));
  const relatedPublicOfficers = publicOfficers.filter((officer) => relatedCorporationSlugs.has(officer.corporationSlug));
  const relatedProfileCount = relatedPeople.length + relatedPublicOfficers.length;

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "省庁・テーマ", href: "/topics" }, { label: topic.title }]} />

      <section className="border-b-2 border-primary pb-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">TOPIC</p>
        <h1 className="mt-3 text-3xl font-extrabold text-primary md:text-4xl">{topic.title}に関連する公表記録</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
          テーマに関連付けられた法人・人物の公開情報を、出典とあわせて確認できます。
        </p>
      </section>

      <section aria-labelledby="related-records-title">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-outline-variant pb-4">
          <div>
            <p className="text-sm font-bold text-on-surface-variant">現在の公開データ</p>
            <h2 id="related-records-title" className="mt-1 text-2xl font-extrabold text-primary">関連付けられた記録</h2>
          </div>
          <p className="text-sm font-bold text-primary">
            {relatedCorporations.length}法人 / {relatedProfileCount}人
          </p>
        </div>

        {relatedCorporations.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {relatedCorporations.map((corporation) => {
              const corporationPeople = relatedPeople.filter((person) => person.corporationSlug === corporation.slug);
              const corporationOfficers = relatedPublicOfficers.filter((officer) => officer.corporationSlug === corporation.slug);
              const profileNames = [
                ...corporationPeople.map((person) => person.name),
                ...corporationOfficers.map((officer) => officer.name),
              ];
              return (
                <article key={corporation.slug} className="border border-outline-variant bg-surface-container-lowest p-5">
                  <p className="text-xs font-bold text-on-surface-variant">{corporation.type}</p>
                  <h3 className="mt-1 text-lg font-extrabold text-primary">{corporation.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    関連する公表人物 {profileNames.length}人
                    {profileNames.length > 0 ? ` / ${profileNames.join("、")}` : ""}
                  </p>
                  <Link
                    href={`/corporations/${corporation.slug}`}
                    className="mt-4 inline-flex min-h-11 items-center gap-2 border border-primary px-4 text-sm font-bold text-primary transition hover:bg-surface-container-low"
                  >
                    詳細と出典を見る <ArrowRightIcon size={17} />
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 border border-outline-variant bg-surface-container-low px-5 py-6 text-sm leading-7 text-on-surface-variant">
            現在の公開データには、このテーマに関連付けられた記録がありません。
          </p>
        )}

        <Link
          href={`/corporations?topic=${encodeURIComponent(topic.title)}`}
          className="mt-5 inline-flex min-h-11 items-center gap-2 bg-secondary px-5 text-sm font-bold text-white transition hover:bg-secondary-container"
        >
          関連する法人を一覧で見る <ArrowRightIcon size={17} />
        </Link>
      </section>

      <DataNotice>
        テーマは記録を探すための検索タグです。表示された法人・人物との因果関係、評価、違法性を示すものではありません。
      </DataNotice>
    </div>
  );
}
