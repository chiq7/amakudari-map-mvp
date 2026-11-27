import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("官僚の天下り先一覧（人物別）｜国家公務員の再就職公表記録を検索", "公表された元国家公務員の氏名から再就職先を検索できます。出身省庁別の人物一覧で、離職時の官職、就任日、企業・団体での役職を確認できます。", "/persons");

export default function PersonsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
