import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb, RelatedLinks, SourceLinkList, TagChip } from "@/components/ui";
import ShareButton from "@/components/ShareButton";
import { canonicalUrl } from "@/lib/seo";
import { getNewsArticle, newsArticles } from "@/lib/news";

export function generateStaticParams() {
  return newsArticles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getNewsArticle(params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url: `/news/${article.slug}`,
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      images: ["/ogp.png"],
    },
    twitter: {
      title: article.title,
      description: article.description,
      images: ["/ogp.png"],
    },
  };
}

function formatDate(value: string) {
  return value.replace(/-/g, ".");
}

export default function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = getNewsArticle(params.slug);
  if (!article) notFound();

  const articleUrl = canonicalUrl(`/news/${article.slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        headline: article.title,
        description: article.description,
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        mainEntityOfPage: articleUrl,
        url: articleUrl,
        image: canonicalUrl("/ogp.png"),
        inLanguage: "ja-JP",
        isBasedOn: article.sources.map((source) => source.url),
        citation: article.sources.map((source) => source.url),
      },
      {
        "@type": "FAQPage",
        mainEntity: article.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <article className="flex max-w-4xl flex-col gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <Breadcrumb
        items={[
          { label: "TOP", href: "/" },
          { label: "ニュース・解説", href: "/news" },
          { label: article.title },
        ]}
      />

      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <TagChip>{article.kind}</TagChip>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-primary md:text-4xl">{article.title}</h1>
          </div>
          <ShareButton title={`${article.title} | 天下りマップ`} />
        </div>
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{article.lead}</p>
        <p className="mt-4 text-sm text-on-surface-variant">
          公開日：<time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time>
          <span className="mx-2">/</span>
          更新日：<time dateTime={article.dateModified}>{formatDate(article.dateModified)}</time>
        </p>
      </header>

      <section className="rounded-lg border border-outline-variant bg-surface-container-low p-5">
        <h2 className="text-xl font-bold text-primary">この記事で確認できた事実</h2>
        <div className="mt-4 space-y-4">
          {article.verifiedFacts.map((fact) => (
            <div key={fact.title} className="rounded border border-outline-variant bg-surface-container-lowest p-4">
              <h3 className="font-bold text-on-surface">{fact.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{fact.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary">経緯・時系列</h2>
        <ol className="mt-5 space-y-4 border-l-2 border-secondary/40 pl-5">
          {article.timeline.map((item) => (
            <li key={`${item.date}-${item.label}`}>
              <time dateTime={item.date} className="text-sm font-bold text-secondary">{formatDate(item.date)}</time>
              <h3 className="mt-1 font-bold text-on-surface">{item.label}</h3>
              <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary">資料とデータを確認する手順</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {article.readingGuide.map((guide, index) => (
            <div key={guide.title} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
              <p className="text-sm font-bold text-secondary">STEP {index + 1}</p>
              <h3 className="mt-2 font-bold text-on-surface">{guide.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{guide.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-low p-5">
        <h2 className="text-xl font-bold text-primary">資料だけでは確認できないこと</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-on-surface-variant">
          {article.notVerified.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-xl font-bold text-primary">一次資料・確認日</h2>
        <div className="mt-4 space-y-3">
          {article.sources.map((source) => (
            <div key={source.url}>
              <p className="text-sm text-on-surface-variant">
                {source.kind} / {source.publisher}
                {source.publishedAt ? ` / 公表日 ${formatDate(source.publishedAt)}` : ""}
                {` / 確認日 ${formatDate(source.checkedAt)}`}
              </p>
              <SourceLinkList links={[{ label: source.title, href: source.url }]} />
            </div>
          ))}
        </div>
      </section>

      <RelatedLinks title="関連データ・ページ" links={article.relatedLinks} />

      <section>
        <h2 className="text-2xl font-bold text-primary">よくある質問</h2>
        <div className="mt-4 space-y-3">
          {article.faq.map((item) => (
            <details key={item.question} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <summary className="cursor-pointer font-bold text-on-surface">{item.question}</summary>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="text-sm leading-relaxed text-on-surface-variant">
        新しい根拠資料がある場合は、{<Link href="/data-policy#contact" className="font-semibold text-secondary hover:underline">掲載内容の修正・情報提供</Link>}からお知らせください。
      </p>
    </article>
  );
}
