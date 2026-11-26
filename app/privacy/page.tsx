import Link from "next/link";
import InformationPage from "@/components/InformationPage";
import { pageMetadata } from "@/lib/seo";
import { SITE_OPERATOR, CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/site-contact";

export const metadata = pageMetadata("プライバシーポリシー", "天下りマップのアクセス解析、Cookie、連絡文の取り扱いと外部サービスについて。", "/privacy");

export default function PrivacyPage() {
  return (
    <InformationPage title="プライバシーポリシー" lead="天下りマップで扱う閲覧情報と、利用している外部サービスについて説明します。">
      <section><h2>閲覧時の情報と利用目的</h2><p>表示や検索の改善、利用状況の分析、配信の安定性の確認に、閲覧ページ、参照元、端末・ブラウザー情報、操作イベントなどを利用します。サイトの配信にはCloudflareを利用しています。</p><p><a href="https://www.cloudflare.com/ja-jp/privacypolicy/">Cloudflareのプライバシーポリシー</a></p></section>
      <section><h2>アクセス解析・Cookie</h2><p>公開サイトではGoogle Analytics 4を利用し、Cookie等を使って閲覧状況を計測します。Googleが取得・保存する情報は同社の方針に従います。</p><div className="mt-3 flex flex-wrap gap-2"><a href="https://policies.google.com/privacy?hl=ja">Googleのプライバシーポリシー</a><a href="https://support.google.com/analytics/answer/6004245?hl=ja">Google Analyticsのデータ保護</a></div></section>
      <section><h2>解析の制御</h2><p>Cookieはブラウザーの設定で削除・制限できます。Google Analyticsの計測を制御したい場合は、Googleのオプトアウト用アドオンも利用できます。</p><p className="mt-3"><a href="https://tools.google.com/dlpage/gaoptout?hl=ja">Googleのオプトアウト用アドオン</a></p></section>
      <section><h2>連絡用フォームの入力内容</h2><p>連絡文作成フォームは入力内容を端末上で整形し、クリップボードにコピーします。入力内容を当サイトのサーバーへ送信・保存する機能はありません。本文・対象ページURLは解析イベントの項目にも含めていません。コピーした文章は利用者が別の連絡手段で送る必要があります。</p></section>
      <section><h2>掲載されている人物・法人情報</h2><p>人物・法人ページは、行政機関や法人が公表した情報を整理したものです。情報の提供元と扱いは「データについて」、掲載内容の訂正や削除・非表示の相談は「情報提供・お問い合わせ」をご覧ください。</p><div className="mt-3 flex flex-wrap gap-2"><Link href="/data-policy">データについて</Link><Link href="/data-policy#contact">情報提供・お問い合わせ</Link></div></section>
      <section><h2>運営者・連絡先</h2><p>運営者：{SITE_OPERATOR}<br />連絡先：<span className="break-all">{CONTACT_EMAIL}</span></p><p className="mt-3"><a href={CONTACT_EMAIL_HREF}>メールで連絡する</a></p></section>
      <section><h2>保存・変更について</h2><p>アクセス解析データの保存期間は利用サービスの設定に依存します。会員情報、決済情報、問い合わせ本文を当サイトで保存する機能はありません。利用するサービスやデータの扱いが変わる場合は、このページを更新します。</p></section>
      <p className="text-sm">適用開始：2026年10月13日　更新：2026年11月19日</p>
    </InformationPage>
  );
}
