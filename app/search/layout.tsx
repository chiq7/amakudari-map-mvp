import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サイト内検索",
  description: "天下りマップ内の法人・省庁・業務内容を検索します。",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
