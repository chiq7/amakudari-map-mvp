import Link from "next/link";
import InformationProvisionForm from "@/components/InformationProvisionForm";
import { records, sources, corporations, persons, publicOfficers, meta } from "@/lib/static-content";
import { newsArticles } from "@/lib/news";
import { SITE_OPERATOR, CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/site-contact";

const usedSourceIds = new Set([
  ...records.map((record) => record.sourceId),
  ...persons.flatMap((person) => person.sourceIds),
  ...corporations.flatMap((corporation) => corporation.sources),
  ...publicOfficers.flatMap((officer) => officer.sourceIds),
]);
const usedSources = sources.filter((source) => usedSourceIds.has(source.id) && new URL(source.url).pathname !== "/");
const allSources = [...new Map<string, {url: string; title: string; publisher: string}>([
  ...usedSources.map((source) => [source.url, source] as const),
  ...newsArticles.flatMap((article) => article.sources.map((source) => [source.url, source] as const)),
]).values()];

export default function DataPolicyPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <section className="border-b-2 border-primary pb-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">DATA GUIDE</p>
        <h1 className="mt-3 text-3xl font-extrabold text-primary md:text-4xl">データについて</h1>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">天下りマップでは、再就職の公表記録を、人・法人・省庁・日付の切り口で検索しやすく整理しています。</p>
      </section>

      <section id="coverage" className="border-t border-outline-variant pt-6">
        <h2 className="text-2xl font-extrabold text-primary">掲載している記録の範囲</h2>
        <p className="mt-3 leading-8 text-on-surface-variant">現在の掲載は{records.length.toLocaleString()}件の再就職記録、{persons.length.toLocaleString()}人、{corporations.length.toLocaleString()}法人です。公表資料全体をそのまま収録した件数ではなく、当サイトへ取り込んだ記録を集計しています。複数回の再就職がある人物は、記録数と人物数が異なります。</p>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">データ反映日：{meta.lastUpdated.replaceAll("-", ".")}。離職日・再就職日と元資料の対象期間は、それぞれの記録・資料の時点です。</p>
      </section>

      <section id="sources" className="border-t border-outline-variant pt-6">
        <h2 className="text-2xl font-extrabold text-primary">元資料・情報の提供元</h2>
        <p className="mt-3 leading-8 text-on-surface-variant">内閣官房などが公表した再就職情報、Gビズインフォの法人情報、法人の公式発表、制度に関する行政資料をもとに、天下りマップが検索・集計・解説用に整理しています。</p>
        <details className="mt-5 rounded-xl border border-outline-variant bg-white p-5">
          <summary className="cursor-pointer font-bold text-primary">人物・法人・解説で使っている資料を見る（{allSources.length}件）</summary>
          <ul className="mt-4 divide-y divide-outline-variant">
            {allSources.map((source) => <li key={source.url} className="py-3"><p className="text-xs text-on-surface-variant">{source.publisher}</p><a href={source.url} data-analytics-event="source_link" data-analytics-location="data_sources" className="mt-1 inline-block text-sm font-bold leading-6 text-secondary underline underline-offset-4">{source.title}</a></li>)}
          </ul>
        </details>
      </section>

      <section id="dataset-license" className="border-t border-outline-variant pt-6">
        <h2 className="text-2xl font-extrabold text-primary">データの利用条件</h2>
        <p className="mt-3 leading-8 text-on-surface-variant">公表データを再利用する場合は、提供元の利用条件を確認してください。編集・加工した内容は、その旨と元資料の提供元・URLを示し、行政機関や法人が作成した原資料そのものと区別してください。当サイト独自の文章・画像の利用は<Link href="/terms" className="font-bold text-secondary underline">利用規約</Link>、紹介用素材は<Link href="/link-to-us" className="font-bold text-secondary underline">リンク・紹介素材</Link>で案内します。</p>
        <ul className="mt-3 space-y-2 text-sm"><li><a href="https://www.cas.go.jp/jp/tyosakuken/index.html" className="text-secondary underline">内閣官房のコピーライトポリシー</a></li><li><a href="https://help.info.gbiz.go.jp/hc/ja/articles/4795140981406-%E5%88%A9%E7%94%A8%E8%A6%8F%E7%B4%84" className="text-secondary underline">Gビズインフォの利用規約</a></li></ul>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["人物", "離職時の所属・官職、再就職先、役職、日付"],
          ["法人", "業務内容、公表された人物記録、関連する省庁・テーマ"],
          ["集計", "公表記録数、待機日数、期間ごとの比較"],
        ].map(([title, text]) => (
          <div key={title} className="border-t-4 border-secondary bg-surface-container-low px-5 py-6">
            <h2 className="text-lg font-extrabold text-primary">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{text}</p>
          </div>
        ))}
      </section>

      <section id="waiting-period" className="border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="text-2xl font-extrabold text-primary">待機日数の見方</h2>
        <p className="mt-3 leading-8 text-on-surface-variant">待機日数は、離職日から再就職日までの日数です。法人や省庁ごとの記録を比べるために表示しています。</p>
      </section>

      <section id="contact" className="scroll-mt-36 border border-outline-variant bg-surface-container-low p-6 text-center">
        <h2 className="text-2xl font-extrabold text-primary">情報提供・お問い合わせ</h2>
        <p className="mt-3 text-sm text-on-surface-variant">{SITE_OPERATOR}</p>
        <a href={CONTACT_EMAIL_HREF} className="mt-3 inline-block break-all text-lg font-bold text-secondary underline underline-offset-4">{CONTACT_EMAIL}</a>
        <p className="mt-2 text-sm leading-7 text-on-surface-variant">メールでご連絡ください。下のフォームで連絡文を作成・コピーできます。</p>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">対象ページのURLと、修正・追加したい内容を連絡文にまとめられます。この操作では送信されません。</p>
        <InformationProvisionForm />
      </section>

      <Link href="/" className="text-sm font-bold text-secondary hover:underline">TOPへ戻る →</Link>
    </div>
  );
}
