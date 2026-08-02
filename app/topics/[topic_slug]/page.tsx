import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb, DataNotice } from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";
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

      <section className="grid gap-8 md:grid-cols-[1fr_0.8fr] md:items-start">
        <div className="border-y border-outline-variant bg-white/55 px-5 py-6">
          <p className="text-sm font-bold text-on-surface-variant">関連データ</p>
          <h2 className="mt-2 text-xl font-extrabold text-primary">法人・人物の記録を見る</h2>
          <Link
            href={`/corporations?topic=${encodeURIComponent(topic.title)}`}
            className="mt-6 inline-flex min-h-11 items-center gap-2 bg-secondary px-5 text-sm font-bold text-white transition hover:bg-secondary-container"
          >
            関連する法人を表示 <ArrowRightIcon size={17} />
          </Link>
        </div>
        <DataNotice>
          テーマとの関連表示は検索の入口です。掲載だけで個別の因果関係、評価、違法性を示すものではありません。
        </DataNotice>
      </section>
    </div>
  );
}
