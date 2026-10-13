import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("データについて", "天下りマップの掲載範囲、元資料、データの利用条件、情報提供・訂正の案内。", "/data-policy");

export default function DataPolicyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
