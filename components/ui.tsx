import Link from "next/link";
import type { ReactNode } from "react";

type ClassName = {
  className?: string;
};

export function SearchBox({
  action = "/search",
  placeholder = "法人名・省庁名・業務内容で検索",
  className = "",
}: {
  action?: string;
  placeholder?: string;
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
      <input
        id="keyword-search"
        type="search"
        placeholder={placeholder}
        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-base text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20"
      />
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
    <div className={`rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm ${className}`}>
      <p className="mb-1 text-sm text-on-surface-variant">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-primary">{value}</span>
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
      className={`border-secondary/30 bg-secondary-fixed text-on-secondary-fixed ${className}`}
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
    "inline-flex items-center rounded border px-3 py-1 text-[13px] font-semibold transition-colors",
    active
      ? "border-secondary bg-secondary-fixed text-secondary"
      : "border-outline-variant bg-surface-container-high text-on-surface-variant hover:border-secondary hover:text-secondary",
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
  return (
    <nav className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-on-surface-variant">
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
  );
}

export function DataNotice({ children, className = "" }: { children: ReactNode } & ClassName) {
  return (
    <div className={`rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm leading-relaxed text-on-surface-variant ${className}`}>
      {children}
    </div>
  );
}

export function RankingCard({
  title,
  items,
  unit = "件",
  href = "/rankings",
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
      className="rounded-lg border border-outline-variant bg-surface-container-lowest"
      data-analytics-location="ranking_card"
    >
      <div className="border-b border-outline-variant px-4 py-3">
        <h2 className="text-lg font-bold text-primary">{title}</h2>
      </div>
      <ol className="divide-y divide-outline-variant">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            <Link
              href={item.href ?? href}
              data-ranking-type={rankingType}
              className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-container-low"
            >
              <span className="min-w-0 truncate text-sm font-semibold text-on-surface">
                <span className="mr-3 inline-block w-5 text-center font-bold text-outline">{index + 1}</span>
                {item.label}
              </span>
              <span className="shrink-0 text-sm text-on-surface-variant">
                <strong className="text-lg text-primary">{item.value}</strong> {unit}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="border-t border-outline-variant px-4 py-3 text-right">
        <Link
          href={href}
          data-ranking-type={rankingType}
          className="text-sm font-semibold text-secondary hover:underline"
        >
          詳細ランキングを見る
        </Link>
      </div>
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
