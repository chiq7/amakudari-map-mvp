import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui";
import { buttonLink } from "@/lib/ui-classes";

export default function InformationPage({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <Breadcrumb items={[{label: "TOP", href: "/"}, {label: title}]} />
      <header className="border-b-2 border-primary pb-6">
        <h1 className="text-balance text-3xl font-extrabold leading-snug text-primary md:text-4xl">{title}</h1>
        <p className="mt-4 text-pretty text-base leading-8 text-on-surface-variant">{lead}</p>
      </header>
      <div className="space-y-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-primary [&_p]:leading-8 [&_p]:text-on-surface-variant [&_li]:leading-8 [&_li]:text-on-surface-variant [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:rounded-lg [&_a]:border [&_a]:border-outline-variant [&_a]:bg-white [&_a]:px-4 [&_a]:py-2 [&_a]:text-sm [&_a]:font-bold [&_a]:text-primary [&_a]:transition hover:[&_a]:border-secondary hover:[&_a]:text-secondary">
        {children}
      </div>
      <Link href="/about" className={buttonLink}>このサイトについて</Link>
    </div>
  );
}
