import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/persons" },
};

export default function PersonsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

