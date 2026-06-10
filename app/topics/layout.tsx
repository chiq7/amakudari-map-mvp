import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/topics" },
};

export default function TopicsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

