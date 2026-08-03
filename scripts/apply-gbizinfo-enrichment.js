(() => {
const fs = require("node:fs");
const path = require("node:path");

const candidatePath = path.join(
  process.cwd(),
  "data",
  "draft",
  "gbizinfo-enrichment-candidate",
  "corporations.json",
);
const productionPath = path.join(
  process.cwd(),
  "data",
  "production",
  "corporations.json",
);
const archiveRoot = path.join(process.cwd(), "data", "archive");

function pad(value) {
  return String(value).padStart(2, "0");
}

function timestamp(date = new Date()) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function cleanString(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function cleanDate(value) {
  const date = cleanString(value);
  return /^\d{4}-\d{2}-\d{2}/.test(date) ? date.slice(0, 10) : date;
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function amountNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !/^-?\d+(?:\.\d+)?$/.test(value.trim())) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function compactObject(entries) {
  return Object.fromEntries(
    entries.filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") return Object.keys(value).length > 0;
      return true;
    }),
  );
}

function hasMeaningfulData(value) {
  if (Array.isArray(value)) return value.some(hasMeaningfulData);
  if (value && typeof value === "object") {
    return Object.values(value).some(hasMeaningfulData);
  }
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
}

function normalizeFinancialCollection(items, dateField, limit = 3) {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  const amounts = items.map((item) => amountNumber(item.amount));
  const numericAmounts = amounts.filter((amount) => amount !== null);
  const examples = items.slice(0, limit).map((item) =>
    compactObject([
      ["title", cleanString(item.title)],
      ["amount", amountNumber(item.amount)],
      ["date", cleanDate(item[dateField])],
      ["governmentDepartment", cleanString(item.government_departments)],
    ]),
  );
  return compactObject([
    ["count", items.length],
    [
      "totalAmount",
      numericAmounts.length > 0
        ? numericAmounts.reduce((total, amount) => total + amount, 0)
        : undefined,
    ],
    ["examples", examples],
  ]);
}

function normalizeNamedCollection(items, dateField, limit = 5) {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  return {
    count: items.length,
    examples: items.slice(0, limit).map((item) =>
      compactObject([
        ["title", cleanString(item.title)],
        ["date", cleanDate(item[dateField])],
        ["governmentDepartment", cleanString(item.government_departments)],
        ["category", cleanString(item.category)],
      ]),
    ),
  };
}

function normalizePatents(items) {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  const uniqueItems = [];
  const seen = new Set();
  for (const item of items) {
    const key = `${cleanString(item.registration_number)}\u0000${cleanString(item.title)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueItems.push(item);
    if (uniqueItems.length === 3) break;
  }
  return {
    count: items.length,
    examples: uniqueItems.map((item) =>
      compactObject([
        ["title", cleanString(item.title)],
        ["registrationNumber", cleanString(item.registration_number)],
        ["applicationDate", cleanDate(item.application_date)],
        ["patentType", cleanString(item.patent_type)],
      ]),
    ),
  };
}

function normalizeFinance(finance) {
  if (!hasMeaningfulData(finance)) return undefined;
  const latest = Array.isArray(finance.management_index)
    ? finance.management_index[0]
    : null;
  const revenue =
    finiteNumber(latest?.net_sales_summary_of_business_results) ??
    finiteNumber(latest?.operating_revenue1_summary_of_business_results) ??
    finiteNumber(latest?.operating_revenue2_summary_of_business_results) ??
    finiteNumber(latest?.gross_operating_revenue_summary_of_business_results);
  const ordinaryIncome =
    finiteNumber(latest?.ordinary_income_summary_of_business_results) ??
    finiteNumber(latest?.ordinary_income_loss_summary_of_business_results);

  const latestPeriod = latest
    ? compactObject([
        ["period", cleanString(latest.period)],
        ["revenue", revenue],
        ["ordinaryIncome", ordinaryIncome],
        ["netIncome", finiteNumber(latest.net_income_loss_summary_of_business_results)],
        ["netAssets", finiteNumber(latest.net_assets_summary_of_business_results)],
        ["totalAssets", finiteNumber(latest.total_assets_summary_of_business_results)],
        ["employeeNumber", finiteNumber(latest.number_of_employees)],
      ])
    : undefined;

  return compactObject([
    ["accountingStandards", cleanString(finance.accounting_standards)],
    ["fiscalYear", cleanString(finance.fiscal_year_cover_page)],
    ["latestPeriod", latestPeriod],
  ]);
}

function normalizeWorkplaceInfo(workplaceInfo) {
  if (!hasMeaningfulData(workplaceInfo)) return undefined;
  const base = workplaceInfo.base_infos ?? {};
  const women = workplaceInfo.women_activity_infos ?? {};
  const leave = workplaceInfo.compatibility_of_childcare_and_work ?? {};
  return compactObject([
    [
      "averageContinuousServiceYears",
      finiteNumber(base.average_continuous_service_years),
    ],
    [
      "averageContinuousServiceYearsMale",
      finiteNumber(base.average_continuous_service_years_Male),
    ],
    [
      "averageContinuousServiceYearsFemale",
      finiteNumber(base.average_continuous_service_years_Female),
    ],
    ["averageAge", finiteNumber(base.average_age)],
    [
      "monthlyAverageOvertimeHours",
      finiteNumber(base.month_average_predetermined_overtime_hours),
    ],
    ["femaleWorkersProportion", finiteNumber(women.female_workers_proportion)],
    ["femaleManagerCount", finiteNumber(women.female_share_of_manager)],
    ["managerCount", finiteNumber(women.gender_total_of_manager)],
    ["femaleOfficerCount", finiteNumber(women.female_share_of_officers)],
    ["officerCount", finiteNumber(women.gender_total_of_officers)],
    ["paternityLeaveEligible", finiteNumber(leave.number_of_paternity_leave)],
    ["maternityLeaveEligible", finiteNumber(leave.number_of_maternity_leave)],
    [
      "paternityLeaveAcquisitionCount",
      finiteNumber(leave.paternity_leave_acquisition_num),
    ],
    [
      "maternityLeaveAcquisitionCount",
      finiteNumber(leave.maternity_leave_acquisition_num),
    ],
  ]);
}

function normalizeRecord(record) {
  const officialWebsiteUrl = cleanString(record.basicInfo?.companyUrl);
  const normalized = compactObject([
    [
      "officialWebsite",
      officialWebsiteUrl
        ? {
            label: `${cleanString(record.officialName) || cleanString(record.corporationName)} 公式サイト`,
            url: officialWebsiteUrl,
          }
        : undefined,
    ],
    ["businessSummary", cleanString(record.businessSummary)],
    ["employeeNumber", finiteNumber(record.employeeNumber)],
    ["capitalStock", finiteNumber(record.capitalStock)],
    ["establishmentDate", cleanString(record.establishmentDate)],
    ["representativeName", cleanString(record.representativeName)],
    ["subsidies", normalizeFinancialCollection(record.subsidies, "date_of_approval")],
    [
      "procurements",
      normalizeFinancialCollection(record.procurements, "date_of_order"),
    ],
    [
      "certifications",
      normalizeNamedCollection(record.certifications, "date_of_approval"),
    ],
    ["awards", normalizeNamedCollection(record.awards, "date_of_commendation")],
    ["patents", normalizePatents(record.patents)],
    ["finance", normalizeFinance(record.finance)],
    ["workplaceInfo", normalizeWorkplaceInfo(record.workplaceInfo)],
  ]);

  if (Object.keys(normalized).length === 0) return null;
  return {
    ...normalized,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    fetchedAt: record.fetchedAt,
  };
}

function applyEnrichment() {
  const candidate = readJson(candidatePath);
  const corporations = readJson(productionPath);
  if (!Array.isArray(candidate.records) || !Array.isArray(corporations)) {
    throw new Error("Candidate and production corporations must be arrays.");
  }

  const corporationsBySlug = new Map(
    corporations.map((corporation) => [corporation.slug, corporation]),
  );
  const operations = [];
  for (const record of candidate.records) {
    const corporation = corporationsBySlug.get(record.corporationSlug);
    if (!corporation) {
      throw new Error(`Candidate references unknown corporation: ${record.corporationSlug}`);
    }
    if (
      corporation.basicInfo?.corporateNumber &&
      corporation.basicInfo.corporateNumber !== record.corporateNumber
    ) {
      throw new Error(
        `Corporate number mismatch for ${record.corporationSlug}.`,
      );
    }
    const gbizInfo = normalizeRecord(record);
    operations.push([corporation, gbizInfo]);
  }

  const archiveDirectory = path.join(
    archiveRoot,
    `gbizinfo-enrichment-${timestamp()}`,
  );
  if (fs.existsSync(archiveDirectory)) {
    throw new Error(`Archive directory already exists: ${archiveDirectory}`);
  }
  fs.mkdirSync(archiveDirectory, { recursive: false });
  fs.copyFileSync(
    productionPath,
    path.join(archiveDirectory, "corporations.json"),
  );

  let appliedCount = 0;
  let clearedCount = 0;
  for (const [corporation, gbizInfo] of operations) {
    if (gbizInfo) {
      corporation.gbizInfo = gbizInfo;
      appliedCount += 1;
    } else if (corporation.gbizInfo !== undefined) {
      delete corporation.gbizInfo;
      clearedCount += 1;
    }
  }

  fs.writeFileSync(
    productionPath,
    `${JSON.stringify(corporations, null, 2)}\n`,
    "utf8",
  );

  console.log("gBizINFO enrichment applied.");
  console.log(`- production corporations: ${corporations.length}`);
  console.log(`- candidate records: ${candidate.records.length}`);
  console.log(`- applied records: ${appliedCount}`);
  console.log(`- cleared stale records: ${clearedCount}`);
  console.log(`- skipped empty records: ${candidate.records.length - appliedCount}`);
  console.log(`- archive: ${path.relative(process.cwd(), archiveDirectory)}`);
}

try {
  applyEnrichment();
} catch (error) {
  console.error(`gBizINFO enrichment apply failed: ${error.message}`);
  process.exitCode = 1;
}
})();
