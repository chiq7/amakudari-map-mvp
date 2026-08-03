import newsData from "@/data/news/articles.json";

export type NewsSource = {
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  checkedAt: string;
  kind: "一次資料" | "補足資料";
};

export type NewsArticle = {
  slug: string;
  kind: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  lead: string;
  verifiedFacts: Array<{ title: string; body: string }>;
  readingGuide: Array<{ title: string; body: string }>;
  timeline: Array<{ date: string; label: string; body: string }>;
  notVerified: string[];
  sources: NewsSource[];
  relatedLinks: Array<{ label: string; href: string }>;
  faq: Array<{ question: string; answer: string }>;
};

export const newsArticles = (newsData as NewsArticle[]).sort(
  (left, right) =>
    right.dateModified.localeCompare(left.dateModified) ||
    right.datePublished.localeCompare(left.datePublished),
);

export function getNewsArticle(slug: string) {
  return newsArticles.find((article) => article.slug === slug);
}
