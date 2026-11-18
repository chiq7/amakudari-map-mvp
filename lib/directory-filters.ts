import type { Corporation } from "./types";
import { searchKey } from "./search-key";
import { corporationTypeGroups } from "./corporation-types";

export type DirectoryCorporation = Pick<Corporation,
  "slug" | "name" | "type" | "region" | "count" | "topMinistry" | "nextDay" |
  "within30Days" | "averageWaitDays" | "ministries" | "topics" | "aliases" |
  "relatedTags" | "description"
> & {
  personCount: number;
  publicOfficers: Pick<Corporation["publicOfficers"][number],
    "name" | "role" | "formerOrganization" | "formerPosition" | "profile"
  >[];
};

const areaPrefectures: Record<string, string[]> = {
  関東地方: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  近畿地方: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
};

type ActiveFilter = {
  label: string;
  heading: string;
  description: string;
  value: string;
};

function matchesType(corporation: DirectoryCorporation, type: string) {
  if (Object.hasOwn(corporationTypeGroups, type)) return corporationTypeGroups[type].includes(corporation.type);
  return corporation.type === type || corporation.name.includes(type);
}

function matchesArea(corporation: DirectoryCorporation, area: string) {
  const prefectures = areaPrefectures[area];
  return prefectures ? prefectures.includes(corporation.region) : corporation.region === area;
}

function matchesTag(corporation: DirectoryCorporation, tag: string) {
  if (tag === "30日以内") return corporation.within30Days > 0;
  if (tag === "再就職情報") return corporation.count > 0;
  const normalizedTag = tag.toLocaleLowerCase("ja");
  return [
    corporation.name,
    ...corporation.aliases,
    corporation.description,
    ...corporation.topics,
    ...corporation.relatedTags,
    ...corporation.publicOfficers.flatMap((officer) => [
      officer.name,
      officer.role,
      officer.formerOrganization,
      officer.formerPosition,
      officer.profile,
    ]),
  ].some((value) => value.toLocaleLowerCase("ja").includes(normalizedTag));
}

function getActiveFilters({
  ministry,
  type,
  area,
  flag,
  tag,
  keyword,
  sort,
}: {
  ministry: string;
  type: string;
  area: string;
  flag: string;
  tag: string;
  keyword: string;
  sort: string;
}) {
  const filters: ActiveFilter[] = [];

  if (ministry) {
    filters.push({
      label: "省庁",
      heading: `${ministry}に関連する法人を表示中`,
      description: `再就職記録や公表された役員略歴に「${ministry}」が登場する法人を表示しています。`,
      value: ministry,
    });
  }
  if (type) {
    filters.push({
      label: "法人種別",
      heading: `${type}の法人を表示中`,
      description: `法人種別が『${type}』の法人を表示しています。`,
      value: type,
    });
  }
  if (area) {
    filters.push({
      label: "地域",
      heading: `${area}の法人を表示中`,
      description: `所在地が『${area}』の法人を表示しています。`,
      value: area,
    });
  }
  if (flag === "nextDay") {
    filters.push({
      label: "指標",
      heading: "退職翌日再就職がある法人を表示中",
      description: "退職翌日再就職の記録がある法人を表示しています。",
      value: "退職翌日再就職",
    });
  }
  if (flag === "within30Days") {
    filters.push({
      label: "指標",
      heading: "30日以内再就職がある法人を表示中",
      description: "30日以内再就職の記録がある法人を表示しています。",
      value: "30日以内再就職",
    });
  }
  if (tag) {
    filters.push({
      label: "タグ",
      heading: `「${tag}」に関連する法人を表示中`,
      description: `「${tag}」に関連する法人を表示しています。`,
      value: tag,
    });
  }
  if (keyword) {
    filters.push({
      label: "検索語",
      heading: `「${keyword}」の検索結果を表示中`,
      description: `「${keyword}」を含む法人を表示しています。`,
      value: keyword,
    });
  }
  if (sort === "publicRecords") {
    filters.push({
      label: "並び順",
      heading: "公表再就職記録数の多い順で表示中",
      description: "公表再就職記録数の多い順で表示しています。",
      value: "公表再就職記録数",
    });
  }
  if (sort === "shortestAverageWaitingDays") {
    filters.push({
      label: "並び順",
      heading: "平均待機日数が短い順で表示中",
      description: "平均待機日数が短い順で表示しています。",
      value: "平均待機日数",
    });
  }

  return filters;
}

export function getDirectoryPage(corporations: DirectoryCorporation[], searchParams: Pick<URLSearchParams, "get">) {
  const requestedShowAll = searchParams.get("show") === "all";
  const ministry = searchParams.get("ministry")?.trim() ?? "";
  const type = searchParams.get("type")?.trim() ?? "";
  const area =
    searchParams.get("area")?.trim() ??
    searchParams.get("region")?.trim() ??
    "";
  const flag =
    searchParams.get("flag")?.trim() ??
    (searchParams.get("nextDay") === "true"
      ? "nextDay"
      : searchParams.get("within30Days") === "true"
        ? "within30Days"
        : "");
  const sort = searchParams.get("sort")?.trim() ?? "";
  const tag =
    searchParams.get("tag")?.trim() ??
    searchParams.get("topic")?.trim() ??
    searchParams.get("industry")?.trim() ??
    "";
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const activeFilters = getActiveFilters({ ministry, type, area, flag, tag, keyword, sort });
  const primaryFilter = activeFilters[0];

  const filteredCorporations = corporations
    .filter((corporation) => !ministry || corporation.ministries.includes(ministry))
    .filter((corporation) => !type || matchesType(corporation, type))
    .filter((corporation) => !area || matchesArea(corporation, area))
    .filter((corporation) => flag !== "nextDay" || corporation.nextDay > 0)
    .filter((corporation) => flag !== "within30Days" || corporation.within30Days > 0)
    .filter((corporation) => !tag || matchesTag(corporation, tag))
    .filter((corporation) => {
      if (!keyword) return true;
      const normalizedKeyword = searchKey(keyword);
      return [
        corporation.name,
        ...corporation.aliases,
        corporation.type,
        corporation.region,
        corporation.description,
        ...corporation.ministries,
        ...corporation.topics,
        ...corporation.relatedTags,
        ...corporation.publicOfficers.flatMap((officer) => [
          officer.name,
          officer.role,
          officer.formerOrganization,
          officer.formerPosition,
          officer.profile,
        ]),
      ].some((value) => searchKey(value).includes(normalizedKeyword));
    })
    .sort((left, right) => {
      if (sort === "publicRecords") return right.count - left.count;
      if (sort === "shortestAverageWaitingDays") {
        return left.averageWaitDays - right.averageWaitDays;
      }
      return 0;
    });

  const isFiltered = activeFilters.length > 0;
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filteredCorporations.length / pageSize));
  const requestedPage = Number(searchParams.get("page"));
  const page = Number.isInteger(requestedPage) ? Math.min(pageCount, Math.max(1, requestedPage)) : 1;
  const first = (page - 1) * pageSize;
  const visibleCorporations = filteredCorporations.slice(first, first + pageSize);
  const renderDirectory = isFiltered || requestedShowAll;
  return { ministry, type, flag, activeFilters, primaryFilter, filteredCorporations, isFiltered, pageCount, page, first, visibleCorporations, renderDirectory };
}
