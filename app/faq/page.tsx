import Link from "next/link";
import InformationPage from "@/components/InformationPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("よくある質問", "天下りマップの探し方、掲載件数・待機日数の見方、訂正依頼、共有について。", "/faq");

const questions: { question: string; answer: (string | { href: string; text: string })[] }[] = [
  {
    question: "誰が、どこへ再就職したかを調べるには？",
    answer: ["氏名が分かる場合は", { href: "/persons", text: "人物一覧" }, "、勤務先から探す場合は", { href: "/corporations", text: "法人一覧" }, "へ。人物ページでは元の所属・官職と再就職先・新しい役職、法人ページでは業務内容と関係する人物を見られます。"],
  },
  {
    question: "天下りは違法ですか？",
    answer: ["国家公務員の再就職そのものは禁止されていません。国家公務員法は、府省庁が職員や退職者の再就職をあっせんすること、在職中に利害関係のある企業へ自分を売り込むこと、退職者が元の職場に働きかけることを禁じ、再就職した人の届出と公表を定めています。当サイトが掲載しているのは、この制度で公表された再就職の記録です。規制の内容は", { href: "/about#reemployment-rules", text: "再就職等規制と公表制度" }, "にまとめています。"],
  },
  {
    question: "天下り先が多い会社・省庁はどこですか？",
    answer: ["公表記録の件数で比べると、", { href: "/rankings", text: "天下り先の多い企業・法人ランキング" }, "で受け入れ件数の多い法人と、記録の多い省庁を確認できます。省庁ごとの再就職先は", { href: "/ministries", text: "省庁別の天下り先一覧" }, "から開けます。"],
  },
  {
    question: "天下りした人の退職金はいくらですか？",
    answer: ["公表記録には退職金の額は載っていません。国家公務員の退職手当は、退職時の俸給月額・勤続年数・退職理由と、役職に応じた調整額で決まります。", { href: "/retirement-estimator", text: "退職手当の目安" }, "で、役職経験のモデルごとに試算できます。"],
  },
  {
    question: "掲載件数は全国の再就職者の総数ですか？",
    answer: ["いいえ。件数は当サイトに掲載している記録の数です。一人に複数の再就職記録がある場合もあるため、記録数・人物数・法人数は一致しません。資料の範囲は", { href: "/data-policy", text: "データについて" }, "で案内しています。"],
  },
  {
    question: "待機日数はどう計算していますか？",
    answer: ["公表された離職日から再就職日までの日数です。同じ日は0日、翌日は1日と数え、「30日以内」には0日から30日までを含めます。短い順・件数順の表示は、この記録上の日付と件数で比較しています。"],
  },
  {
    question: "離職時の役職と現在の役職は同じですか？",
    answer: ["人物ページの「再就職後の役職」は公表された再就職時点の役職です。現在の在職状況は、法人の公式サイトなどの最新情報と区別して読む必要があります。"],
  },
  {
    question: "利用料金や会員登録は必要ですか？",
    answer: ["閲覧・検索・退職手当モデルの試算は無料です。現在、会員登録や有料購入の機能はありません。"],
  },
  {
    question: "間違いを見つけたときは？",
    answer: [{ href: "/data-policy#contact", text: "情報提供・お問い合わせ" }, "で、対象ページURL、修正したい箇所、正しい内容が分かる資料のURLを連絡文にまとめられます。コピーだけでは送信されません。"],
  },
  {
    question: "ページを紹介・共有してもよいですか？",
    answer: ["公開ページへのリンクは自由です。詳しい使い方と紹介素材は", { href: "/link-to-us", text: "リンク・紹介素材" }, "にまとめています。"],
  },
];

export default function FaqPage() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({
      "@type": "Question", name: question,
      acceptedAnswer: { "@type": "Answer", text: answer.map((part) => typeof part === "string" ? part : part.text).join("") },
    })),
  };
  return (
    <InformationPage title="よくある質問" lead="探し方や数字の見方など、天下りマップを使うときの疑問をまとめました。">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq).replace(/</g, "\\u003c") }} />
      {questions.map(({ question, answer }) => (
        <section key={question}>
          <h2>{question}</h2>
          <p>{answer.map((part) => typeof part === "string" ? part : <Link key={part.href} href={part.href}>{part.text}</Link>)}</p>
        </section>
      ))}
    </InformationPage>
  );
}
