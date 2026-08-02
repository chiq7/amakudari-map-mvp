import Link from "next/link";
import { DataNotice } from "@/components/ui";
import InformationProvisionForm from "@/components/InformationProvisionForm";

export default function DataPolicyPage() {
  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <section>
        <h1 className="border-l-4 border-secondary pl-4 text-3xl font-bold text-primary md:text-4xl">データ方針</h1>
        <p className="mt-4 max-w-4xl text-base leading-relaxed text-on-surface-variant">
          本サイトは、政府・各省庁等が公表している再就職関連資料をもとに、検索・閲覧しやすく整理したデータベースです。掲載情報について、当サイトが個人・法人・省庁の不適切性を独自に判断するものではありません。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["公表資料に基づく整理", "内閣官房や各省庁が公表する一次資料を基に、情報を機械的に整理・掲載しています。"],
          ["中立的なデータ表示", "特定の意図や主観を排除し、事実に基づいたデータ検索・閲覧機能を提供します。"],
          ["出典リンクの明示", "各データには出典となる公表資料へのリンクを明示し、透明性を確保しています。"],
        ].map(([title, text]) => (
          <div key={title} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="text-lg font-bold text-primary">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{text}</p>
          </div>
        ))}
      </section>

      <section id="sources">
        <h2 className="mb-4 text-2xl font-bold text-primary">データソース（出典元）</h2>
        <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
          {[
            ["内閣官房", "国家公務員の再就職状況の公表資料"],
            ["各省庁", "各省庁における再就職情報の公表資料"],
            ["総務省", "地方独立行政法人及び特殊法人の役員人事情報"],
            ["国立国会図書館", "政治・行政関連アーカイブ（WARP）"],
          ].map(([source, detail]) => (
            <div key={source} className="flex flex-col gap-1 border-b border-outline-variant px-5 py-4 last:border-b-0 md:flex-row md:justify-between">
              <span className="font-bold">{source}</span>
              <span className="text-sm text-on-surface-variant">{detail}</span>
            </div>
          ))}
        </div>
      </section>

      <DataNotice>
        当サイトは機械的なプログラムによってデータを収集・整理しているため、表記の揺れや、一次資料自体の誤りにより実際の事実と異なる場合があります。最新かつ正確な情報は必ず各省庁の公式サイトをご確認ください。
      </DataNotice>

      <section id="updates" className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-3 text-2xl font-bold text-primary">更新方針</h2>
        <p className="leading-relaxed text-on-surface-variant">
          新たな公表資料を確認できた場合は、出典、氏名、元府省庁、官職、再就職先、日付を確認し、重複を除いたうえで順次追加します。自動処理で作成した下書きは確認・承認を経てから公開データへ反映し、出典を確認できない情報は追加しません。
        </p>
      </section>

      <section id="dataset-license" className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-3 text-2xl font-bold text-primary">データ利用条件</h2>
        <div className="space-y-3 leading-relaxed text-on-surface-variant">
          <p>
            天下りマップが行ったデータの選択・構成・集計は、出典として「天下りマップ」と当該一次資料のURLを明記することを条件に、引用・再利用できます。再利用したデータに編集・加工を加えた場合は、その旨も分かるようにしてください。
          </p>
          <p>
            この条件は、内閣官房や各省庁等が公表した原資料の著作権、利用条件その他の権利を変更するものではありません。原資料そのものを転載・再配布する場合は、必ず各公開元が示す利用条件を確認してください。
          </p>
          <p>
            人物・法人・組織に関する情報は、一次資料の確認範囲を超えて断定したり、誹謗中傷や違法行為の示唆に用いたりしないでください。最終更新日：2026年8月2日。
          </p>
        </div>
      </section>

      <section id="fields">
        <h2 className="mb-4 text-2xl font-bold text-primary">表示項目と抽出ルール</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            ["氏名", "公表資料上の氏名"],
            ["元省庁", "離職時の所属"],
            ["離職時官職", "離職時点の官職"],
            ["再就職先法人", "公表された再就職先"],
          ].map(([label, text]) => (
            <div key={label} className="rounded border border-outline-variant bg-surface p-4">
              <p className="text-sm text-on-surface-variant">{label}</p>
              <p className="mt-1 font-bold">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="waiting-period" className="rounded-lg border border-outline-variant bg-surface-container-low p-6">
        <h2 className="mb-4 text-2xl font-bold text-primary">「待機期間」の算出について</h2>
        <p className="leading-relaxed">
          当サイトでは、「離職日」から「再就職日」までの日数を「待機期間」として算出しています。離職後すぐに再就職したケースを視覚的に区別する場合がありますが、これは統計的な比較を容易にするためのものであり、不適切な再就職であることを示唆するものではありません。
        </p>
      </section>

      <section id="ranking-policy">
        <h2 className="mb-4 text-2xl font-bold text-primary">タグ付け・ランキング・集計</h2>
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <p className="mb-3 text-on-surface-variant">
            膨大な公表資料の中からユーザーが必要な情報にたどり着きやすくするため、法人種別、省庁、地域、待機日数などの切り口で整理しています。ランキングは件数や日数に基づく並び替えであり、批判や推奨を目的としません。
          </p>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>法人種別によるタグ付け</li>
            <li>省庁ごとの再就職人数の集計</li>
            <li>公表件数や待機日数に基づく並び替え</li>
          </ul>
        </div>
      </section>

      <section id="disclaimer" className="rounded-lg border border-slate-700 bg-slate-900 p-6 text-white shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-white">免責事項・法的判断について</h2>
        <p className="leading-relaxed text-slate-100">
          本サイトは、公表資料に基づく再就職情報を検索・閲覧しやすく整理したデータベースです。掲載されている再就職事例について、倫理的な妥当性、法的整合性、または不祥事の有無について当サイトが独自の判断を下すことはありません。特定の人物や団体への誹謗中傷、名誉毀損に繋がるような情報の利用はお控えください。
        </p>
      </section>

      <section id="privacy" className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <h2 className="mb-3 text-2xl font-bold text-primary">プライバシーについて</h2>
        <p className="leading-relaxed text-on-surface-variant">
          本MVPでは、公開済みの公的資料に含まれる情報を対象に整理しています。今後の正式なプライバシーポリシー公開まで、本項を暫定的な案内として掲載します。
        </p>
      </section>

      <section id="contact" className="rounded-lg border border-outline-variant bg-surface-container-low p-6 text-center">
        <h2 className="mb-3 text-2xl font-bold text-primary">掲載内容の修正・お問い合わせ</h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          事実と異なるデータが表示されている場合や、情報の削除依頼等は、一次資料のURLと確認日を添えてお知らせください。内容は一次資料に基づいて確認し、根拠が不十分な情報は掲載・更新しません。
        </p>
        <InformationProvisionForm />
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-primary">関連ページ</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["公表資料に基づく整理", "一次資料とデータソースを確認する", "#sources"],
            ["中立的なデータ表示", "ランキングと集計の方針を確認する", "#ranking-policy"],
            ["出典リンクの明示", "掲載データの出典元を確認する", "#sources"],
          ].map(([title, description, href]) => (
            <Link
              key={title}
              href={href}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 transition-colors hover:border-secondary"
            >
              <h3 className="text-lg font-bold text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/" className="text-sm font-semibold text-secondary hover:underline">
        TOPへ戻る
      </Link>
    </div>
  );
}
