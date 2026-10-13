import Link from "next/link";
import InformationPage from "@/components/InformationPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("利用規約", "天下りマップの閲覧・紹介・データ利用・訂正依頼に関する利用条件。", "/terms");

export default function TermsPage() {
  return (
    <InformationPage title="利用規約" lead="天下りマップの情報を閲覧・紹介・利用する際の条件です。">
      <section><h2>利用できる機能</h2><p>人物・法人・省庁の情報の閲覧、検索、条件による絞り込み、退職手当モデルの試算、公開ページへのリンクを利用できます。会員登録、口コミ投稿、契約・決済、予約の機能は提供していません。</p></section>
      <section><h2>文章・画像・データの利用</h2><p>元資料に由来する情報は、<Link href="/data-policy#dataset-license">データの利用条件</Link>と提供元の規約に従って扱ってください。当サイトが制作した文章・図・画像の引用は、法令で認められる範囲で、引用箇所と当サイト名・対象ページURLを示してください。リンクや紹介用素材の利用方法は<Link href="/link-to-us">リンク・紹介素材</Link>で案内しています。</p></section>
      <section><h2>利用に当たって</h2><p>掲載情報を書き換えて当サイトや行政機関の発表として紹介する行為、他人へのなりすまし、個人への嫌がらせ、アクセス制限を回避する行為、配信を妨げる大量アクセスを行わないでください。</p></section>
      <section><h2>掲載内容・試算の扱い</h2><p>役職と所属は各公表時点の記録です。退職手当モデルは入力した仮定による計算で、個人への実際の支給額ではありません。元資料の情報と当サイトによる整理・解説は区別して提供します。</p></section>
      <section><h2>訂正・削除の相談</h2><p>対象ページURL、問題のある箇所、訂正内容や根拠を<Link href="/data-policy#contact">情報提供・お問い合わせ</Link>の連絡文へ記載してください。連絡文のコピーは送信や受付を意味しません。</p></section>
      <section><h2>変更・運用</h2><p>資料の更新や表示の改善に伴い、掲載内容・機能・利用条件を変更することがあります。個人情報・閲覧情報の扱いは<Link href="/privacy">プライバシーポリシー</Link>で説明します。</p></section>
      <p className="text-sm">適用開始：2026年10月13日</p>
    </InformationPage>
  );
}
