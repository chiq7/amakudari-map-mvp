import { Suspense } from "react";
import SearchContent from "./SearchContent";
import personsData from "@/data/production/persons.json";
import corporationsData from "@/data/production/corporations.json";
import type { CorporationData, PersonData } from "@/lib/types";

const persons = (personsData as PersonData[]).map((person) => ({
  person_slug: person.person_slug,
  氏名: person.name,
  離職時官職: `${person.fromMinistry} ${person.previousPosition}`,
  再就職先名称: person.corporationName,
  再就職先地位: person.newPosition,
}));

const organizations = (corporationsData as CorporationData[]).map((corporation) => ({
  organization_slug: corporation.slug,
  再就職先名称: corporation.name,
  受け入れ人数: corporation.counts.publicRecords,
}));

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm font-bold text-on-surface-variant">検索を読み込んでいます…</div>}>
      <SearchContent persons={persons} organizations={organizations} />
    </Suspense>
  );
}
