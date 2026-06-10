import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/corporations" },
};

export default function CorporationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

