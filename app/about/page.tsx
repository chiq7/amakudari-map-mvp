import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb, DataNotice } from "@/components/ui";

export const metadata: Metadata = {
  title: "このサイトについて",
  description:
    "天下りマップの目的、掲載範囲、表現方針、出典の確認方法について説明します。",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    title: "公表された事実を整理する",
    body: "政府・各省庁等が公表した再就職資料をもとに、人物、法人、省庁のつながりを探しやすくします。",
  },
  {
    title: "事実と評価を分ける",
    body: "掲載だけを理由に、違法性、癒着、採用の経緯、個人や法人の妥当性を断定しません。",
  },
  {
    title: "出典までたどれる",
    body: "個別の記録には確認に使った公表資料と確認日を示し、元資料へ戻れる導線を設けます。",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "このサイトについて" }]} />

      <header className="border-b-2 border-primary pb-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">ABOUT</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          公表資料を、探しやすく読むためのサイトです。
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
          天下りマップは、政府・各省庁等が公表する再就職情報を、氏名、再就職先法人、出身省庁などから検索できるように整理したデータベースです。
        </p>
      </header>

      <section aria-labelledby="purpose-title">
        <h2 id="purpose-title" className="text-2xl font-extrabold text-primary">大切にしている3つの方針</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {principles.map((principle, index) => (
            <article key={principle.title} className="border-t-4 border-secondary bg-surface-container-low px-5 py-6">
              <p className="text-xs font-extrabold text-secondary">0{index + 1}</p>
              <h3 className="mt-3 text-lg font-extrabold text-primary">{principle.title}</h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="text-xl font-extrabold text-primary">このサイトで分かること</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-on-surface-variant">
            <li>公表資料に記載された人物の離職時官職と再就職先</li>
            <li>法人ごとの公表再就職者と確認できる業務概要</li>
            <li>省庁別の再就職先法人と待機日数の集計</li>
            <li>各記録の出典資料と確認日</li>
          </ul>
        </div>
        <div className="border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="text-xl font-extrabold text-primary">このサイトだけでは分からないこと</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-on-surface-variant">
            <li>採用に至った経緯や個別の意思決定</li>
            <li>人物・法人・省庁間の因果関係</li>
            <li>掲載後の異動など、資料公表後の最新状況</li>
            <li>公表資料に記載されていない事実</li>
          </ul>
        </div>
      </section>

      <DataNotice>
        データは公表時点の情報です。表記の違いや整理上の誤りに気づいた場合は、出典を添えてお知らせください。
      </DataNotice>

      <nav aria-label="サイト方針の関連ページ" className="grid gap-3 sm:grid-cols-2">
        <Link href="/data-policy" className="border border-primary bg-primary px-5 py-4 font-bold text-white transition hover:bg-secondary-container">
          データ方針・出典を確認する →
        </Link>
        <Link href="/data-policy#contact" className="border border-outline-variant bg-white px-5 py-4 font-bold text-primary transition hover:border-secondary">
          修正・情報提供について →
        </Link>
      </nav>
    </div>
  );
}
