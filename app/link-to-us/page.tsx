import Image from "next/image";
import Link from "next/link";
import InformationPage from "@/components/InformationPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("リンク・紹介素材", "天下りマップを紹介するための文章、リンク先、ロゴ・共有画像と利用方法。", "/link-to-us");

export default function LinkToUsPage() {
  return (
    <InformationPage title="リンク・紹介素材" lead="記事や資料で天下りマップを紹介するときに使える文章・画像と、目的に合うリンク先です。">
      <section><h2>短い紹介文</h2><p className="border-l-4 border-secondary bg-white px-5 py-4">天下りマップは、国家公務員の再就職先を、人物・法人・省庁のつながりから探せるデータベースです。</p><pre className="mt-3 overflow-x-auto rounded-xl bg-primary p-4 text-xs leading-6 text-white"><code>{'<a href="https://amakudari.jp/">天下りマップ</a>'}</code></pre></section>
      <section><h2>目的に合わせてリンクする</h2><ul className="space-y-2"><li><Link href="/">TOP：注目の解説と検索の入口</Link></li><li><Link href="/corporations">法人一覧：再就職先の企業・団体を探す</Link></li><li><Link href="/persons">人物一覧：氏名から移動をたどる</Link></li><li><Link href="/topics">省庁・テーマ：組織や制度から探す</Link></li><li><Link href="/news">ニュース・解説：業務・制度の接点を読む</Link></li></ul><p className="mt-3">個別の人物・法人・記事を紹介する場合は、その詳細ページのURLを使えます。</p></section>
      <section><h2>ロゴと共有画像</h2><div className="grid gap-5 sm:grid-cols-[180px_1fr]"><div><Image src="/favicon.jpg" width={180} height={180} unoptimized alt="天下りマップのロゴ" className="rounded-xl" /><a href="/favicon.jpg" download className="mt-3 inline-block text-sm">ロゴを保存（400×400）</a></div><div><Image src="/ogp.webp" width={1200} height={630} unoptimized alt="天下りマップの共有用画像" className="h-auto w-full rounded-xl" /><a href="/ogp.png" download className="mt-3 inline-block text-sm">共有画像を保存（1200×630 PNG）</a></div></div></section>
      <section><h2>紹介素材の使い方</h2><p>素材は天下りマップの紹介と、該当する公開ページへのリンクに使えます。縦横比を維持し、文字やマークを改変せずに表示してください。掲載法人への推薦や認定、行政機関との提携を示す印としては使わないでください。</p></section>
    </InformationPage>
  );
}
