import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon, MinistryIcon, NewsIcon } from "@/components/icons";
import { topics as topicGroups } from "@/lib/static-content";
import { getMinistryPath } from "@/lib/ministry-pages";
import topicPagesData from "@/public/data/topics.json";

export const metadata: Metadata = {
  title: "省庁・テーマから探す",
  description: "省庁や行政テーマから、関連する人物・法人の公表記録を探せます。",
  alternates: { canonical: "/topics" },
};

type TopicPage = {
  topic_slug: string;
  title: string;
  description?: string;
  caution_text?: string;
};

export default function TopicsPage() {
  const ministries = topicGroups.find((group) => group.category === "ministry")?.items ?? [];
  const themeLabels = topicGroups.find((group) => group.category === "topic")?.items ?? [];
  const publishedTopics = topicPagesData as TopicPage[];
  const publishedByTitle = new Map(
    publishedTopics
      .filter(
        (topic) =>
          Boolean(topic.description && topic.description !== "...") &&
          Boolean(topic.caution_text && topic.caution_text !== "..."),
      )
      .map((topic) => [topic.title, topic.topic_slug]),
  );

  return (
    <div className="flex flex-col gap-12">
      <section className="border-b-2 border-primary pb-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">BROWSE</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">省庁・テーマから探す</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
          出身省庁または行政テーマを入口に、関連する人物と法人の公表記録へ進めます。
        </p>
      </section>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <section aria-labelledby="ministry-list-title">
          <div className="mb-4 flex items-center gap-3">
            <MinistryIcon className="text-secondary" size={24} />
            <div>
              <p className="text-xs font-bold text-on-surface-variant">所属から見る</p>
              <h2 id="ministry-list-title" className="text-2xl font-extrabold text-primary">省庁</h2>
            </div>
          </div>
          <div className="divide-y divide-outline-variant border-y border-outline-variant">
            {ministries.map((ministry) => (
              <Link
                key={ministry}
                href={getMinistryPath(ministry)}
                className="group flex min-h-14 items-center justify-between gap-4 bg-white/55 px-4 py-3 font-bold text-primary transition hover:bg-white"
              >
                <span>{ministry}</span>
                <ArrowRightIcon className="text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={17} />
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="theme-list-title">
          <div className="mb-4 flex items-center gap-3">
            <NewsIcon className="text-accent" size={24} />
            <div>
              <p className="text-xs font-bold text-on-surface-variant">論点から見る</p>
              <h2 id="theme-list-title" className="text-2xl font-extrabold text-primary">行政テーマ</h2>
            </div>
          </div>
          <div className="divide-y divide-outline-variant border-y border-outline-variant">
            {themeLabels.map((theme) => {
              const topicSlug = publishedByTitle.get(theme);
              return (
                <Link
                  key={theme}
                  href={topicSlug ? `/topics/${topicSlug}` : `/corporations?topic=${encodeURIComponent(theme)}`}
                  className="group flex min-h-14 items-center justify-between gap-4 bg-white/55 px-4 py-3 font-bold text-primary transition hover:bg-white"
                >
                  <span>{theme}</span>
                  <span className="flex items-center gap-3 text-xs text-on-surface-variant">
                    {topicSlug ? "専用ページ" : "関連記録"}
                    <ArrowRightIcon className="text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={17} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

    </div>
  );
}
