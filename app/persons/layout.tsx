import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("個人別の公表再就職情報", "政府・各省庁等の公表資料に記載された再就職情報を、個人別に確認できます。", "/persons");

export default function PersonsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
