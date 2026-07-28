import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "再就職先組織の関連情報",
  description:
    "公表資料に基づき、再就職先組織ごとの受け入れ人数、待機日数、再就職者の情報を確認できます。",
  alternates: { canonical: "/organizations" },
};

export default function OrganizationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
