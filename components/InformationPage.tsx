import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui";

export default function InformationPage({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <Breadcrumb items={[{label: "TOP", href: "/"}, {label: title}]} />
      <header className="border-b-2 border-primary pb-6">
        <h1 className="text-balance text-3xl font-extrabold leading-snug text-primary md:text-4xl">{title}</h1>
        <p className="mt-4 text-pretty text-base leading-8 text-on-surface-variant">{lead}</p>
      </header>
      <div className="space-y-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-primary [&_p]:leading-8 [&_p]:text-on-surface-variant [&_li]:leading-8 [&_li]:text-on-surface-variant [&_a]:font-semibold [&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
      <Link href="/about" className="self-start text-sm font-bold text-secondary hover:underline">このサイトについて →</Link>
    </div>
  );
}
