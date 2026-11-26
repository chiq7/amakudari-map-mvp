import { pageMetadata } from "@/lib/seo";
import RetirementAllowanceEstimator from "@/components/RetirementAllowanceEstimator";
import { Breadcrumb } from "@/components/ui";
import Link from "next/link";
import { buttonLink } from "@/lib/ui-classes";

export const metadata = pageMetadata("国家公務員の退職手当モデル試算", "国家公務員の支給率と職責別の調整月額をもとに、役職経験モデルごとの退職手当を試算します。", "/retirement-estimator");

export default function RetirementEstimatorPage() {
  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "退職手当モデル試算" }]} />

      <section className="border-b-2 border-primary pb-8">
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-primary md:text-5xl">役職経験から見る<br className="hidden sm:block" />退職手当の目安</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
          役職、勤続年数、退職理由、俸給月額を入力して、退職手当の目安を試算できます。
        </p>
      </section>

      <RetirementAllowanceEstimator />

      <section className="border-t border-outline-variant pt-8">
        <h2 className="mt-2 text-2xl font-extrabold text-primary">数字は条件を変えて比べる</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-on-surface-variant">俸給月額、勤続年数、退職理由、役職経験を変えながら、条件ごとの金額の動きを見比べられます。</p>
        <Link className={`mt-4 text-left ${buttonLink}`} href="/news/early-retirement-recruitment-and-reemployment-records">国家公務員の早期退職募集と再就職記録の読み方</Link>
      </section>
    </div>
  );
}
