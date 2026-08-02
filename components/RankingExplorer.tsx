"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon } from "@/components/icons";

export type ComparisonGroup = {
  id: string;
  label: string;
  title: string;
  description: string;
  unit: string;
  items: Array<{
    label: string;
    value: number;
    corporationSlug: string;
  }>;
};

export default function RankingExplorer({ groups }: { groups: ComparisonGroup[] }) {
  const [activeId, setActiveId] = useState(groups[0]?.id ?? "");
  const activeGroup = groups.find((group) => group.id === activeId) ?? groups[0];

  if (!activeGroup) return null;

  return (
    <section aria-labelledby="comparison-title" className="border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant p-4 md:p-5">
        <p className="text-xs font-extrabold tracking-[0.08em] text-secondary">比較する指標を選ぶ</p>
        <div role="tablist" aria-label="法人比較の指標" className="mt-3 grid grid-cols-1 gap-2 sm:flex">
          {groups.map((group) => {
            const isActive = group.id === activeGroup.id;
            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="ranking-panel"
                onClick={() => setActiveId(group.id)}
                className={`min-h-11 w-full border px-4 text-sm font-bold transition sm:w-auto ${
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-outline-variant bg-white text-primary hover:border-secondary"
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      <div id="ranking-panel" role="tabpanel" className="p-4 md:p-6">
        <div className="flex flex-col gap-3 border-b border-outline-variant pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="comparison-title" className="text-2xl font-extrabold text-primary">{activeGroup.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-on-surface-variant">{activeGroup.description}</p>
          </div>
          <p className="shrink-0 text-sm font-bold text-primary">該当 {activeGroup.items.length}法人</p>
        </div>

        {activeGroup.items.length > 0 ? (
          <ol className="divide-y divide-outline-variant">
            {activeGroup.items.map((item, index) => (
              <li key={`${activeGroup.id}-${item.corporationSlug}`}>
                <Link
                  href={`/corporations/${item.corporationSlug}`}
                  data-ranking-type={activeGroup.id}
                  className="group grid min-h-16 grid-cols-[40px_1fr_auto] items-center gap-3 py-3"
                >
                  <span className="font-mono text-xs font-extrabold text-on-surface-variant">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 font-bold leading-6 text-primary group-hover:text-secondary">{item.label}</span>
                  <span className="flex items-center gap-3 text-on-surface-variant">
                    <span><strong className="text-xl text-primary">{item.value}</strong> {activeGroup.unit}</span>
                    <ArrowRightIcon className="transition group-hover:translate-x-1" size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="py-8 text-sm text-on-surface-variant">現在の公開データに、比較できる記録はありません。</p>
        )}
      </div>
    </section>
  );
}
