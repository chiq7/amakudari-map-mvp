import Link from "next/link";
import { buttonLink } from "@/lib/ui-classes";

export default function NotFound() {
  return <section className="mx-auto max-w-xl py-12">
    <h1 className="text-3xl font-bold text-primary">ページが見つかりません</h1>
    <p className="mt-4 leading-7">人名・法人名・省庁名から公表記録を探せます。</p>
    <div className="mt-6 flex flex-wrap gap-2">
      <Link href="/search" className={buttonLink}>サイト内で検索</Link><Link href="/" className={buttonLink}>トップに戻る</Link>
    </div>
  </section>;
}
