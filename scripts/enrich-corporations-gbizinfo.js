(() => {
const fs = require("node:fs");
const path = require("node:path");

const API_TOKEN_ENV = "GBIZINFO_API_TOKEN";
const API_BASE_URL = "https://api.info.gbiz.go.jp/hojin/v2/hojin";
const SOURCE_NAME = "gBizINFO";
const CHILD_ENDPOINTS = [
  ["certification", "certification"],
  ["commendation", "commendation"],
  ["finance", "finance"],
  ["patent", "patent"],
  ["procurement", "procurement"],
  ["subsidy", "subsidy"],
  ["workplace", "workplace_info"],
];
const RECORD_FIELDS = [
  "corporateNumber",
  "corporationSlug",
  "corporationName",
  "officialName",
  "basicInfo",
  "businessSummary",
  "employeeNumber",
  "capitalStock",
  "establishmentDate",
  "representativeName",
  "workplaceInfo",
  "certifications",
  "awards",
  "finance",
  "patents",
  "procurements",
  "subsidies",
  "licenses",
  "sourceName",
  "sourceUrl",
  "fetchedAt",
  "notes",
];
const OUTPUT_PATH = path.join(
  process.cwd(),
  "data",
  "draft",
  "gbizinfo-enrichment-candidate",
  "corporations.json",
);
const DEBUG_OUTPUT_PATH = path.join(
  process.cwd(),
  "data",
  "draft",
  "gbizinfo-debug",
  "response-structure.json",
);
const DEBUG_CORPORATION_NAMES = [
  "日本郵政株式会社",
  "一般財団法人日本木材総合情報センター",
  "国立研究開発法人建築研究所",
];

function parseArguments(argv) {
  const options = { limit: null, delayMs: 100 };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--limit") {
      options.limit = Number(argv[index + 1]);
      index += 1;
    } else if (argument === "--delay-ms") {
      options.delayMs = Number(argv[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (
    options.limit !== null &&
    (!Number.isInteger(options.limit) || options.limit <= 0)
  ) {
    throw new Error("--limit must be a positive integer.");
  }
  if (!Number.isInteger(options.delayMs) || options.delayMs < 0) {
    throw new Error("--delay-ms must be a non-negative integer.");
  }
  return options;
}

function readApiToken() {
  const environmentToken = process.env[API_TOKEN_ENV]?.trim();
  if (environmentToken) return environmentToken;

  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envLocalPath)) return "";
  const lines = fs
    .readFileSync(envLocalPath, "utf8")
    .split(/\r?\n/)
    .filter((candidate) =>
      candidate.match(new RegExp(`^\\s*${API_TOKEN_ENV}\\s*=`)),
    );
  const line = lines.at(-1);
  if (!line) return "";
  return line
    .slice(line.indexOf("=") + 1)
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2");
}

function readEligibleCorporations() {
  const corporations = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "data", "production", "corporations.json"),
      "utf8",
    ),
  );
  return corporations.filter((corporation) =>
    /^\d{13}$/.test(corporation.basicInfo?.corporateNumber ?? ""),
  );
}

function sanitizeApiData(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeApiData);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "meta-data")
        .map(([key, child]) => [key, sanitizeApiData(child)]),
    );
  }
  return value;
}

function summarizeField(key, value) {
  const type = Array.isArray(value)
    ? "array"
    : value === null
      ? "null"
      : typeof value;
  const summary = { key, type };
  if (Array.isArray(value)) {
    summary.arrayLength = value.length;
    summary.sampleValueType =
      value.length === 0
        ? "empty"
        : Array.isArray(value[0])
          ? "array"
          : value[0] === null
            ? "null"
            : typeof value[0];
    summary.nestedKeys =
      value[0] && typeof value[0] === "object" && !Array.isArray(value[0])
        ? Object.keys(value[0]).sort()
        : [];
  } else if (value && typeof value === "object") {
    summary.nestedKeys = Object.keys(value).sort();
  }
  return summary;
}

function summarizePayload(endpoint, payload) {
  const infos = Array.isArray(payload?.["hojin-infos"])
    ? payload["hojin-infos"]
    : [];
  const info = infos[0] ?? {};
  return {
    endpoint,
    topLevelKeys: Object.keys(payload ?? {}).sort(),
    hojinInfoCount: infos.length,
    nestedKeys: Object.keys(info).sort(),
    fields: Object.entries(info)
      .map(([key, value]) => summarizeField(key, value))
      .sort((left, right) => left.key.localeCompare(right.key)),
  };
}

async function fetchPayload(corporateNumber, apiToken, suffix = "") {
  const endpoint = suffix
    ? `${API_BASE_URL}/${encodeURIComponent(corporateNumber)}/${suffix}`
    : `${API_BASE_URL}/${encodeURIComponent(corporateNumber)}`;
  const response = await fetch(endpoint, {
    headers: {
      "X-hojinInfo-api-token": apiToken,
      accept: "application/json",
      "user-agent": "amakudari-map-mvp/1.0",
    },
  });
  if (response.status === 401 || response.status === 403) {
    throw new Error(
      `gBizINFO rejected ${API_TOKEN_ENV}. Check the API token and its validity.`,
    );
  }
  if (!response.ok) {
    throw new Error(
      `gBizINFO returned HTTP ${response.status} for corporate number ${corporateNumber}${suffix ? ` (${suffix})` : ""}.`,
    );
  }
  const payload = await response.json();
  const apiErrors = Array.isArray(payload.errors) ? payload.errors : [];
  if (apiErrors.length > 0) {
    throw new Error(
      `gBizINFO returned an API error for corporate number ${corporateNumber}${suffix ? ` (${suffix})` : ""}.`,
    );
  }
  return payload;
}

function firstHojinInfo(payload) {
  return Array.isArray(payload?.["hojin-infos"])
    ? payload["hojin-infos"][0] ?? null
    : null;
}

async function fetchCorporation(corporation, apiToken, includeDebug) {
  const corporateNumber = corporation.basicInfo.corporateNumber;
  const basePayload = await fetchPayload(corporateNumber, apiToken);
  const baseInfo = firstHojinInfo(basePayload);
  const childData = {};
  const debugEndpoints = includeDebug
    ? [summarizePayload("corporation", basePayload)]
    : [];

  for (const [suffix, field] of CHILD_ENDPOINTS) {
    const payload = await fetchPayload(corporateNumber, apiToken, suffix);
    const info = firstHojinInfo(payload);
    childData[field] = sanitizeApiData(info?.[field] ?? null);
    if (includeDebug) {
      debugEndpoints.push(summarizePayload(suffix, payload));
    }
  }

  const fetchedAt = new Date().toISOString();
  const notes = [];
  if (!baseInfo) {
    notes.push("gBizINFOに当該法人番号の法人基本情報がありませんでした。");
  }
  notes.push(
    "gBizINFO v2には独立した許認可項目がないため、届出・認定情報はcertificationsに保存し、licensesは空配列としています。",
  );

  return {
    record: {
      corporateNumber,
      corporationSlug: corporation.slug,
      corporationName: corporation.name,
      officialName: baseInfo?.name ?? corporation.basicInfo.officialName,
      basicInfo: baseInfo
        ? {
            name: baseInfo.name ?? "",
            nameEn: baseInfo.name_en ?? "",
            kana: baseInfo.kana ?? "",
            location: baseInfo.location ?? "",
            postalCode: baseInfo.postal_code ?? "",
            kind: baseInfo.kind ?? "",
            status: baseInfo.status ?? "",
            companyUrl: baseInfo.company_url ?? "",
            industry: baseInfo.industry ?? [],
            businessItems: baseInfo.business_items ?? [],
            qualificationGrade: baseInfo.qualification_grade ?? "",
            foundingYear: baseInfo.founding_year ?? null,
          }
        : null,
      businessSummary: baseInfo?.business_summary ?? "",
      employeeNumber: baseInfo?.employee_number ?? null,
      capitalStock: baseInfo?.capital_stock ?? null,
      establishmentDate: baseInfo?.date_of_establishment ?? "",
      representativeName: baseInfo?.representative_name ?? "",
      workplaceInfo: childData.workplace_info ?? null,
      certifications: Array.isArray(childData.certification)
        ? childData.certification
        : [],
      awards: Array.isArray(childData.commendation)
        ? childData.commendation
        : [],
      finance: childData.finance ?? null,
      patents: Array.isArray(childData.patent) ? childData.patent : [],
      procurements: Array.isArray(childData.procurement)
        ? childData.procurement
        : [],
      subsidies: Array.isArray(childData.subsidy) ? childData.subsidy : [],
      licenses: [],
      sourceName: SOURCE_NAME,
      sourceUrl: `https://info.gbiz.go.jp/hojin/ichiran?hojinBango=${corporateNumber}`,
      fetchedAt,
      notes,
    },
    debug: includeDebug
      ? {
          corporationSlug: corporation.slug,
          corporationName: corporation.name,
          corporateNumber,
          endpoints: debugEndpoints,
        }
      : null,
  };
}

function hasMeaningfulData(value) {
  if (Array.isArray(value)) {
    return value.some(hasMeaningfulData);
  }
  if (value && typeof value === "object") {
    return Object.values(value).some(hasMeaningfulData);
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

function hasBasicInfo(record) {
  return hasMeaningfulData(record.basicInfo);
}

function hasUsefulData(record) {
  return Boolean(
    hasBasicInfo(record) ||
      record.businessSummary ||
      record.employeeNumber !== null ||
      record.capitalStock !== null ||
      record.establishmentDate ||
      record.certifications.length ||
      record.awards.length ||
      hasMeaningfulData(record.finance) ||
      record.patents.length ||
      record.procurements.length ||
      record.subsidies.length ||
      hasMeaningfulData(record.workplaceInfo),
  );
}

function createSummary(records) {
  return {
    total: records.length,
    basicInfoCount: records.filter(hasBasicInfo).length,
    businessSummaryCount: records.filter((record) => record.businessSummary)
      .length,
    employeeNumberCount: records.filter(
      (record) => record.employeeNumber !== null,
    ).length,
    capitalStockCount: records.filter(
      (record) => record.capitalStock !== null,
    ).length,
    establishmentDateCount: records.filter(
      (record) => record.establishmentDate,
    ).length,
    certificationCorporationCount: records.filter(
      (record) => record.certifications.length > 0,
    ).length,
    awardCorporationCount: records.filter(
      (record) => record.awards.length > 0,
    ).length,
    financeCorporationCount: records.filter((record) =>
      hasMeaningfulData(record.finance),
    ).length,
    patentCorporationCount: records.filter(
      (record) => record.patents.length > 0,
    ).length,
    procurementCorporationCount: records.filter(
      (record) => record.procurements.length > 0,
    ).length,
    subsidyCorporationCount: records.filter(
      (record) => record.subsidies.length > 0,
    ).length,
    workplaceInfoCount: records.filter((record) =>
      hasMeaningfulData(record.workplaceInfo),
    ).length,
    noUsefulDataCount: records.filter((record) => !hasUsefulData(record))
      .length,
    certificationCount: records.reduce(
      (count, record) => count + record.certifications.length,
      0,
    ),
    awardCount: records.reduce(
      (count, record) => count + record.awards.length,
      0,
    ),
    patentCount: records.reduce(
      (count, record) => count + record.patents.length,
      0,
    ),
    procurementCount: records.reduce(
      (count, record) => count + record.procurements.length,
      0,
    ),
    subsidyCount: records.reduce(
      (count, record) => count + record.subsidies.length,
      0,
    ),
    licenseCount: 0,
  };
}

function writeOutput(records, eligibleCount, debugRecords) {
  const fetchedAt = new Date().toISOString();
  const output = {
    sourceType: "gbizinfo-api-v2",
    schemaVersion: 2,
    status: "draft",
    createdAt: fetchedAt.slice(0, 10),
    fetchedAt,
    apiVersion: "v2",
    eligibleCorporationCount: eligibleCount,
    targetCount: records.length,
    processedCount: records.length,
    recordFields: RECORD_FIELDS,
    summary: createSummary(records),
    records,
  };
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  const debugOutput = {
    sourceType: "gbizinfo-api-v2-response-structure",
    createdAt: fetchedAt,
    valuePolicy:
      "API values are omitted. This file contains keys, value types, and array lengths only.",
    corporations: debugRecords,
  };
  fs.mkdirSync(path.dirname(DEBUG_OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(
    DEBUG_OUTPUT_PATH,
    `${JSON.stringify(debugOutput, null, 2)}\n`,
    "utf8",
  );
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const apiToken = readApiToken();
  if (!apiToken) {
    throw new Error(
      `${API_TOKEN_ENV} is not set. Set the gBizINFO REST API token in the current environment and rerun npm run enrich:gbizinfo.`,
    );
  }

  const eligibleCorporations = readEligibleCorporations();
  const targetCorporations =
    options.limit === null
      ? eligibleCorporations
      : eligibleCorporations.slice(0, options.limit);
  const debugNames = new Set(DEBUG_CORPORATION_NAMES);
  const records = [];
  const debugRecords = [];

  for (let index = 0; index < targetCorporations.length; index += 1) {
    const corporation = targetCorporations[index];
    const result = await fetchCorporation(
      corporation,
      apiToken,
      debugNames.has(corporation.name),
    );
    records.push(result.record);
    if (result.debug) debugRecords.push(result.debug);
    console.log(
      `[${index + 1}/${targetCorporations.length}] ${corporation.name}`,
    );
    if (index + 1 < targetCorporations.length && options.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }

  writeOutput(records, eligibleCorporations.length, debugRecords);
  const summary = createSummary(records);
  console.log("gBizINFO enrichment candidate generated.");
  console.log(`- eligible corporations: ${eligibleCorporations.length}`);
  console.log(`- processed corporations: ${records.length}`);
  console.log(`- useful data corporations: ${records.length - summary.noUsefulDataCount}`);
  console.log(`- output: ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  console.log(`- debug: ${path.relative(process.cwd(), DEBUG_OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(`gBizINFO enrichment failed: ${error.message}`);
  process.exitCode = 1;
});
})();
