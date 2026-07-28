export const ministryPages = [
  { slug: "finance", name: "財務省" },
  { slug: "mlit", name: "国土交通省" },
  { slug: "mhlw", name: "厚生労働省" },
  { slug: "meti", name: "経済産業省" },
  { slug: "maff", name: "農林水産省" },
] as const;

export function getMinistryPath(name: string) {
  const ministry = ministryPages.find((candidate) => candidate.name === name);
  return ministry ? `/ministries/${ministry.slug}` : `/corporations?ministry=${encodeURIComponent(name)}`;
}
