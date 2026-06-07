"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/corporations?topic=再就職情報", label: "話題から探す", activeFor: ["/topics"] },
  { href: "/rankings", label: "ランキング", activeFor: ["/rankings"] },
  { href: "/corporations", label: "法人検索", activeFor: ["/corporations", "/persons"] },
  { href: "/data-policy", label: "データ方針", activeFor: ["/data-policy"] },
];

function isActive(pathname: string, activeFor: string[]) {
  if (pathname === "/") return false;
  return activeFor.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between px-4 md:h-16 md:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="shrink-0 text-lg font-bold tracking-normal text-primary md:text-xl">
            天下りマップ
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const active = isActive(pathname, item.activeFor);
              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className={[
                    "border-b-2 py-5 text-[13px] font-semibold leading-none transition-colors",
                    active
                      ? "border-secondary text-secondary"
                      : "border-transparent text-on-surface-variant hover:text-primary",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <form action="/corporations" className="hidden w-72 lg:block">
          <label className="sr-only" htmlFor="site-search">
            法人名・氏名・官職で検索
          </label>
          <div className="relative">
            <input
              id="site-search"
              name="keyword"
              type="search"
              placeholder="法人名・氏名・官職で検索"
              className="h-9 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 pr-9 text-sm text-on-surface outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-on-surface-variant">
              検索
            </span>
          </div>
        </form>
      </div>
    </header>
  );
}
