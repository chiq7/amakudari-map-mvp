import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "個人別の公表再就職情報",
  description:
    "政府・各省庁等の公表資料に記載された再就職情報を、個人別に確認できます。",
  alternates: { canonical: "/persons" },
};

export default function PersonsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
