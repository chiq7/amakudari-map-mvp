import Link from "next/link";
import { persons } from "@/lib/static-content";
import { ArrowRightIcon, BuildingIcon, MinistryIcon, PersonIcon } from "@/components/icons";
import { SearchBox } from "@/components/ui";

export default function PersonsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-7 rounded-3xl bg-primary px-5 py-8 text-white md:px-9 md:py-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-[#a9e4d3]">PEOPLE</p>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight md:text-4xl">人から公表記録を探す</h1>
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-white/72 md:text-base">
            氏名から、離職時の所属・役職、再就職先、退職から再就職までの日数と出典を確認できます。
          </p>
        </div>
        <SearchBox placeholder="氏名・役職・省庁名で検索" className="text-on-surface" />
      </section>

      <section>
        <div className="flex flex-col gap-2 border-b border-outline-variant pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-primary">公表された人物</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              同姓同名の可能性があるため、人物ページの官職と出典資料もあわせて確認してください。
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold text-on-surface-variant">{persons.length.toLocaleString()}人を掲載</p>
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {persons.map((person) => (
            <li key={person.slug}>
              <Link
                href={`/persons/${person.slug}`}
                className="group flex h-full flex-col rounded-2xl bg-white p-5 shadow-card ring-1 ring-outline-variant/70 transition hover:-translate-y-0.5 hover:shadow-soft hover:ring-secondary/30"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary-fixed text-secondary">
                    <PersonIcon size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-extrabold text-primary">{person.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-on-surface-variant">{person.formerPosition}</p>
                  </div>
                  <ArrowRightIcon className="mt-2 shrink-0 text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={18} />
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="rounded-xl bg-surface-container-low p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant"><MinistryIcon size={14} /> 出身省庁</p>
                    <p className="mt-1 truncate text-sm font-extrabold text-primary">{person.ministry}</p>
                  </div>
                  <span className="hidden text-outline sm:block">→</span>
                  <div className="rounded-xl bg-accent-soft p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant"><BuildingIcon size={14} /> 再就職先</p>
                    <p className="mt-1 truncate text-sm font-extrabold text-primary">{person.corporationName}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/70 pt-4 text-xs font-bold text-on-surface-variant">
                  <span>退職から再就職まで {person.waitDays}日</span>
                  <span className="text-secondary">出典を確認する</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
