import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/organizations" },
};

export default function OrganizationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

