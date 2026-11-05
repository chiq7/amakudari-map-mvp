import Link from "next/link";
import { Breadcrumb } from "@/components/ui";
import ShareButton from "@/components/ShareButton";

export const onizukaSlug = "person-98d5a48ef4575161";

// Page-only pilot. The Cabinet Secretariat's FY2023 rows 49–52 and FY2024
// rows 36–37 share the same name, departure date, and office. See release evidence.
const appointments: readonly {
  date: string;
  organization: string;
  role: string;
  corporationSlug?: string;
}[] = [
  { date: "2023-04-01", organization: "いであ株式会社", role: "アドバイザー" },
  { date: "2023-04-01", organization: "成協信用組合", role: "顧問" },
  { date: "2023-10-01", organization: "HESTA日本総合警備保障株式会社", role: "顧問" },
  { date: "2024-03-18", organization: "合同会社Onizuka Total Security", role: "代表社員" },
  {
    date: "2024-04-01",
    organization: "全国遊技機商業協同組合連合会",
    role: "顧問（非常勤）",
    corporationSlug: "corporation-b73846bf834d76be",
  },
  {
    date: "2024-06-26",
    organization: "株式会社HESTA大倉",
    role: "取締役社長",
    corporationSlug: "corporation-d32bd3d980e25c7a",
  },
];

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}

export default function OnizukaReemployment() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb items={[
        { label: "TOP", href: "/" },
        { label: "人物一覧", href: "/persons" },
        { label: "鬼塚 友章" },
      ]} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-balance text-3xl font-bold text-primary md:text-4xl">鬼塚友章氏の再就職先</h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">警察庁を離職した後の再就職記録6件を、就任日順に掲載しています。</p>
        </div>
        <ShareButton title="鬼塚友章氏の再就職先 | 天下りマップ" />
      </header>

      <section aria-label="離職から再就職まで" className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-5">
          <h2 className="text-sm font-bold text-on-surface-variant">離職時の官職</h2>
          <p className="mt-1 text-lg font-extrabold text-primary">警察庁長官官房付</p>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
            <time dateTime="2022-08-30">2022年8月30日</time> 離職
          </p>
        </div>
        <div className="min-w-0 rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="border-b border-outline-variant px-4 py-3 sm:px-5">
            <h2 className="text-lg font-extrabold text-primary">離職後の再就職先</h2>
            <p className="mt-1 text-sm text-on-surface-variant">就任日・就任時の役職</p>
          </div>
          <ol className="divide-y divide-outline-variant">
            {appointments.map(({ date, organization, role, corporationSlug }) => (
              <li key={organization} className="grid min-w-0 gap-1 px-4 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3 sm:px-5">
                <time dateTime={date} className="text-sm tabular-nums leading-6 text-on-surface-variant">{formatDate(date)}</time>
                <div className="min-w-0">
                  {corporationSlug ? (
                    <Link href={`/corporations/${corporationSlug}`} className="block break-words font-bold leading-6 text-secondary underline underline-offset-4">
                      {organization}
                    </Link>
                  ) : (
                    <p className="break-words font-bold leading-6 text-primary">{organization}</p>
                  )}
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">{role}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Link href="/ministries/npa" className="inline-flex min-h-11 w-fit items-center font-bold text-secondary underline underline-offset-4">
        警察庁の再就職先一覧を見る
      </Link>
    </div>
  );
}
