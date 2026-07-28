import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "データ方針・出典",
  description:
    "天下りマップで扱う公表資料、データの整理方針、掲載内容に関する注意事項を説明します。",
  alternates: { canonical: "/data-policy" },
};

export default function DataPolicyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
