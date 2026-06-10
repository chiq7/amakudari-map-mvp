import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/data-policy" },
};

export default function DataPolicyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

