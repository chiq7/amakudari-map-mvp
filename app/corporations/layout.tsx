import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "法人別の公表再就職情報",
  description:
    "法人名、出身省庁、地域、待機日数などから、公表資料に基づく再就職情報を検索・比較できます。",
  alternates: { canonical: "/corporations" },
};

export default function CorporationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
