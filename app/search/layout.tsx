import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata("サイト内検索", "天下りマップ内の法人・省庁・業務内容を検索します。", "/search"),
  robots: { index: false, follow: true },
};

export default function SearchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
