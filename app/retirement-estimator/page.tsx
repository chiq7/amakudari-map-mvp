import type { Metadata } from "next";
import Link from "next/link";
import RetirementAllowanceEstimator from "@/components/RetirementAllowanceEstimator";
import { Breadcrumb, DataNotice } from "@/components/ui";

export const metadata: Metadata = {
  title: "国家公務員の退職手当モデル試算",
  description: "国家公務員の公開された支給率と職責別の調整月額をもとに、役職経験モデルごとの退職手当を試算します。個人の受給額を示すものではありません。",
  alternates: { canonical: "/retirement-estimator" },
  openGraph: {
    title: "国家公務員の退職手当モデル試算",
    description: "職責・勤続年数・退職理由の仮定から、制度上の退職手当の目安を確認できます。",
    url: "/retirement-estimator",
  },
};

const officialSources = [
  {
    title: "国家公務員の退職手当制度の概要（内閣人事局）",
    url: "https://www.cas.go.jp/jp/gaiyou/jimu/jinjikyoku/jinji_c3.html?vm=r",
    description: "退職手当＝基本額＋調整額という制度と、職責区分別の調整月額を確認できます。",
  },
  {
    title: "国家公務員退職手当支給率早見表（内閣人事局）",
    url: "https://www.cas.go.jp/jp/gaiyou/jimu/jinjikyoku/files/h300101_taishoku2.pdf",
    description: "勤続年数・退職理由別の支給率（調整率を乗じた後）を確認できます。",
  },
  {
    title: "国家公務員退職手当法（e-Gov法令検索）",
    url: "https://laws.e-gov.go.jp/law/328AC1000000182",
    description: "退職手当の基本額と調整額の法的な根拠です。",
  },
];

export default function RetirementEstimatorPage() {
  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "退職手当モデル試算" }]} />

      <section className="border-b-2 border-primary pb-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">PUBLIC SYSTEM GUIDE</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-primary md:text-5xl">役職経験から見る<br className="hidden sm:block" />退職手当の目安</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
          国家公務員の公開された支給率と、職責別の調整月額を使った制度上のモデル試算です。人物別の退職金や、実際の支給額を示すものではありません。
        </p>
      </section>

      <DataNotice className="border-l-accent bg-accent-soft/60">
        <strong className="block text-primary">人物ページの金額ではありません</strong>
        公表された再就職資料には個人別の退職手当額は載っていません。このページは、役職・勤続年数・退職理由・俸給月額の仮定を明示した制度解説です。
      </DataNotice>

      <RetirementAllowanceEstimator />

      <section className="grid gap-6 border-t border-outline-variant pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-accent">HOW TO READ</p>
          <h2 className="mt-2 text-2xl font-extrabold text-primary">数字は「前提」とセットで読む</h2>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">
            退職手当は、退職時の俸給月額、勤続年数、退職理由、職責に応じた調整額などで変わります。同じ役職名でも、実際の金額が同じになるわけではありません。
          </p>
          <Link href="/data-policy" className="mt-5 inline-flex min-h-11 items-center border border-primary px-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-white">
            データ方針を確認する →
          </Link>
        </div>
        <div className="border border-outline-variant bg-surface-container-lowest">
          {officialSources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block border-b border-outline-variant p-5 last:border-b-0 transition hover:bg-surface-container-low">
              <p className="font-extrabold text-primary">{source.title} <span aria-hidden="true">↗</span></p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{source.description}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
