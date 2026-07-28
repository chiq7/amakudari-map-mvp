import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "天下りマップについて",
  description:
    "天下りマップの目的、掲載情報の考え方、データベースとしての利用方法を紹介します。",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
