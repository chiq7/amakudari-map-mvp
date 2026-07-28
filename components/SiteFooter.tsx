import Link from "next/link";

const footerLinks = [
  { href: "/data-policy#disclaimer", label: "免責事項" },
  { href: "/data-policy#privacy", label: "プライバシーポリシー" },
  { href: "/data-policy", label: "データ方針" },
  { href: "/data-policy#contact", label: "お問い合わせ" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
        <Link href="/" className="text-lg font-bold text-primary">
          天下りマップ
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              data-analytics-event={link.href.includes("#contact") ? "contact_link" : undefined}
              data-analytics-location="site_footer"
              className="text-[13px] font-semibold text-on-surface-variant transition-colors hover:text-secondary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
