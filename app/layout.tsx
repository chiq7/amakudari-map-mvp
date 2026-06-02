
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "官民人材移動データベース",
  description: "公表資料をもとに、官民の人材移動を検索・ランキング・時系列で見える化するデータベースです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col antialiased">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center h-14 px-4 md:px-8">
            <Link href="/" className="text-xl font-bold text-black tracking-tight">天下りマップ</Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
              <Link href="/topics" className="text-gray-600 hover:text-black">話題から探す</Link>
              <Link href="/rankings" className="text-gray-600 hover:text-black">ランキング</Link>
              <Link href="/search" className="text-gray-600 hover:text-black">検索</Link>
              <Link href="/about" className="text-gray-600 hover:text-black">このサイトについて</Link>
            </nav>
          </div>
        </header>
        <main className="flex-grow container mx-auto py-8 px-4 md:px-8">
          {children}
        </main>
        <footer className="bg-gray-100 border-t border-gray-200 w-full py-8 mt-auto">
           <div className="container mx-auto text-center text-xs text-gray-500">
             <p>免責事項: 本サイトは因果関係を示すものではありません。公表資料をもとに、官民の人材移動と関連する情報を整理するためのものです。</p>
             <p className="mt-2">© 2024 天下りマップ</p>
           </div>
        </footer>
      </body>
    </html>
  );
}
