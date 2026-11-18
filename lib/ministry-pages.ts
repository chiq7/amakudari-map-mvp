export const ministryPages = [
  { slug: "finance", name: "財務省" },
  { slug: "mlit", name: "国土交通省" },
  { slug: "mhlw", name: "厚生労働省" },
  { slug: "meti", name: "経済産業省" },
  { slug: "maff", name: "農林水産省" },
  { slug: "npa", name: "警察庁" },
  { slug: "mic", name: "総務省" },
] as const;

export function getMinistryPath(name: string) {
  const ministry = ministryPages.find((candidate) => candidate.name === name);
  return ministry ? `/ministries/${ministry.slug}` : `/corporations?ministry=${encodeURIComponent(name)}`;
}

const ministryAliases: Record<string, string> = {
  経産: "経済産業省", 経産省: "経済産業省",
  国交: "国土交通省", 国交省: "国土交通省",
  厚労: "厚生労働省", 厚労省: "厚生労働省",
  農水: "農林水産省", 農水省: "農林水産省",
  文科: "文部科学省", 文科省: "文部科学省",
};

export function expandMinistryName(query: string) {
  return ministryAliases[query] ?? query;
}
