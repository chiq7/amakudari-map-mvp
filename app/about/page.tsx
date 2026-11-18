import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumb } from "@/components/ui";
import InternationalDataGuide from "@/components/InternationalDataGuide";
import { SITE_OPERATOR, CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/site-contact";

export const metadata = pageMetadata("天下りマップについて｜再就職等規制と公表資料の読み方", "国家公務員の再就職等規制と、内閣官房の公表資料で確認できる元の官職・再就職先・就任時の役職、掲載範囲と編集方法を説明します。", "/about");

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
        <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">公務員の再就職先や企業・団体の背景を調べたい読者に向けて、氏名・日付・役職を横断して探し、法人の仕事までつなげて読めるようにしています。</p>
      </header>

      <section id="reemployment-rules" aria-labelledby="rules-title">
        <h2 id="rules-title" className="text-2xl font-extrabold text-primary">国家公務員の再就職等規制と公表制度</h2>
        <p className="mt-3 leading-8 text-on-surface-variant">国家公務員法は、他の職員の再就職のあっせん、在職中の利害関係企業への求職、退職後に元の職場へ契約などを働きかける行為をそれぞれ規制しています。対象になる行為と例外は、<a href="https://www5.cao.go.jp/kanshi/kisei/shurui/gaiyou.html" className="font-bold text-secondary underline">内閣府の再就職等監視委員会の解説</a>で確認できます。</p>
        <p className="mt-2 leading-8 text-on-surface-variant">内閣官房は、報告・届出に基づき、離職時の官職や再就職先、就任時の役職などを公表しています。天下りマップはその一部を収録し、人物・省庁・法人から探せるようにしています。<Link href="/data-policy#coverage" className="font-bold text-secondary underline">当サイトの収録期間と原資料</Link>から掲載範囲を確認できます。</p>
      </section>
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

      <section className="border-t border-outline-variant pt-6">
        <h2 className="text-xl font-extrabold text-primary">記録から背景へ</h2>
        <p className="mt-3 text-sm leading-8 text-on-surface-variant">人物ページから勤務先の法人へ、法人ページから関係する人物・省庁へ進めます。制度や業務の背景は<Link href="/news" className="font-bold text-secondary underline">ニュース・解説</Link>、件数や日付の比較は<Link href="/rankings" className="font-bold text-secondary underline">集計</Link>で読む構成です。</p>
      </section>
      <section className="border-t border-outline-variant pt-6">
        <h2 className="text-xl font-extrabold text-primary">情報の整理・更新</h2>
        <p className="mt-3 text-sm leading-8 text-on-surface-variant">公表された離職・再就職の記録を整理し、法人の業務や役員情報は公的法人情報・法人公式情報を使って補っています。資料の取り込み、表記の整理、解説の下書きには自動処理・AIを使う場合があります。掲載する氏名・役職・日付は元資料との対応を保持し、訂正できる形で管理しています。</p>
        <p className="mt-3 text-sm leading-8 text-on-surface-variant">法人一覧は指定した検索・絞り込み・並び順に従います。TOPの記事は最終更新日順、関係法人は最新の記事との関連と記録数を使って表示します。記事の公開日・更新日と、再就職や資料公表の時点は別です。</p>
        <h3 id="ai-editing" className="mt-5 font-bold text-primary">AIを使った編集の例</h3>
        <p className="mt-2 text-sm leading-8 text-on-surface-variant">2026年11月19日の見直しでは、AIを使って<Link href="/news/meti-reemployment-disclosure-fy2025" className="font-bold text-secondary underline">経済産業省の解説記事</Link>とデータ案内の説明文を編集しました。記事に示す74件は内閣官房の公表表を対象条件で数え直した件数です。省庁別の一覧に表示する件数は、当サイトに取り込んだ再就職記録から算出しています。</p>
        <Link href="/data-policy" className="mt-3 inline-block text-sm font-bold text-secondary underline">データの範囲と元資料を見る</Link>
      </section>
      <section className="border-t border-outline-variant pt-6">
        <h2 className="text-xl font-extrabold text-primary">運営と連絡</h2>
        <dl className="mt-4 space-y-3 text-sm leading-7">
          <div className="flex flex-wrap gap-x-5"><dt className="font-bold text-primary">運営者</dt><dd>{SITE_OPERATOR}</dd></div>
          <div className="flex flex-wrap gap-x-5"><dt className="font-bold text-primary">お問い合わせ</dt><dd><a href={CONTACT_EMAIL_HREF} className="font-bold text-secondary underline underline-offset-4">{CONTACT_EMAIL}</a></dd></div>
        </dl>
        <p className="mt-3 text-sm leading-8 text-on-surface-variant">天下りマップは、掲載している行政機関・法人の公式サイトではありません。掲載内容の修正、情報提供、削除・非表示の相談は、対象ページURLと具体的な箇所を添えてご連絡ください。</p>
        <Link href="/data-policy#contact" className="mt-3 inline-block text-sm font-bold text-secondary underline">情報提供・お問い合わせ →</Link>
      </section>
      <InternationalDataGuide />
      <nav aria-label="利用案内" className="flex flex-wrap gap-x-5 gap-y-3 border-t border-outline-variant pt-6 text-sm font-bold text-secondary">
        <Link href="/faq" className="underline">よくある質問</Link><Link href="/privacy" className="underline">プライバシーポリシー</Link><Link href="/terms" className="underline">利用規約</Link><Link href="/link-to-us" className="underline">リンク・紹介素材</Link>
      </nav>
    </div>
  );
}
