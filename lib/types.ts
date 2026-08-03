export interface CorporationData {
  slug: string;
  name: string;
  type: string;
  prefecture: string;
  ministry: {
    name: string;
    count: number;
  };
  counts: {
    publicRecords: number;
    nextDay: number;
    within30Days: number;
  };
  waitingDays: {
    average: number;
  };
  relatedPersons: string[];
  sources: string[];
  topics: string[];
  aliases?: string[];
  basicInfo?: CorporationBasicInfo;
  gbizInfo?: GbizInfo;
  publicOfficers?: PublicOfficerProfile[];
}

export interface PublicOfficerProfile {
  slug: string;
  name: string;
  role: string;
  formerOrganization: string;
  formerPosition: string;
  profile: string;
  sourceIds: string[];
}

export interface CorporationPersonHighlight {
  slug: string;
  name: string;
  role: string;
  formerOrganization: string;
  formerPosition: string;
  href: string;
  sourceIds: string[];
  kind: "public-officer" | "reemployment-record";
}

export interface CorporationPersonHighlights {
  kind: "public-officer" | "reemployment-record" | "none";
  people: CorporationPersonHighlight[];
  total: number;
  remaining: number;
}

export interface CorporationBasicInfo {
  corporateNumber: string;
  officialName: string;
  registeredAddress: string;
  prefecture: string;
  city: string;
  sourceName: string;
  sourceUrl: string;
}

export interface GbizInfoExample {
  title: string;
  amount?: number;
  date?: string;
  governmentDepartment?: string;
  category?: string;
  registrationNumber?: string;
  applicationDate?: string;
  patentType?: string;
}

export interface GbizInfoCollection {
  count: number;
  totalAmount?: number;
  examples: GbizInfoExample[];
}

export interface GbizFinance {
  accountingStandards?: string;
  fiscalYear?: string;
  latestPeriod?: {
    period?: string;
    revenue?: number;
    ordinaryIncome?: number;
    netIncome?: number;
    netAssets?: number;
    totalAssets?: number;
    employeeNumber?: number;
  };
}

export interface GbizWorkplaceInfo {
  averageContinuousServiceYears?: number;
  averageContinuousServiceYearsMale?: number;
  averageContinuousServiceYearsFemale?: number;
  averageAge?: number;
  monthlyAverageOvertimeHours?: number;
  femaleWorkersProportion?: number;
  femaleManagerCount?: number;
  managerCount?: number;
  femaleOfficerCount?: number;
  officerCount?: number;
  paternityLeaveEligible?: number;
  maternityLeaveEligible?: number;
  paternityLeaveAcquisitionCount?: number;
  maternityLeaveAcquisitionCount?: number;
}

export interface GbizInfo {
  officialWebsite?: {
    label: string;
    url: string;
  };
  businessSummary?: string;
  employeeNumber?: number;
  capitalStock?: number;
  establishmentDate?: string;
  representativeName?: string;
  subsidies?: GbizInfoCollection;
  procurements?: GbizInfoCollection;
  certifications?: GbizInfoCollection;
  awards?: GbizInfoCollection;
  patents?: GbizInfoCollection;
  finance?: GbizFinance;
  workplaceInfo?: GbizWorkplaceInfo;
  sourceName: string;
  sourceUrl: string;
  fetchedAt: string;
}

export interface PersonData {
  person_slug: string;
  name: string;
  fromMinistry: string;
  previousPosition: string;
  corporationSlug: string;
  corporationName: string;
  newPosition: string;
  retirementDate: string;
  reemploymentDate: string;
  waitingDays: number;
  tags: string[];
  sources: string[];
}

export interface RankingItem {
  corporationSlug: string;
  value: number;
}

export interface RankingDisplayItem extends RankingItem {
  label: string;
}

export interface RankingsData {
  totals: {
    publicRecords: number;
    corporations: number;
    nextDayCorporations: number;
    within30DaysCorporations: number;
  };
  rankings: {
    publicRecords: RankingItem[];
    nextDay: RankingItem[];
    within30Days: RankingItem[];
    shortestAverageWaitingDays: RankingItem[];
  };
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
  memo: string;
}

export interface Topic {
  category: string;
  label: string;
  queryKey: string;
  items: string[];
}

export interface ReemploymentRecord {
  // rawId is intended to be generated from:
  // name + fromMinistry + previousPosition + corporationName + reemploymentDate + sourceUrl.
  rawId: string;
  // dedupeKey is intended to be generated from:
  // name + fromMinistry + previousPosition + corporationName + reemploymentDate.
  dedupeKey: string;
  personSlug: string;
  name: string;
  fromMinistry: string;
  previousPosition: string;
  corporationSlug: string;
  corporationName: string;
  newPosition: string;
  retirementDate: string;
  reemploymentDate: string;
  waitingDays: number;
  sourceId: string;
  sourceUrl: string;
}

export interface DataMeta {
  lastUpdated: string;
  sourceDescription: string;
  productionRecordCount: number;
  corporationCount: number;
  personCount: number;
  rankingCount: number;
  note: string;
}

export interface Corporation {
  slug: string;
  name: string;
  type: string;
  region: string;
  count: number;
  topMinistry: string;
  topMinistryCount: number;
  nextDay: number;
  within30Days: number;
  averageWaitDays: number;
  ministries: string[];
  topics: string[];
  aliases: string[];
  relatedTags: string[];
  description: string;
  relatedPersons: string[];
  sources: string[];
  basicInfo?: CorporationBasicInfo;
  gbizInfo?: GbizInfo;
  publicOfficers: PublicOfficerProfile[];
}

export interface CorporationEditorialContext {
  corporationSlug: string;
  checkedAt: string;
  business: {
    summary: string;
    details: string[];
    officialWebsite: {
      label: string;
      url: string;
    };
  };
  regulatoryTouchpoints: Array<{
    agency: string;
    area: string;
    description: string;
    sourceTitle: string;
    sourceUrl: string;
  }>;
  limitations: string[];
}

export interface Person {
  slug: string;
  name: string;
  ministry: string;
  formerPosition: string;
  corporationSlug: string;
  corporationName: string;
  newPosition: string;
  retiredAt: string;
  reemployedAt: string;
  waitDays: number;
  source: string;
  sourceIds: string[];
  tags: string[];
}
