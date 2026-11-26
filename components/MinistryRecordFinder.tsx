"use client";

import { formatDate } from "@/lib/display-text";
import Link from "next/link";
import { searchKey } from "@/lib/search-key";
import { useState } from "react";
import { buttonLink } from "@/lib/ui-classes";

type Entry = {
  id: string;
  name: string;
  personSlug: string;
  corporation: string;
  corporationSlug: string;
  aliases: string[];
  date: string;
  position: string;
  formerPosition: string;
  corporationType: string;
};

const INITIAL_VISIBLE = 30;
const STEP = 50;

function fiscalYear(date: string) {
  const [year, month] = date.split("-").map(Number);
  return month >= 4 ? year : year - 1;
}

export default function MinistryRecordFinder({ entries, ministry, headingId }: { entries: Entry[]; ministry: string; headingId: string }) {
  const [year, setYear] = useState("");
  const [corporation, setCorporation] = useState("");
  const [person, setPerson] = useState("");
  const [type, setType] = useState("");
  const [formerPosition, setFormerPosition] = useState("");
  const types = [...new Set(entries.map((entry) => entry.corporationType))].sort((a, b) => a.localeCompare(b, "ja"));
  const years = [...new Set(entries.map((entry) => fiscalYear(entry.date)))].sort((a, b) => b - a);
  const results = entries.filter((entry) =>
    (!year || String(fiscalYear(entry.date)) === year) &&
    [entry.corporation, ...entry.aliases].some((value) => searchKey(value).includes(searchKey(corporation))) &&
    searchKey(entry.name).includes(searchKey(person)) &&
    (!type || entry.corporationType === type) &&
    searchKey(entry.formerPosition).includes(searchKey(formerPosition))
  );
  // 長い一覧は最初の30件だけ見せ、残りは「さらに表示」で開く（HTMLには全件を残す）
  const filterKey = [year, corporation, person, type, formerPosition].join("|");
  const [expanded, setExpanded] = useState({ key: "", count: INITIAL_VISIBLE });
  const visible = expanded.key === filterKey ? expanded.count : INITIAL_VISIBLE;
  const fieldClass = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-outline bg-white px-3 text-base text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

  return (
    <section aria-labelledby={headingId} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:p-6">
      <h2 id={headingId} className="text-2xl font-bold text-primary">{ministry}の再就職記録を探す</h2>
      <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">就職日が新しい順。年度は就職日で区切ります（4月〜翌年3月）。</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        <label className="min-w-0 text-sm font-semibold text-primary">再就職先の法人種別
          <select className={fieldClass} value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">すべての法人種別</option>
            {types.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-sm font-semibold text-primary">離職時の官職
          <input type="search" className={fieldClass} value={formerPosition} onChange={(event) => setFormerPosition(event.target.value)} />
        </label>
      </div>
      <div className="mt-2 flex min-h-11 flex-wrap items-center justify-between gap-x-3">
        <p role="status" className="text-sm font-bold text-primary">{results.length}件の再就職記録</p>
        {year || corporation || person || type || formerPosition ? (
          <button type="button" className={buttonLink} onClick={() => {
            setYear("");
            setCorporation("");
            setPerson("");
            setType("");
            setFormerPosition("");
          }}>条件をクリア</button>
        ) : null}
      </div>
      {results.length ? (
        <ul className="divide-y divide-outline-variant border-y border-outline-variant">
          {results.map((entry, index) => (
            <li key={entry.id} className={`${index >= visible ? "hidden" : "grid"} min-w-0 gap-1 py-3 md:grid-cols-[7rem_minmax(0,1fr)_minmax(0,2fr)] md:items-start md:gap-4`}>
              <time dateTime={entry.date} className="pt-2 text-sm tabular-nums text-on-surface-variant">{formatDate(entry.date)}</time>
              <div><Link href={`/persons/${entry.personSlug}`} className="inline-flex min-h-11 items-center break-words font-bold text-secondary hover:text-primary">{entry.name}</Link>
                <p className="text-sm leading-relaxed text-on-surface-variant">離職時：{entry.formerPosition}</p></div>
              <div className="min-w-0">
                <Link href={`/corporations/${entry.corporationSlug}`} className="inline-flex min-h-11 items-center break-words font-bold text-primary hover:text-secondary">{entry.corporation}</Link>
                {entry.position ? <p className="break-words text-sm leading-relaxed text-on-surface-variant">{entry.position}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {results.length > visible ? (
        <button
          type="button"
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-secondary bg-white px-4 text-sm font-bold text-secondary hover:bg-secondary-fixed"
          onClick={() => setExpanded({ key: filterKey, count: visible + STEP })}
        >
          さらに表示（残り{results.length - visible}件）
        </button>
      ) : null}
      {results.length ? null : <p className="border-t border-outline-variant py-4 text-sm text-on-surface-variant">条件に合う記録はありません。名前を短くするか、年度を変更してください。</p>}
    </section>
  );
}
