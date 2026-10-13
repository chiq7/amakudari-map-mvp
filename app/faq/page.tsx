import Link from "next/link";
import InformationPage from "@/components/InformationPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("よくある質問", "天下りマップの探し方、掲載件数・待機日数の見方、訂正依頼、共有について。", "/faq");

export default function FaqPage() {
  return (
    <InformationPage title="よくある質問" lead="探し方や数字の見方など、天下りマップを使うときの疑問をまとめました。">
      <section><h2>誰が、どこへ再就職したかを調べるには？</h2><p>氏名が分かる場合は<Link href="/persons">人物一覧</Link>、勤務先から探す場合は<Link href="/corporations">法人一覧</Link>へ。人物ページでは元の所属・官職と再就職先・新しい役職、法人ページでは業務内容と関係する人物を見られます。</p></section>
      <section><h2>省庁ごとの再就職先を比較できますか？</h2><p><Link href="/topics">省庁・テーマの入口</Link>から省庁別ページへ進めます。<Link href="/rankings">集計ページ</Link>では掲載記録数や待機日数を比べられます。</p></section>
      <section><h2>掲載件数は全国の再就職者の総数ですか？</h2><p>いいえ。件数は当サイトに掲載している記録の数です。一人に複数の再就職記録がある場合もあるため、記録数・人物数・法人数は一致しません。資料の範囲は<Link href="/data-policy">データについて</Link>で案内しています。</p></section>
      <section><h2>待機日数はどう計算していますか？</h2><p>離職日から再就職日までの日数です。短い順・件数順などの表示は、この記録上の日付と件数で比較しています。</p></section>
      <section><h2>離職時の役職と現在の役職は同じですか？</h2><p>人物ページの「再就職後の役職」は公表された再就職時点の役職です。現在の在職状況は、法人の公式サイトなどの最新情報と区別して読む必要があります。</p></section>
      <section><h2>利用料金や会員登録は必要ですか？</h2><p>閲覧・検索・退職手当モデルの試算は無料です。現在、会員登録や有料購入の機能はありません。</p></section>
      <section><h2>間違いを見つけたときは？</h2><p><Link href="/data-policy#contact">情報提供・お問い合わせ</Link>で、対象ページURL、修正したい箇所、正しい内容が分かる資料のURLを連絡文にまとめられます。コピーだけでは送信されません。</p></section>
      <section><h2>ページを紹介・共有してもよいですか？</h2><p>公開ページへのリンクは自由です。詳しい使い方と紹介素材は<Link href="/link-to-us">リンク・紹介素材</Link>にまとめています。</p></section>
    </InformationPage>
  );
}
