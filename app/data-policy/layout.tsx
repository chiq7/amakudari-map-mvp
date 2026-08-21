import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "データについて",
  description:
    "天下りマップで表示する人物・法人・集計データの見方を紹介します。",
  alternates: { canonical: "/data-policy" },
};

export default function DataPolicyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
