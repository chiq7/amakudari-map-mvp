import Link from "next/link";
import { persons } from "@/lib/static-content";
import { ArrowRightIcon } from "@/components/icons";
import { SearchBox } from "@/components/ui";

const ministryGroups = Array.from(
  persons.reduce<Map<string, Array<(typeof persons)[number]>>>((groups, person) => {
    const ministry = person.ministry.trim() || "所属省庁不明";
    const group = groups.get(ministry) ?? [];
    group.push(person);
    groups.set(ministry, group);
    return groups;
  }, new Map()),
)
  .map(([ministry, people]) => ({
    ministry,
    people: people.sort((left, right) => left.name.localeCompare(right.name, "ja")),
  }))
  .sort(
    (left, right) =>
      right.people.length - left.people.length || left.ministry.localeCompare(right.ministry, "ja"),
  )
  .map((group, index) => ({ ...group, id: `ministry-${index + 1}` }));

export default function PersonsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-7 rounded-3xl bg-primary px-5 py-8 text-white md:px-9 md:py-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-[#f2b2a8]">PEOPLE</p>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight md:text-4xl">人から公表記録を探す</h1>
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-white/72 md:text-base">
            人物を出身省庁ごとに分けました。氏名から、役職・再就職先・出典を確認できます。
          </p>
        </div>
        <SearchBox placeholder="氏名・役職・省庁名で検索" className="text-on-surface" />
      </section>

      <section>
        <div className="flex flex-col gap-2 border-b border-outline-variant pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-primary">省庁別の人物一覧</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              省庁名を選び、必要な区分だけ開いて確認できます。氏名が分かる場合は上の検索が最短です。
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold text-on-surface-variant">
            {persons.length.toLocaleString()}件 / {ministryGroups.length}区分
          </p>
        </div>

        <nav
          aria-label="省庁別の人物一覧へ移動"
          className="mt-5 grid grid-cols-2 gap-px border border-outline-variant bg-outline-variant sm:grid-cols-3 lg:grid-cols-4"
        >
          {ministryGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="flex min-h-12 items-center justify-between gap-2 bg-white px-3 py-2 text-xs font-bold text-primary transition hover:bg-secondary-fixed hover:text-secondary"
            >
              <span>{group.ministry}</span>
              <span className="text-on-surface-variant">{group.people.length}</span>
            </a>
          ))}
        </nav>

        <div className="mt-6 space-y-4">
          {ministryGroups.map((group) => (
            <details
              key={group.id}
              id={group.id}
              className="group scroll-mt-44 border border-outline-variant bg-surface-container-lowest lg:scroll-mt-28"
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 border-l-4 border-secondary bg-surface-container-low px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block text-lg font-extrabold text-primary">{group.ministry}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-on-surface-variant">
                    公表記録 {group.people.length.toLocaleString()}件
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold text-secondary">
                  <span className="group-open:hidden">一覧を開く ＋</span>
                  <span className="hidden group-open:inline">閉じる －</span>
                </span>
              </summary>

              <ul className="divide-y divide-outline-variant">
                {group.people.map((person, personIndex) => (
                  <li key={`${person.slug}-${person.corporationSlug}-${personIndex}`}>
                    <Link
                      href={`/persons/${person.slug}`}
                      className="group/row grid gap-2 px-4 py-4 transition hover:bg-surface-container-low md:grid-cols-[minmax(120px,0.7fr)_minmax(220px,1.2fr)_24px_minmax(220px,1.2fr)_auto] md:items-center md:gap-4"
                    >
                      <div>
                        <h3 className="font-extrabold text-primary group-hover/row:text-secondary">{person.name}</h3>
                        <p className="mt-1 text-xs font-bold text-on-surface-variant">待機 {person.waitDays}日</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-on-surface-variant md:hidden">離職時官職</p>
                        <p className="text-sm leading-6 text-on-surface-variant">{person.formerPosition}</p>
                      </div>
                      <span className="hidden text-center text-outline md:block" aria-hidden="true">→</span>
                      <div>
                        <p className="text-[11px] font-bold text-on-surface-variant md:hidden">再就職先</p>
                        <p className="text-sm font-bold leading-6 text-primary">{person.corporationName}</p>
                        <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">{person.newPosition}</p>
                      </div>
                      <ArrowRightIcon className="hidden shrink-0 text-outline transition group-hover/row:translate-x-1 group-hover/row:text-secondary md:block" size={18} />
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
