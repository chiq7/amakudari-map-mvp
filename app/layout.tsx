import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AnalyticsListener from "@/components/AnalyticsListener";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const title = "天下りマップ";
const description =
  "政府・各省庁等の公表資料に基づく再就職情報を、中立的に検索・閲覧できる官民人材移動データベースです。";
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const bingSiteVerification =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() ||
  "56A1E990442CE3EE07E46DFCAD5558BD";

export const metadata: Metadata = {
  metadataBase: new URL("https://amakudari.jp"),
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description,
  applicationName: title,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: title,
    title,
    description,
    images: [{ url: "/ogp.png", width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/ogp.png"],
  },
  icons: {
    icon: [{ url: "/favicon-96.png", type: "image/png", sizes: "96x96" }],
    shortcut: "/favicon-96.png",
  },
  verification: {
    google: googleSiteVerification || undefined,
    other: bingSiteVerification ? { "msvalidate.01": bingSiteVerification } : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-background text-on-background antialiased">
        <AnalyticsListener />
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1280px] flex-grow px-4 py-8 md:px-8 md:py-12">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
      {googleAnalyticsId ? <GoogleAnalytics gaId={googleAnalyticsId} /> : null}
    </html>
  );
}
