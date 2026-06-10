import type { MetadataRoute } from "next";
import organizationsData from "@/public/data/organizations.json";
import topicsData from "@/public/data/topics.json";
import { corporations, persons } from "@/lib/static-content";
import { canonicalUrl } from "@/lib/seo";

type OrganizationRecord = {
  organization_slug: string;
};

type TopicRecord = {
  topic_slug: string;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/rankings",
    "/corporations",
    "/persons",
    "/organizations",
    "/topics",
    "/data-policy",
    "/about",
  ];

  return [
    ...staticPaths.map((pathname) => ({
      url: canonicalUrl(pathname),
    })),
    ...corporations.map((corporation) => ({
      url: canonicalUrl(`/corporations/${corporation.slug}`),
    })),
    ...persons.map((person) => ({
      url: canonicalUrl(`/persons/${person.slug}`),
    })),
    ...(organizationsData as OrganizationRecord[]).map((organization) => ({
      url: canonicalUrl(
        `/organizations/${organization.organization_slug}`,
      ),
    })),
    ...(topicsData as TopicRecord[]).map((topic) => ({
      url: canonicalUrl(`/topics/${topic.topic_slug}`),
    })),
  ];
}
