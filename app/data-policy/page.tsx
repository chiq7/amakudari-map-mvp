import Link from "next/link";
import InformationProvisionForm from "@/components/InformationProvisionForm";

export default function DataPolicyPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <section className="border-b-2 border-primary pb-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">DATA GUIDE</p>
        <h1 className="mt-3 text-3xl font-extrabold text-primary md:text-4xl">データについて</h1>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">天下りマップでは、再就職の公表記録を、人・法人・省庁・日付の切り口で検索しやすく整理しています。</p>
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

      <section id="contact" className="border border-outline-variant bg-surface-container-low p-6 text-center">
        <h2 className="text-2xl font-extrabold text-primary">情報提供・お問い合わせ</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">追加したい法人情報、更新情報、表示に関するご連絡はこちらからお送りください。</p>
        <InformationProvisionForm />
      </section>

      <Link href="/" className="text-sm font-bold text-secondary hover:underline">TOPへ戻る →</Link>
    </div>
  );
}
