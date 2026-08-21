import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "このサイトについて",
  description: "天下りマップでできることと、人物・法人・省庁からの探し方を紹介します。",
  alternates: { canonical: "/about" },
};

const guides = [
  { title: "人からたどる", body: "離職時の官職、再就職先、日付を時系列で見られます。", href: "/persons" },
  { title: "法人から読む", body: "法人の仕事、公表された人物、出身省庁を一つのページでつなげます。", href: "/corporations" },
  { title: "省庁・テーマで比べる", body: "省庁ごとの記録や、行政テーマに関わる法人を横断して探せます。", href: "/topics" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "このサイトについて" }]} />
      <header className="border-b-2 border-primary pb-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">ABOUT</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">人の移動を、組織と仕事から読む。</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
          天下りマップは、政府・各省庁等が公表する再就職情報を、人物、法人、省庁、業務分野のつながりから読める形に整理したデータベースです。
        </p>
      </header>

      <section aria-labelledby="guide-title">
        <h2 id="guide-title" className="text-2xl font-extrabold text-primary">3つの入口</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {guides.map((guide, index) => (
            <Link key={guide.title} href={guide.href} className="border-t-4 border-secondary bg-surface-container-low px-5 py-6 transition hover:bg-secondary-fixed/40">
              <p className="text-xs font-extrabold text-secondary">0{index + 1}</p>
              <h3 className="mt-3 text-lg font-extrabold text-primary">{guide.title}</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">{guide.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="text-xl font-extrabold text-primary">サイトで見られること</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-7 text-on-surface-variant md:grid-cols-2">
          <li>人物ごとの離職時官職と再就職先</li>
          <li>法人の業務内容と公表された人物記録</li>
          <li>省庁ごとの再就職先法人と待機日数</li>
          <li>制度・行政テーマを解説する記事</li>
        </ul>
      </section>

      <Link href="/data-policy#contact" className="self-start text-sm font-bold text-secondary hover:underline">情報提供・お問い合わせ →</Link>
    </div>
  );
}
