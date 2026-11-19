import Link from "next/link";

export default function OrganizationsPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold text-primary">法人一覧は移転しました</h1>
      <Link href="/corporations" className="text-secondary underline">現在の法人一覧を見る</Link>
    </section>
  );
}
