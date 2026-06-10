import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/rankings" },
};

export default function RankingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

