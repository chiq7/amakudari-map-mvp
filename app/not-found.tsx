import Link from "next/link";

export default function NotFound() {
  return <section className="mx-auto max-w-xl py-12">
    <h1 className="text-3xl font-bold text-primary">ページが見つかりません</h1>
    <p className="mt-4 leading-7">人名・法人名・省庁名から公表記録を探せます。</p>
    <div className="mt-6 flex gap-5 font-bold text-secondary underline">
      <Link href="/search">サイト内で検索</Link><Link href="/">トップに戻る</Link>
    </div>
  </section>;
}
