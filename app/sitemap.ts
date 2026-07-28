import type { MetadataRoute } from "next";
import pageLastmodData from "@/data/production/page-lastmod.json";
import organizationsData from "@/public/data/organizations.json";
import { corporations, persons, publicOfficers } from "@/lib/static-content";
import { canonicalUrl } from "@/lib/seo";
import { ministryPages } from "@/lib/ministry-pages";
import { newsArticles } from "@/lib/news";

type OrganizationRecord = {
  organization_slug: string;
};

type PageLastmodData = {
  pages?: Record<string, string>;
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
  const latestNewsModified = newsArticles
    .map((article) => toLastModified(article.dateModified))
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => right.getTime() - left.getTime())[0];

  return [
    ...staticPaths.map((pathname) => ({
      url: canonicalUrl(pathname),
      ...lastModifiedFor(pathname),
    })),
    {
      url: canonicalUrl("/news"),
      ...(latestNewsModified ? { lastModified: latestNewsModified } : {}),
    },
    ...ministryPages.map((ministry) => ({
      url: canonicalUrl(`/ministries/${ministry.slug}`),
      ...lastModifiedFor(`/ministries/${ministry.slug}`),
    })),
    ...newsArticles.map((article) => ({
      url: canonicalUrl(`/news/${article.slug}`),
      ...(toLastModified(article.dateModified)
        ? { lastModified: toLastModified(article.dateModified) }
        : lastModifiedFor(`/news/${article.slug}`)),
    })),
    ...corporations.map((corporation) => ({
      url: canonicalUrl(`/corporations/${corporation.slug}`),
      ...lastModifiedFor(`/corporations/${corporation.slug}`),
    })),
    ...persons.map((person) => ({
      url: canonicalUrl(`/persons/${person.slug}`),
      ...lastModifiedFor(`/persons/${person.slug}`),
    })),
    ...publicOfficers.map((officer) => ({
      url: canonicalUrl(`/public-officers/${officer.slug}`),
      ...lastModifiedFor(`/public-officers/${officer.slug}`),
    })),
    ...(organizationsData as OrganizationRecord[]).map((organization) => ({
      url: canonicalUrl(
        `/organizations/${organization.organization_slug}`,
      ),
      ...lastModifiedFor(`/organizations/${organization.organization_slug}`),
    })),
  ];
}

function lastModifiedFor(pathname: string) {
  const pageLastmod = pageLastmodData as PageLastmodData;
  const lastModified = toLastModified(pageLastmod.pages?.[pathname]);
  return lastModified ? { lastModified } : {};
}

function toLastModified(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
