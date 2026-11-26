import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumb } from "@/components/ui";
import { ArrowRightIcon, MinistryIcon } from "@/components/icons";
import { corporations, records } from "@/lib/static-content";
import { getMinistryPath, ministryPages } from "@/lib/ministry-pages";
import { isSelfEmployed } from "@/lib/display-text";

export const metadata = pageMetadata(
  "省庁別の天下り先一覧｜出身省庁から再就職先の企業・法人を探す",
  "財務省・警察庁・法務省・経済産業省など、国家公務員の出身省庁ごとに公表された再就職先を一覧にしています。省庁を選ぶと、人物・再就職先法人・就任時の役職を確認できます。",
  "/ministries",
);

type MinistrySummary = {
  name: string;
  path: string;
  hasPage: boolean;
  recordCount: number;
  personCount: number;
  corporationCount: number;
  topCorporations: Array<{ slug: string; name: string; count: number }>;
};

function summarize(name: string): MinistrySummary {
  const ministryRecords = records.filter((record) => record.fromMinistry === name);
  const countsByCorporation = new Map<string, number>();
  const latestByCorporation = new Map<string, string>();
  ministryRecords.forEach((record) => {
    countsByCorporation.set(record.corporationSlug, (countsByCorporation.get(record.corporationSlug) ?? 0) + 1);
    const latest = latestByCorporation.get(record.corporationSlug) ?? "";
    if (record.reemploymentDate > latest) latestByCorporation.set(record.corporationSlug, record.reemploymentDate);
  });
  // 件数の多い順。同数なら再就職日が新しい順
  const topCorporations = Array.from(countsByCorporation.entries())
    .flatMap(([slug, count]) => {
      const corporation = corporations.find((candidate) => candidate.slug === slug);
      return corporation && !isSelfEmployed(corporation.name) ? [{ slug, name: corporation.name, count, latest: latestByCorporation.get(slug) ?? "" }] : [];
    })
    .sort((left, right) => right.count - left.count || right.latest.localeCompare(left.latest) || left.name.localeCompare(right.name, "ja"))
    .slice(0, 3);
  const path = getMinistryPath(name);
  return {
    name,
    path,
    hasPage: path.startsWith("/ministries/"),
    recordCount: ministryRecords.length,
    personCount: new Set(ministryRecords.map((record) => record.personSlug)).size,
    corporationCount: countsByCorporation.size,
    topCorporations,
  };
}

export default function MinistriesPage() {
  const pageNames = new Set<string>(ministryPages.map((ministry) => ministry.name));
  const withPage = ministryPages
    .map((ministry) => summarize(ministry.name))
    .sort((left, right) => right.recordCount - left.recordCount || left.name.localeCompare(right.name, "ja"));
  const others = Array.from(new Set(records.map((record) => record.fromMinistry)))
    .filter((name) => !pageNames.has(name))
    .map(summarize)
    .sort((left, right) => right.recordCount - left.recordCount || left.name.localeCompare(right.name, "ja"));
  const totalMinistries = withPage.length + others.length;

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb items={[{ label: "TOP", href: "/" }, { label: "省庁別一覧" }]} />

      <section className="border-b-2 border-primary pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary md:text-4xl">省庁別の天下り先一覧</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant md:text-base">
          国家公務員の再就職の公表記録{records.length}件を、離職時の所属省庁ごとに分けています。
          {totalMinistries}の省庁等のうち、{withPage.length}省庁は一覧ページで人物・再就職先法人・就任時の役職を確認できます。
        </p>
      </section>

      <section aria-labelledby="ministry-pages-title">
        <h2 id="ministry-pages-title" className="text-2xl font-extrabold text-primary">省庁を選ぶ</h2>
        <p className="mt-1 text-sm text-on-surface-variant">公表記録の多い順です。</p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {withPage.map((ministry) => (
            <li key={ministry.name} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-outline-variant/60">
              <Link href={ministry.path} className="group flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-fixed text-secondary">
                    <MinistryIcon size={20} />
                  </span>
                  <span className="text-lg font-extrabold text-primary">{ministry.name}の天下り先一覧</span>
                </span>
                <ArrowRightIcon className="shrink-0 text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={18} />
              </Link>
              <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-outline-variant py-3 text-center">
                <div>
                  <dt className="text-xs font-semibold text-on-surface-variant">公表記録</dt>
                  <dd className="mt-1 text-xl font-extrabold text-primary">{ministry.recordCount}<span className="ml-0.5 text-xs">件</span></dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-on-surface-variant">人物</dt>
                  <dd className="mt-1 text-xl font-extrabold text-primary">{ministry.personCount}<span className="ml-0.5 text-xs">人</span></dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-on-surface-variant">再就職先</dt>
                  <dd className="mt-1 text-xl font-extrabold text-primary">{ministry.corporationCount}<span className="ml-0.5 text-xs">法人</span></dd>
                </div>
              </dl>
              {ministry.topCorporations.length ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-on-surface-variant">主な再就職先</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ministry.topCorporations.map((corporation) => (
                      <Link
                        key={corporation.slug}
                        href={`/corporations/${corporation.slug}`}
                        className="inline-flex min-h-9 items-center rounded-full border border-outline-variant bg-surface-container-lowest px-3 text-xs font-bold text-primary hover:border-secondary hover:text-secondary"
                      >
                        {corporation.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {others.length ? (
        <section aria-labelledby="ministry-others-title">
          <h2 id="ministry-others-title" className="text-xl font-extrabold text-primary">そのほかの省庁等</h2>
          <p className="mt-1 text-sm text-on-surface-variant">記録が少ない省庁等は、法人一覧で出身省庁を指定して確認できます。</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((ministry) => (
              <Link
                key={ministry.name}
                href={ministry.path}
                className="group flex min-h-14 items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 font-bold text-primary ring-1 ring-outline-variant/60 transition hover:ring-secondary/40"
              >
                <span>{ministry.name}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-on-surface-variant">
                  {ministry.recordCount}件
                  <ArrowRightIcon className="text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
