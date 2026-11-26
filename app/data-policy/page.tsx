import InternationalDataGuide from "@/components/InternationalDataGuide";
import { formatDate } from "@/lib/display-text";
import Link from "next/link";
import InformationProvisionForm from "@/components/InformationProvisionForm";
import { records, recordCoverage, sources, corporations, persons, publicOfficers, meta } from "@/lib/static-content";
import { newsArticles } from "@/lib/news";
import { SITE_OPERATOR, CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/site-contact";

const usedSourceIds = new Set([
  ...records.map((record) => record.sourceId),
  ...persons.flatMap((person) => person.sourceIds),
  ...corporations.flatMap((corporation) => corporation.sources),
  ...publicOfficers.flatMap((officer) => officer.sourceIds),
]);
const usedSources = sources.filter((source) => usedSourceIds.has(source.id) && new URL(source.url).pathname !== "/");
const recordCorporations = new Set(records.map((record) => record.corporationSlug)).size;
const allSources = [...new Map<string, {url: string; title: string; publisher: string}>([
  ...usedSources.map((source) => [source.url, source] as const),
  ...newsArticles.flatMap((article) => article.sources.map((source) => [source.url, source] as const)),
]).values()];

export default function DataPolicyPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <section className="border-b-2 border-primary pb-8">
        <h1 className="mt-3 text-3xl font-extrabold text-primary md:text-4xl">データについて</h1>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">天下りマップでは、再就職の公表記録を、人・法人・省庁・日付の切り口で検索しやすく整理しています。</p>
      </section>

      <section id="coverage" className="border-t border-outline-variant pt-6">
        <h2 className="text-2xl font-extrabold text-primary">掲載している記録の範囲</h2>
        <p className="mt-3 leading-8 text-on-surface-variant">公表資料から当サイトに取り込んだ範囲は、{persons.length}人の再就職記録{records.length}件です。1人が複数の役職に就いた場合は、就任ごとに1件と数えます。この記録に登場する再就職先は{recordCorporations}法人です。法人一覧の{corporations.length}法人には、役員情報をもとに掲載した法人も含まれます。</p>
        <dl className="mt-4 grid gap-2 text-sm text-on-surface-variant">
          <div><dt className="inline font-bold">掲載記録の離職日　</dt><dd className="inline">{recordCoverage.retirement}</dd></div>
          <div><dt className="inline font-bold">掲載記録の再就職日　</dt><dd className="inline">{recordCoverage.reemployment}</dd></div>
          <div><dt className="inline font-bold">データ反映日　</dt><dd className="inline">{formatDate(meta.lastUpdated)}</dd></div>
        </dl>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">両日付は収録済みの記録の最も早い日と遅い日です。各年度の対象者全体を調べる場合は、下の資料一覧から内閣人事局の年度別・届出区分別の公表表を参照できます。</p>
        <p className="mt-2 text-sm leading-7 text-on-surface-variant">法人の種類が「未分類」の場合は、当サイトのデータに法人種別を登録していません。法人名と再就職の記録は一覧で確認できます。</p>
        <p className="mt-2 text-sm leading-7 text-on-surface-variant">掲載人数は人物ページ単位で集計します。氏名が同じでも、公表表の官職などが異なり本人の一致を確定できない場合は、別の記録として表示します。</p>
        <p className="mt-2 text-sm leading-7 text-on-surface-variant">法人一覧の掲載数は再就職先の登録単位です。公表表の再就職先欄が「自営」の記録も含みます。</p>
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
        <p className="mt-2 text-sm leading-7 text-on-surface-variant">規約ページにアクセス確認画面が表示された場合は、<a href="https://info.gbiz.go.jp/" className="font-semibold text-secondary underline">Gビズインフォのトップページ</a>からも利用案内を開けます。</p>
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
        <p className="mt-3 leading-8 text-on-surface-variant">公表された離職日から再就職日までを暦日で数えます。同じ日は0日、翌日は1日です。「30日以内」には0日から30日までの記録を含みます。たとえば3月31日に離職し4月1日に再就職した記録は、退職翌日と30日以内の両方に入ります。</p>
      </section>

      <section id="contact" className="scroll-mt-36 border border-outline-variant bg-surface-container-low p-6 text-center">
        <h2 className="text-2xl font-extrabold text-primary">情報提供・お問い合わせ</h2>
        <p className="mt-3 text-sm text-on-surface-variant">{SITE_OPERATOR}</p>
        <a href={CONTACT_EMAIL_HREF} className="mt-3 inline-block break-all text-lg font-bold text-secondary underline underline-offset-4">{CONTACT_EMAIL}</a>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">下のフォームで連絡文を用意し、メールアプリで内容を確認して送信してください。</p>
        <InformationProvisionForm />
      </section>

      <InternationalDataGuide />
      <Link href="/" className="text-sm font-bold text-secondary hover:underline">TOPへ戻る →</Link>
    </div>
  );
}
