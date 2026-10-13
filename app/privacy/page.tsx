import Link from "next/link";
import InformationPage from "@/components/InformationPage";
import { pageMetadata } from "@/lib/seo";
import { SITE_OPERATOR, CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/site-contact";

export const metadata = pageMetadata("プライバシーポリシー", "天下りマップのアクセス解析、Cookie、連絡文の取り扱いと外部サービスについて。", "/privacy");

export default function PrivacyPage() {
  return (
    <InformationPage title="プライバシーポリシー" lead="天下りマップで扱う閲覧情報と、利用している外部サービスについて説明します。">
      <section><h2>閲覧時の情報と利用目的</h2><p>表示や検索の改善、利用状況の分析、配信の安定性の確認に、閲覧ページ、参照元、端末・ブラウザー情報、操作イベントなどを利用します。サイトの配信にはVercelを利用しています。</p></section>
      <section><h2>アクセス解析・Cookie</h2><p>Google Analytics 4、Vercel Web Analytics、Vercel Speed Insightsを利用しています。Google AnalyticsではCookie等を使って利用状況を計測します。Vercel Web AnalyticsはCookieを使わずに閲覧状況を集計するサービスです。各サービスが取得・保存する情報は、各提供元の方針に従います。</p><ul className="mt-3 space-y-2"><li><a href="https://policies.google.com/privacy?hl=ja">Googleのプライバシーポリシー</a> ／ <a href="https://support.google.com/analytics/answer/6004245?hl=ja">Google Analyticsのデータ保護</a></li><li><a href="https://vercel.com/docs/analytics/privacy-policy">Vercel Web Analyticsのプライバシー</a> ／ <a href="https://vercel.com/docs/speed-insights/privacy-policy">Speed Insightsのプライバシー</a></li></ul></section>
      <section><h2>解析の制御</h2><p>Cookieはブラウザーの設定で削除・制限できます。Google Analyticsの計測を制御したい場合は、<a href="https://tools.google.com/dlpage/gaoptout?hl=ja">Googleのオプトアウト用アドオン</a>も利用できます。</p></section>
      <section><h2>連絡用フォームの入力内容</h2><p>連絡文作成フォームは入力内容を端末上で整形し、クリップボードにコピーします。入力内容を当サイトのサーバーへ送信・保存する機能はありません。本文・対象ページURLは解析イベントの項目にも含めていません。コピーした文章は利用者が別の連絡手段で送る必要があります。</p></section>
      <section><h2>掲載されている人物・法人情報</h2><p>人物・法人ページは、行政機関や法人が公表した情報を整理したものです。情報の提供元と扱いは<Link href="/data-policy">データについて</Link>、掲載内容の訂正や削除・非表示の相談は<Link href="/data-policy#contact">情報提供・お問い合わせ</Link>をご覧ください。</p></section>
      <section><h2>運営者・連絡先</h2><p>運営者：{SITE_OPERATOR}<br />連絡先：<a href={CONTACT_EMAIL_HREF}>{CONTACT_EMAIL}</a></p></section>
      <section><h2>保存・変更について</h2><p>アクセス解析データの保存期間は利用サービスの設定に依存します。会員情報、決済情報、問い合わせ本文を当サイトで保存する機能はありません。利用するサービスやデータの扱いが変わる場合は、このページを更新します。</p></section>
      <p className="text-sm">適用開始：2026年10月13日</p>
    </InformationPage>
  );
}
