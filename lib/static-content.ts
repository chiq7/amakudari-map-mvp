import corporationsData from "@/data/production/corporations.json";
import personsData from "@/data/production/persons.json";
import rankingsData from "@/data/production/rankings.json";
import recordsData from "@/data/production/records.json";
import sourcesData from "@/data/production/sources.json";
import topicsData from "@/data/production/topics.json";
import type {
  Corporation,
  CorporationData,
  DataMeta,
  Person,
  PersonData,
  RankingDisplayItem,
  RankingItem,
  RankingsData,
  ReemploymentRecord,
  Source,
  Topic,
} from "@/lib/types";
import metaData from "@/data/production/meta.json";

const rawCorporations = corporationsData as CorporationData[];
const rawPersons = personsData as PersonData[];

export const sources = sourcesData as Source[];
export const topics = topicsData as Topic[];
export const rankings = rankingsData as RankingsData;
export const records = recordsData as ReemploymentRecord[];
export const meta = metaData as DataMeta;

const sourcesById = new Map(sources.map((source) => [source.id, source]));
const ministriesByCorporation = new Map<string, Set<string>>();
const tagsByCorporation = new Map<string, Set<string>>();

rawPersons.forEach((person) => {
  const ministries = ministriesByCorporation.get(person.corporationSlug) ?? new Set<string>();
  ministries.add(person.fromMinistry);
  ministriesByCorporation.set(person.corporationSlug, ministries);

  const tags = tagsByCorporation.get(person.corporationSlug) ?? new Set<string>();
  person.tags.forEach((tag) => tags.add(tag));
  tagsByCorporation.set(person.corporationSlug, tags);
});

export const corporations: Corporation[] = rawCorporations.map((corporation) => ({
  slug: corporation.slug,
  name: corporation.name,
  type: corporation.type,
  region:
    corporation.prefecture !== "不明"
      ? corporation.prefecture
      : corporation.basicInfo?.prefecture || corporation.prefecture,
  count: corporation.counts.publicRecords,
  topMinistry: corporation.ministry.name,
  topMinistryCount: corporation.ministry.count,
  nextDay: corporation.counts.nextDay,
  within30Days: corporation.counts.within30Days,
  averageWaitDays: corporation.waitingDays.average,
  ministries: Array.from(
    new Set([
      ...Array.from(
        ministriesByCorporation.get(corporation.slug) ?? [corporation.ministry.name],
      ),
      ...(corporation.publicOfficers ?? []).map((officer) => officer.formerOrganization),
    ]),
  ),
  topics: corporation.topics,
  aliases: corporation.aliases ?? [],
  relatedTags: Array.from(tagsByCorporation.get(corporation.slug) ?? []),
  description: corporation.gbizInfo?.businessSummary ?? "",
  relatedPersons: corporation.relatedPersons,
  sources: corporation.sources,
  basicInfo: corporation.basicInfo,
  gbizInfo: corporation.gbizInfo,
  publicOfficers: corporation.publicOfficers ?? [],
}));

export const publicOfficers = corporations.flatMap((corporation) =>
  corporation.publicOfficers.map((officer) => ({
    ...officer,
    corporationSlug: corporation.slug,
    corporationName: corporation.name,
  })),
);

export const persons: Person[] = rawPersons.map((person) => {
  const primarySource = sourcesById.get(person.sources[0]);

  return {
    slug: person.person_slug,
    name: person.name,
    ministry: person.fromMinistry,
    formerPosition: person.previousPosition,
    corporationSlug: person.corporationSlug,
    corporationName: person.corporationName,
    newPosition: person.newPosition,
    retiredAt: person.retirementDate,
    reemployedAt: person.reemploymentDate,
    waitDays: person.waitingDays,
    source: primarySource ? `${primarySource.publisher}：${primarySource.title}` : "",
    sourceIds: person.sources,
    tags: person.tags,
  };
});

function hydrateRanking(items: RankingItem[]): RankingDisplayItem[] {
  return items.flatMap((item) => {
    const corporation = corporations.find((candidate) => candidate.slug === item.corporationSlug);
    return corporation ? [{ ...item, label: corporation.name }] : [];
  });
}

export const rankingLists = {
  publicRecords: hydrateRanking(rankings.rankings.publicRecords),
  nextDay: hydrateRanking(rankings.rankings.nextDay),
  within30Days: hydrateRanking(rankings.rankings.within30Days),
  shortestAverageWaitingDays: hydrateRanking(rankings.rankings.shortestAverageWaitingDays),
};

export const totals = rankings.totals;

export function getCorporation(slug: string) {
  return corporations.find((corporation) => corporation.slug === slug) ?? corporations[0];
}

export function getPerson(slug: string) {
  return persons.find((person) => person.slug === slug) ?? persons[0];
}

export function getPublicOfficer(slug: string) {
  return publicOfficers.find((officer) => officer.slug === slug);
}
