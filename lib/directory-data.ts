import { corporations, records } from "./static-content";
import type { DirectoryCorporation } from "./directory-filters";

export const peopleByCorporation = new Map<string, Set<string>>();
for (const record of records) {
  const group = peopleByCorporation.get(record.corporationSlug) ?? new Set<string>();
  group.add(record.personSlug);
  peopleByCorporation.set(record.corporationSlug, group);
}

export const directoryCorporations: DirectoryCorporation[] = corporations.map(({
  slug, name, type, region, count, topMinistry, nextDay, within30Days, averageWaitDays,
  ministries, topics, aliases, relatedTags, description, publicOfficers,
}) => ({
  personCount: peopleByCorporation.get(slug)?.size ?? 0,
  slug, name, type, region, count, topMinistry, nextDay, within30Days, averageWaitDays,
  ministries, topics, aliases, relatedTags, description,
  publicOfficers: publicOfficers.map(({ name, role, formerOrganization, formerPosition, profile }) => ({
    name, role, formerOrganization, formerPosition, profile,
  })),
}));
