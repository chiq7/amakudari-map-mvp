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
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "ニュース・解説" }]} />

      <section className="rounded-3xl bg-primary px-6 py-9 text-white md:px-10 md:py-12">
        <p className="text-xs font-extrabold tracking-[0.14em] text-[#f2b2a8]">NEWS & EXPLAINERS</p>
        <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight md:text-4xl">公表資料から読むニュース・解説</h1>
        <p className="mt-5 max-w-3xl text-pretty leading-8 text-white/72">
          政治・行政ニュースのうち、再就職、公的法人、監督官庁、制度、国会質疑に直接関係し、一次資料で確認できる内容だけを扱います。報道の転載や、根拠のない人物・法人評価は行いません。
        </p>
      </section>

      <section className="rounded-2xl bg-secondary-fixed/60 p-5 text-sm leading-relaxed text-on-surface-variant ring-1 ring-secondary/15">
        <h2 className="font-bold text-primary">掲載基準</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>一次資料のURLと確認日を記事内に残します。</li>
          <li>確認できた事実と、資料だけでは確認できない事項を分けます。</li>
          <li>新しい事実が不足する日は、既存の有望ページを深く更新します。</li>
        </ul>
      </section>

      <section className="grid gap-4">
        {newsArticles.map((article) => (
          <article key={article.slug} className="rounded-2xl bg-surface-container-lowest p-6 shadow-card ring-1 ring-outline-variant/70">
            <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
              <TagChip>{article.kind}</TagChip>
              <time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time>
            </div>
            <h2 className="mt-4 text-balance text-xl font-extrabold leading-8 text-primary md:text-2xl">
              <Link href={`/news/${article.slug}`} className="hover:text-secondary hover:underline">
                {article.title}
              </Link>
            </h2>
            <p className="mt-3 leading-relaxed text-on-surface-variant">{article.description}</p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-on-surface-variant">
                一次資料：{article.sources.filter((source) => source.kind === "一次資料").length}件 / 最終確認 {formatDate(article.sources[0].checkedAt)}
              </p>
              <Link href={`/news/${article.slug}`} className="text-sm font-bold text-secondary hover:underline">
                解説を読む →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
