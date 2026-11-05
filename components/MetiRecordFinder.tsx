"use client";

import Link from "next/link";
import { useState } from "react";

type Entry = {
  id: string;
  name: string;
  personSlug: string;
  corporation: string;
  corporationSlug: string;
  aliases: string[];
  date: string;
  position: string;
};

function fiscalYear(date: string) {
  const [year, month] = date.split("-").map(Number);
  return month >= 4 ? year : year - 1;
}

function searchKey(text: string) {
  return text.normalize("NFKC").toLowerCase().replace(/\s+/gu, "");
}

export default function MetiRecordFinder({ entries }: { entries: Entry[] }) {
  const [year, setYear] = useState("");
  const [corporation, setCorporation] = useState("");
  const [person, setPerson] = useState("");
  const years = [...new Set(entries.map((entry) => fiscalYear(entry.date)))].sort((a, b) => b - a);
  const results = entries.filter((entry) =>
    (!year || String(fiscalYear(entry.date)) === year) &&
    [entry.corporation, ...entry.aliases].some((value) => searchKey(value).includes(searchKey(corporation))) &&
    searchKey(entry.name).includes(searchKey(person))
  );
  const fieldClass = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-outline bg-white px-3 text-base text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

  return (
    <section aria-labelledby="meti-records" className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:p-6">
      <h2 id="meti-records" className="text-2xl font-bold text-primary">経産省の再就職記録を探す</h2>
      <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">就職日が新しい順。年度は就職日で区切ります（4月〜翌年3月）。</p>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.5fr_1fr]">
        <label className="min-w-0 text-sm font-semibold text-primary">
          再就職年度
          <select className={fieldClass} value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="">すべての年度</option>
            {years.map((value) => <option key={value} value={value}>{value}年度</option>)}
          </select>
        </label>
        <label className="min-w-0 text-sm font-semibold text-primary">
          再就職先の法人名
          <input type="search" className={fieldClass} value={corporation} onChange={(event) => setCorporation(event.target.value)} />
        </label>
        <label className="min-w-0 text-sm font-semibold text-primary">
          人物の氏名
          <input type="search" className={fieldClass} value={person} onChange={(event) => setPerson(event.target.value)} />
        </label>
      </div>
      <div className="mt-2 flex min-h-11 flex-wrap items-center justify-between gap-x-3">
        <p role="status" className="text-sm font-bold text-primary">{results.length}件の再就職記録</p>
        {year || corporation || person ? (
          <button type="button" className="min-h-11 px-2 text-sm font-bold text-secondary underline" onClick={() => {
            setYear("");
            setCorporation("");
            setPerson("");
          }}>条件をクリア</button>
        ) : null}
      </div>
      {results.length ? (
        <ul className="divide-y divide-outline-variant border-y border-outline-variant">
          {results.map((entry) => (
            <li key={entry.id} className="grid min-w-0 gap-1 py-3 md:grid-cols-[7rem_minmax(0,1fr)_minmax(0,2fr)] md:items-start md:gap-4">
              <time dateTime={entry.date} className="pt-2 text-sm tabular-nums text-on-surface-variant">{entry.date.replaceAll("-", "/")}</time>
              <Link href={`/persons/${entry.personSlug}`} className="flex min-h-11 items-center break-words font-bold text-secondary underline underline-offset-4">{entry.name}</Link>
              <div className="min-w-0">
                <Link href={`/corporations/${entry.corporationSlug}`} className="inline-flex min-h-11 items-center break-words font-bold text-primary underline underline-offset-4">{entry.corporation}</Link>
                {entry.position ? <p className="break-words text-sm leading-relaxed text-on-surface-variant">{entry.position}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="border-t border-outline-variant py-4 text-sm text-on-surface-variant">条件に合う記録はありません。名前を短くするか、年度を変更してください。</p>}
    </section>
  );
}
