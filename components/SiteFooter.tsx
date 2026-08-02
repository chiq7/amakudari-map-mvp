import Link from "next/link";
import { BrandMark } from "@/components/icons";

const exploreLinks = [
  { href: "/persons", label: "人から探す" },
  { href: "/corporations", label: "法人から探す" },
  { href: "/topics", label: "省庁・テーマから探す" },
  { href: "/news", label: "ニュース・解説" },
];

const policyLinks = [
  { href: "/about", label: "このサイトについて" },
  { href: "/data-policy", label: "データ方針" },
  { href: "/data-policy#dataset-license", label: "データ利用条件" },
  { href: "/data-policy#contact", label: "お問い合わせ" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-outline-variant bg-primary text-white">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-12 md:grid-cols-[1.3fr_0.8fr_0.8fr] md:px-8 md:py-14">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-3">
            <BrandMark size={42} className="bg-white text-primary" />
            <span className="text-xl font-extrabold">天下りマップ</span>
          </Link>
          <p className="mt-5 text-sm leading-7 text-white/72">
            政府・各省庁等の公表資料をもとに、官民の人材移動を人・法人・省庁のつながりから確認できるよう整理したデータベースです。
          </p>
          <p className="mt-4 text-xs leading-6 text-white/55">
            公表情報を比較しやすくするためのサービスであり、個人や法人の適法性・妥当性を独自に評価するものではありません。
          </p>
        </div>

        <nav aria-label="データを探す">
          <p className="text-xs font-bold tracking-[0.12em] text-white/50">データを探す</p>
          <ul className="mt-4 space-y-3">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm font-semibold text-white/80 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="サイト情報">
          <p className="text-xs font-bold tracking-[0.12em] text-white/50">サイト情報</p>
          <ul className="mt-4 space-y-3">
            {policyLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  data-analytics-event={link.href.includes("#contact") ? "contact_link" : undefined}
                  data-analytics-location="site_footer"
                  className="text-sm font-semibold text-white/80 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© 天下りマップ</p>
          <p>一次資料の出典と確認日を各ページに掲載しています。</p>
        </div>
      </div>
    </footer>
  );
}
