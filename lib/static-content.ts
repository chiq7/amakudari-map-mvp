export const corporations = [
  {
    slug: "public-policy-research",
    name: "一般財団法人 公共政策総合研究所",
    type: "一般財団法人",
    region: "東京都",
    count: 42,
    topMinistry: "国土交通省",
    topMinistryCount: 18,
    nextDay: 12,
    within30Days: 25,
    averageWaitDays: 45,
    topics: ["再就職情報", "公益法人", "官民人材交流センター"],
  },
  {
    slug: "infrastructure-development",
    name: "株式会社 日本インフラ整備機構",
    type: "株式会社",
    region: "東京都",
    count: 35,
    topMinistry: "国土交通省",
    topMinistryCount: 16,
    nextDay: 14,
    within30Days: 22,
    averageWaitDays: 12,
    topics: ["インフラ", "公共事業", "再就職情報"],
  },
  {
    slug: "international-technology-exchange",
    name: "公益財団法人 国際技術交流協会",
    type: "公益財団法人",
    region: "大阪府",
    count: 28,
    topMinistry: "経済産業省",
    topMinistryCount: 12,
    nextDay: 8,
    within30Days: 15,
    averageWaitDays: 32,
    topics: ["技術交流", "公益法人", "再就職情報"],
  },
  {
    slug: "urban-renaissance",
    name: "独立行政法人 都市再生機構",
    type: "独立行政法人",
    region: "東京都",
    count: 24,
    topMinistry: "国土交通省",
    topMinistryCount: 11,
    nextDay: 6,
    within30Days: 12,
    averageWaitDays: 45,
    topics: ["都市再生", "独立行政法人", "再就職情報"],
  },
];

export const persons = [
  {
    slug: "sato-kenichi",
    name: "佐藤 健一",
    ministry: "国土交通省",
    formerPosition: "大臣官房審議官",
    corporationSlug: "public-policy-research",
    corporationName: "一般財団法人 公共政策総合研究所",
    newPosition: "専務理事",
    retiredAt: "2023/03/31",
    reemployedAt: "2023/04/01",
    waitDays: 0,
    source: "内閣官房：国家公務員の再就職状況の公表資料（2023年度）",
  },
  {
    slug: "tanaka-hiroshi",
    name: "田中 博",
    ministry: "総務省",
    formerPosition: "情報流通行政局長",
    corporationSlug: "public-policy-research",
    corporationName: "一般財団法人 公共政策総合研究所",
    newPosition: "顧問",
    retiredAt: "2022/12/31",
    reemployedAt: "2023/02/15",
    waitDays: 46,
    source: "総務省：職員の再就職状況の公表資料",
  },
  {
    slug: "watanabe-makoto",
    name: "渡辺 誠",
    ministry: "経済産業省",
    formerPosition: "中小企業庁次長",
    corporationSlug: "public-policy-research",
    corporationName: "一般財団法人 公共政策総合研究所",
    newPosition: "理事",
    retiredAt: "2023/03/31",
    reemployedAt: "2023/04/01",
    waitDays: 0,
    source: "経済産業省：離職者再就職情報の定期公表",
  },
  {
    slug: "ito-yuji",
    name: "伊藤 裕二",
    ministry: "国土交通省",
    formerPosition: "航空局次長",
    corporationSlug: "public-policy-research",
    corporationName: "一般財団法人 公共政策総合研究所",
    newPosition: "常務理事",
    retiredAt: "2023/01/15",
    reemployedAt: "2023/04/01",
    waitDays: 76,
    source: "国土交通省：職員の再就職状況の公表資料",
  },
];

export const totals = {
  publicRecords: 1733,
  corporations: 860,
  nextDayCorporations: 84,
  within30DaysCorporations: 248,
};

export function getCorporation(slug: string) {
  return corporations.find((corporation) => corporation.slug === slug) ?? corporations[0];
}

export function getPerson(slug: string) {
  return persons.find((person) => person.slug === slug) ?? persons[0];
}
