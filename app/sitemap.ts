import type { MetadataRoute } from "next";
import organizationsData from "@/public/data/organizations.json";
import { corporations, persons, publicOfficers } from "@/lib/static-content";
import { canonicalUrl } from "@/lib/seo";
import { ministryPages } from "@/lib/ministry-pages";

type OrganizationRecord = {
  organization_slug: string;
};

export default function sitemap(): MetadataRoute.Sitemap {
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
    })),
    ...ministryPages.map((ministry) => ({
      url: canonicalUrl(`/ministries/${ministry.slug}`),
    })),
    ...corporations.map((corporation) => ({
      url: canonicalUrl(`/corporations/${corporation.slug}`),
    })),
    ...persons.map((person) => ({
      url: canonicalUrl(`/persons/${person.slug}`),
    })),
    ...publicOfficers.map((officer) => ({
      url: canonicalUrl(`/public-officers/${officer.slug}`),
    })),
    ...(organizationsData as OrganizationRecord[]).map((organization) => ({
      url: canonicalUrl(
        `/organizations/${organization.organization_slug}`,
      ),
    })),
  ];
}
