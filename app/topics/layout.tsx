import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "テーマ別情報",
  description: "テーマ別に関連する公表情報を整理します。",
  alternates: { canonical: "/topics" },
  robots: { index: false, follow: true },
};

export default function TopicsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
