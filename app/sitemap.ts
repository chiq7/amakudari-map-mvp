import type { MetadataRoute } from "next";
import organizationsData from "@/public/data/organizations.json";
import { corporations, meta, persons, publicOfficers } from "@/lib/static-content";
import { canonicalUrl } from "@/lib/seo";
import { ministryPages } from "@/lib/ministry-pages";

type OrganizationRecord = {
  organization_slug: string;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const dataLastModified = toLastModified(meta.lastUpdated);
  const staticPaths = [
    "/",
    "/rankings",
    "/corporations",
    "/persons",
    "/organizations",
    "/data-policy",
    "/about",
  ];

  return [
    ...staticPaths.map((pathname) => ({
      url: canonicalUrl(pathname),
      ...(dataLastModified ? { lastModified: dataLastModified } : {}),
    })),
    ...ministryPages.map((ministry) => ({
      url: canonicalUrl(`/ministries/${ministry.slug}`),
      ...(dataLastModified ? { lastModified: dataLastModified } : {}),
    })),
    ...corporations.map((corporation) => ({
      url: canonicalUrl(`/corporations/${corporation.slug}`),
      ...(dataLastModified ? { lastModified: dataLastModified } : {}),
    })),
    ...persons.map((person) => ({
      url: canonicalUrl(`/persons/${person.slug}`),
      ...(dataLastModified ? { lastModified: dataLastModified } : {}),
    })),
    ...publicOfficers.map((officer) => ({
      url: canonicalUrl(`/public-officers/${officer.slug}`),
      ...(dataLastModified ? { lastModified: dataLastModified } : {}),
    })),
    ...(organizationsData as OrganizationRecord[]).map((organization) => ({
      url: canonicalUrl(
        `/organizations/${organization.organization_slug}`,
      ),
      ...(dataLastModified ? { lastModified: dataLastModified } : {}),
    })),
  ];
}

function toLastModified(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
