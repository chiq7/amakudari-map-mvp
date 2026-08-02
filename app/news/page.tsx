import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb, TagChip } from "@/components/ui";
import { newsArticles } from "@/lib/news";

export const metadata: Metadata = {
  title: "天下り関連ニュース・解説",
  description:
    "再就職の公表資料、制度変更、国会・行政の動きのうち、天下りマップのデータと一次資料で確認できる内容を整理します。",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "天下り関連ニュース・解説",
    description:
      "一次資料と天下りマップのデータをつなぎ、再就職・制度・行政の動きを整理します。",
    url: "/news",
    images: ["/ogp.png"],
  },
  twitter: {
    title: "天下り関連ニュース・解説",
    description:
      "一次資料と天下りマップのデータをつなぎ、再就職・制度・行政の動きを整理します。",
    images: ["/ogp.png"],
  },
};

function formatDate(value: string) {
  return value.replace(/-/g, ".");
}

export default function NewsIndexPage() {
  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "ニュース・解説" }]} />

      <section className="border-b-2 border-primary pb-8 pt-2">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">NEWS & EXPLAINERS</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          <span className="block md:inline">公表資料から読む</span>
          <span className="block md:ml-2 md:inline">ニュース・解説</span>
        </h1>
        <p className="mt-5 max-w-3xl text-pretty leading-8 text-on-surface-variant">
          政治・行政ニュースのうち、再就職、公的法人、監督官庁、制度、国会質疑に直接関係し、一次資料で確認できる内容だけを扱います。報道の転載や、根拠のない人物・法人評価は行いません。
        </p>
      </section>

      <aside className="border-l-4 border-accent bg-accent-soft/55 py-3 pl-5 pr-4 text-sm leading-relaxed text-on-surface-variant">
        <h2 className="font-bold text-primary">掲載基準（補足）</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>一次資料のURLと確認日を記事内に残します。</li>
          <li>確認できた事実と、資料だけでは確認できない事項を分けます。</li>
          <li>新しい事実が不足する日は、既存の有望ページを深く更新します。</li>
        </ul>
      </aside>

      <section aria-labelledby="article-list-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 id="article-list-title" className="text-2xl font-extrabold text-primary">解説記事</h2>
          <p className="text-sm font-bold text-on-surface-variant">{newsArticles.length}件</p>
        </div>
        <div className="divide-y divide-outline-variant border-y border-outline-variant">
        {newsArticles.map((article) => (
          <article key={article.slug} className="bg-white/55">
            <Link href={`/news/${article.slug}`} className="group grid gap-5 px-1 py-6 transition hover:bg-white md:grid-cols-[150px_1fr_auto] md:items-start md:px-5">
              <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant md:block">
                <TagChip>{article.kind}</TagChip>
                <time className="md:mt-3 md:block" dateTime={article.datePublished}>{formatDate(article.datePublished)}</time>
              </div>
              <div>
                <h3 className="text-balance text-xl font-extrabold leading-8 text-primary transition group-hover:text-secondary md:text-2xl">
                  {article.title}
                </h3>
                <p className="mt-3 leading-relaxed text-on-surface-variant">{article.description}</p>
                <p className="mt-4 text-sm text-on-surface-variant">
                一次資料：{article.sources.filter((source) => source.kind === "一次資料").length}件 / 最終確認 {formatDate(article.sources[0].checkedAt)}
                </p>
              </div>
              <span className="mt-1 text-sm font-bold text-secondary">解説を読む →</span>
            </Link>
          </article>
        ))}
        </div>
      </section>
    </div>
  );
}
