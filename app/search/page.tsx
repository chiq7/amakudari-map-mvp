"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { ArrowRightIcon, BuildingIcon, MinistryIcon, PersonIcon, SearchIcon } from "@/components/icons";
import personsData from "@/data/production/persons.json";
import corporationsData from "@/data/production/corporations.json";
import type { CorporationData, PersonData } from "@/lib/types";

type SearchPerson = {
  person_slug: string;
  氏名?: string;
  離職時官職?: string;
  再就職先名称?: string;
  再就職先地位?: string;
};

type SearchOrganization = {
  organization_slug: string;
  再就職先名称?: string;
  受け入れ人数?: number;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const lastTrackedQuery = useRef("");
  const persons: SearchPerson[] = useMemo(
    () =>
      (personsData as PersonData[]).map((person) => ({
        person_slug: person.person_slug,
        氏名: person.name,
        離職時官職: `${person.fromMinistry} ${person.previousPosition}`,
        再就職先名称: person.corporationName,
        再就職先地位: person.newPosition,
      })),
    [],
  );
  const organizations: SearchOrganization[] = useMemo(
    () =>
      (corporationsData as CorporationData[]).map((corporation) => ({
        organization_slug: corporation.slug,
        再就職先名称: corporation.name,
        受け入れ人数: corporation.counts.publicRecords,
      })),
    [],
  );

  useEffect(() => {
    const urlQuery = searchParams.get("keyword")?.trim();
    if (urlQuery) {
      setQuery(urlQuery);
      return;
    }
    const storedQuery = sessionStorage.getItem("amakudari:search-query");
    if (!storedQuery) return;
    sessionStorage.removeItem("amakudari:search-query");
    setQuery(storedQuery);
  }, [searchParams]);

  const results = useMemo(() => {
    if (query.trim().length <= 1) return { persons: [], organizations: [] };
    const normalizedQuery = query.trim().toLocaleLowerCase("ja");
    return {
      persons: persons
        .filter((person) =>
          [person.氏名, person.離職時官職, person.再就職先名称, person.再就職先地位].some((value) =>
            value?.toLocaleLowerCase("ja").includes(normalizedQuery),
          ),
        )
        .slice(0, 50),
      organizations: organizations
        .filter((organization) => organization.再就職先名称?.toLocaleLowerCase("ja").includes(normalizedQuery))
        .slice(0, 50),
    };
  }, [query, persons, organizations]);

  useEffect(() => {
    if (query.trim().length <= 1 || query === lastTrackedQuery.current) return;
    const timeout = window.setTimeout(() => {
      trackEvent("site_search", {
        result_count: results.persons.length + results.organizations.length,
        page_type: "search",
        location: "search_results",
      });
      lastTrackedQuery.current = query;
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [query, results]);

  const totalResults = results.persons.length + results.organizations.length;
  const isSearching = query.trim().length > 1;

  return (
    <div className="flex flex-col gap-10">
      <section className="mx-auto w-full max-w-4xl text-center">
        <p className="text-xs font-extrabold tracking-[0.14em] text-secondary">SEARCH</p>
        <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-primary md:text-4xl">公表記録を横断検索</h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-7 text-on-surface-variant md:text-base">
          人名、離職時の官職、再就職先の法人名から、関連する公表記録をまとめて探せます。
        </p>

        <label className="mx-auto mt-7 block max-w-3xl text-left">
          <span className="sr-only">検索キーワード</span>
          <span className="flex flex-col gap-2 rounded-2xl border border-outline-variant bg-white p-2 shadow-card sm:flex-row sm:items-center">
            <span className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={21} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例：氏名、国土交通省、法人名"
                className="h-12 w-full rounded-xl border-0 bg-transparent py-3 pl-11 pr-3 text-base font-medium text-on-surface outline-none placeholder:font-normal placeholder:text-on-surface-variant focus:ring-0"
                autoFocus
              />
            </span>
            <span className="inline-flex min-h-12 items-center justify-center rounded-xl bg-secondary px-5 text-sm font-bold text-white">
              {isSearching ? `${totalResults}件` : "2文字以上で検索"}
            </span>
          </span>
        </label>
      </section>

      {!isSearching ? (
        <section className="mx-auto grid w-full max-w-4xl gap-3 sm:grid-cols-3">
          {[
            [<PersonIcon key="person" size={22} />, "人名", "公表された氏名から探す"],
            [<MinistryIcon key="ministry" size={22} />, "官職・省庁", "離職時の所属や役職から探す"],
            [<BuildingIcon key="building" size={22} />, "法人", "再就職先の名称から探す"],
          ].map(([icon, title, description]) => (
            <div key={String(title)} className="rounded-2xl bg-surface-container-low p-5 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-secondary">{icon}</span>
              <h2 className="mt-4 font-extrabold text-primary">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">{description}</p>
            </div>
          ))}
        </section>
      ) : totalResults === 0 ? (
        <section className="mx-auto w-full max-w-3xl rounded-3xl bg-white px-6 py-12 text-center shadow-card ring-1 ring-outline-variant/70">
          <p className="text-lg font-extrabold text-primary">該当する公表記録は見つかりませんでした</p>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">氏名の一部、法人の正式名称、省庁名などで検索し直してください。</p>
        </section>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-primary"><PersonIcon size={21} /> 人物</h2>
              <span className="text-sm font-bold text-on-surface-variant">{results.persons.length}件</span>
            </div>
            <div className="mt-4 grid gap-3">
              {results.persons.map((person) => (
                <Link key={person.person_slug} href={`/persons/${person.person_slug}`} className="group rounded-2xl bg-white p-5 shadow-card ring-1 ring-outline-variant/70 transition hover:ring-secondary/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-extrabold text-primary">{person.氏名}</h3>
                      <p className="mt-2 text-xs font-bold text-on-surface-variant">離職時</p>
                      <p className="mt-0.5 text-sm leading-6 text-on-surface">{person.離職時官職}</p>
                      <p className="mt-3 text-xs font-bold text-on-surface-variant">再就職先</p>
                      <p className="mt-0.5 text-sm font-bold leading-6 text-primary">{person.再就職先名称}・{person.再就職先地位}</p>
                    </div>
                    <ArrowRightIcon className="mt-1 shrink-0 text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={18} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-primary"><BuildingIcon size={21} /> 法人</h2>
              <span className="text-sm font-bold text-on-surface-variant">{results.organizations.length}件</span>
            </div>
            <div className="mt-4 grid gap-3">
              {results.organizations.map((organization) => (
                <Link key={organization.organization_slug} href={`/corporations/${organization.organization_slug}`} className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-outline-variant/70 transition hover:ring-secondary/30">
                  <div className="min-w-0">
                    <h3 className="font-extrabold leading-6 text-primary">{organization.再就職先名称}</h3>
                    <p className="mt-2 text-sm text-on-surface-variant">公表された受け入れ人数 {organization.受け入れ人数 ?? 0}人</p>
                  </div>
                  <ArrowRightIcon className="shrink-0 text-outline transition group-hover:translate-x-1 group-hover:text-secondary" size={18} />
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm font-bold text-on-surface-variant">検索を読み込んでいます…</div>}>
      <SearchContent />
    </Suspense>
  );
}
