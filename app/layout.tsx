import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import AnalyticsListener from "@/components/AnalyticsListener";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://amakudari.jp"),
  title: "天下りマップ",
  description: "政府・各省庁等の公表資料に基づく再就職情報を、中立的に検索・閲覧できる官民人材移動データベースです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();

  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col bg-background text-on-background antialiased">
        <AnalyticsListener />
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1280px] flex-grow px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
        <SiteFooter />
      </body>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
    </html>
  );
}
