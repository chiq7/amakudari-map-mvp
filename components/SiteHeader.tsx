"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark, SearchIcon } from "@/components/icons";

const navItems = [
  { href: "/persons", label: "人から探す", activeFor: ["/persons", "/public-officers"] },
  { href: "/corporations", label: "法人から探す", activeFor: ["/corporations", "/organizations"] },
  { href: "/topics", label: "省庁・テーマ", activeFor: ["/topics", "/ministries"] },
  { href: "/news", label: "ニュース・解説", activeFor: ["/news"] },
  { href: "/rankings", label: "集計を見る", activeFor: ["/rankings"] },
];

function isActive(pathname: string, activeFor: string[]) {
  if (pathname === "/") return false;
  return activeFor.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/80 bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] w-full max-w-[1280px] items-center justify-between gap-6 px-4 md:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="天下りマップ トップページ">
          <BrandMark size={38} className="transition-transform group-hover:scale-[1.03]" />
          <span className="min-w-0">
            <span className="block text-[17px] font-extrabold leading-tight tracking-[0.01em] text-primary md:text-xl">
              天下りマップ
            </span>
            <span className="hidden text-[10px] font-semibold leading-tight tracking-[0.08em] text-on-surface-variant sm:block">
              公表資料データベース
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="主要メニュー">
          {navItems.map((item) => {
            const active = isActive(pathname, item.activeFor);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-[13px] font-bold transition-colors ${
                  active
                    ? "bg-secondary-fixed text-secondary"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form
          action="/search"
          className="hidden w-[252px] xl:block"
          data-analytics-event="site_search"
          data-analytics-location="site_header"
        >
          <label className="sr-only" htmlFor="site-search">
            人名・法人名・省庁名で検索
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={17} />
            <input
              id="site-search"
              name="keyword"
              type="search"
              placeholder="人名・法人名・省庁名"
              className="h-10 w-full rounded-full border border-outline-variant bg-surface-container-lowest pl-9 pr-3 text-sm text-on-surface shadow-sm transition placeholder:text-on-surface-variant focus:border-secondary focus:ring-2 focus:ring-secondary/15"
            />
          </div>
        </form>

        <Link
          href="/search"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-outline-variant bg-white px-3 text-sm font-bold text-primary shadow-sm xl:hidden"
        >
          <SearchIcon size={18} />
          <span className="hidden sm:inline">検索</span>
        </Link>
      </div>

      <nav className="border-t border-outline-variant/60 lg:hidden" aria-label="スマートフォンメニュー">
        <div className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const active = isActive(pathname, item.activeFor);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                  active ? "bg-secondary-fixed text-secondary" : "text-on-surface-variant"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
