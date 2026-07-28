import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "公表再就職情報のランキング",
  description:
    "公表再就職者数、退職翌日再就職、待機日数などの指標から、法人別の公表情報を比較できます。",
  alternates: { canonical: "/rankings" },
};

export default function RankingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
