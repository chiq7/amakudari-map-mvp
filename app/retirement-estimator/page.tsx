import type { Metadata } from "next";
import RetirementAllowanceEstimator from "@/components/RetirementAllowanceEstimator";
import { Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "国家公務員の退職手当モデル試算",
  description: "国家公務員の支給率と職責別の調整月額をもとに、役職経験モデルごとの退職手当を試算します。",
  alternates: { canonical: "/retirement-estimator" },
  openGraph: {
    title: "国家公務員の退職手当モデル試算",
    description: "職責・勤続年数・退職理由の仮定から、制度上の退職手当の目安を確認できます。",
    url: "/retirement-estimator",
  },
};

export default function RetirementEstimatorPage() {
  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "退職手当モデル試算" }]} />

      <section className="border-b-2 border-primary pb-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">PUBLIC SYSTEM GUIDE</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-primary md:text-5xl">役職経験から見る<br className="hidden sm:block" />退職手当の目安</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
          役職、勤続年数、退職理由、俸給月額を入力して、退職手当の目安を試算できます。
        </p>
      </section>

      <RetirementAllowanceEstimator />

      <section className="border-t border-outline-variant pt-8">
        <p className="text-xs font-extrabold tracking-[0.14em] text-accent">HOW TO READ</p>
        <h2 className="mt-2 text-2xl font-extrabold text-primary">数字は条件を変えて比べる</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant">俸給月額、勤続年数、退職理由、役職経験を変えながら、条件ごとの金額の動きを見比べられます。</p>
      </section>
    </div>
  );
}
