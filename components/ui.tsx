import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, DocumentIcon, SearchIcon } from "@/components/icons";

type ClassName = {
  className?: string;
};

export function SearchBox({
  action = "/search",
  placeholder = "人名・法人名・省庁名を入力",
  buttonLabel = "検索する",
  className = "",
}: {
  action?: string;
  placeholder?: string;
  buttonLabel?: string;
} & ClassName) {
  return (
    <form
      action={action}
      className={className}
      data-analytics-event="site_search"
      data-analytics-location="search_box"
    >
      <label className="sr-only" htmlFor="keyword-search">
        キーワード検索
      </label>
      <div className="flex w-full flex-col gap-2 rounded-2xl border border-outline-variant bg-white p-2 shadow-card sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input
            id="keyword-search"
            name="keyword"
            type="search"
            placeholder={placeholder}
            className="h-12 w-full rounded-xl border-0 bg-transparent pl-11 pr-3 text-base font-medium text-on-surface outline-none placeholder:font-normal placeholder:text-on-surface-variant focus:ring-0"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-5 text-sm font-bold text-white transition hover:bg-primary"
        >
          {buttonLabel}
          <ArrowRightIcon size={17} />
        </button>
      </div>
    </form>
  );
}

export function StatCard({
  label,
  value,
  unit,
  className = "",
}: {
  label: string;
  value: string | number;
  unit?: string;
} & ClassName) {
  return (
    <div className={`rounded-2xl bg-surface-container-lowest p-5 shadow-card ring-1 ring-outline-variant/70 ${className}`}>
      <p className="mb-2 text-xs font-bold tracking-[0.04em] text-on-surface-variant">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight text-primary">{value}</span>
        {unit ? <span className="text-sm font-semibold text-on-surface-variant">{unit}</span> : null}
      </div>
    </div>
  );
}

export function HighlightStatCard({
  label,
  value,
  unit,
  className = "",
}: {
  label: string;
  value: string | number;
  unit?: string;
} & ClassName) {
  return (
    <StatCard
      label={label}
      value={value}
      unit={unit}
      className={`bg-secondary-fixed text-on-secondary-fixed ring-secondary/20 ${className}`}
    />
  );
}

export function TagChip({
  href,
  children,
  active = false,
}: {
  href?: string;
  children: ReactNode;
  active?: boolean;
}) {
  const classes = [
    "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-[13px] font-bold transition-colors",
    active
      ? "border-secondary/30 bg-secondary-fixed text-secondary"
      : "border-outline-variant bg-white text-on-surface-variant hover:border-secondary/40 hover:bg-secondary-fixed hover:text-secondary",
  ].join(" ");

  if (!href) return <span className={classes}>{children}</span>;
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function Breadcrumb({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: new URL(item.href, "https://amakudari.jp").toString() }
        : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <nav
        aria-label="パンくずリスト"
        className="flex flex-wrap items-center gap-2 text-xs font-semibold text-on-surface-variant"
      >
        {items.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-secondary">
                {item.label}
              </Link>
            ) : (
              <span className="text-on-surface">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

export function DataNotice({ children, className = "" }: { children: ReactNode } & ClassName) {
  return (
    <aside className={`flex gap-3 border-l-4 border-secondary bg-secondary-fixed/45 px-4 py-3 text-sm leading-7 text-on-surface-variant ${className}`}>
      <DocumentIcon className="mt-1 shrink-0 text-secondary" size={19} />
      <div>{children}</div>
    </aside>
  );
}

export function RankingCard({
  title,
  items,
  unit = "件",
  href,
  rankingType = "general",
}: {
  title: string;
  items: Array<{ label: string; value: number | string; href?: string }>;
  unit?: string;
  href?: string;
  rankingType?: string;
}) {
  return (
    <section
      className="overflow-hidden border border-outline-variant border-t-4 border-t-primary bg-surface-container-lowest"
      data-analytics-location="ranking_card"
    >
      <div className="border-b border-outline-variant/80 bg-surface-container-low px-5 py-4">
        <h3 className="text-lg font-extrabold text-primary">{title}</h3>
      </div>
      <ol className="divide-y divide-outline-variant">
        {items.length === 0 ? (
          <li className="px-5 py-8 text-sm leading-6 text-on-surface-variant">
            現在の公開データに、該当する記録はありません。
          </li>
        ) : items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            <Link
              href={item.href ?? href ?? "/corporations"}
              data-ranking-type={rankingType}
              className="flex min-h-14 items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-surface-container-low"
            >
              <span className="min-w-0 truncate text-sm font-semibold text-on-surface">
                <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-sm bg-surface-container text-xs font-extrabold text-primary">{index + 1}</span>
                {item.label}
              </span>
              <span className="shrink-0 text-sm text-on-surface-variant">
                <strong className="text-lg text-primary">{item.value}</strong> {unit}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {href ? <div className="border-t border-outline-variant/80 px-5 py-4 text-right">
        <Link
          href={href}
          data-ranking-type={rankingType}
          className="text-sm font-semibold text-secondary hover:underline"
        >
          詳細ランキングを見る
        </Link>
      </div> : null}
    </section>
  );
}

export function RelatedLinks({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-primary">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <TagChip key={`${link.label}-${link.href}`} href={link.href}>
            {link.label}
          </TagChip>
        ))}
      </div>
    </section>
  );
}

export function SourceLinkList({
  links,
}: {
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="source_link"
            data-analytics-location="source_list"
            className="text-sm font-semibold text-secondary hover:underline"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
