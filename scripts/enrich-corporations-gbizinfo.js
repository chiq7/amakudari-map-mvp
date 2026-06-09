(() => {
const fs = require("node:fs");
const path = require("node:path");

const API_TOKEN_ENV = "GBIZINFO_API_TOKEN";
const API_BASE_URL = "https://api.info.gbiz.go.jp/hojin/v2/hojin";
const SOURCE_NAME = "gBizINFO";
const RECORD_FIELDS = [
  "corporateNumber",
  "corporationSlug",
  "corporationName",
  "officialName",
  "subsidies",
  "procurements",
  "certifications",
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

function normalizeSubsidy(item) {
  return {
    title: item.title ?? "",
    amount: item.amount ?? "",
    dateOfApproval: item.date_of_approval ?? "",
    governmentDepartments: item.government_departments ?? "",
    target: item.target ?? "",
  };
}

function normalizeProcurement(item) {
  return {
    title: item.title ?? "",
    amount: item.amount ?? null,
    dateOfOrder: item.date_of_order ?? "",
    governmentDepartments: item.government_departments ?? "",
    note: item.note ?? "",
  };
}

function normalizeCertification(item) {
  return {
    title: item.title ?? "",
    category: item.category ?? "",
    dateOfApproval: item.date_of_approval ?? "",
    governmentDepartments: item.government_departments ?? "",
    target: item.target ?? "",
  };
}

async function fetchCorporation(corporation, apiToken) {
  const corporateNumber = corporation.basicInfo.corporateNumber;
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(corporateNumber)}`,
    {
      headers: {
        "X-hojinInfo-api-token": apiToken,
        accept: "application/json",
        "user-agent": "amakudari-map-mvp/1.0",
      },
    },
  );
  if (response.status === 401 || response.status === 403) {
    throw new Error(
      `gBizINFO rejected ${API_TOKEN_ENV}. Check the API token and its validity.`,
    );
  }
  if (!response.ok) {
    throw new Error(
      `gBizINFO returned HTTP ${response.status} for corporate number ${corporateNumber}.`,
    );
  }

  const payload = await response.json();
  const apiErrors = Array.isArray(payload.errors) ? payload.errors : [];
  if (apiErrors.length > 0) {
    throw new Error(
      `gBizINFO returned an API error for corporate number ${corporateNumber}: ${JSON.stringify(apiErrors)}`,
    );
  }

  const info = Array.isArray(payload["hojin-infos"])
    ? payload["hojin-infos"][0]
    : null;
  const fetchedAt = new Date().toISOString();
  const notes = [];
  if (!info) {
    notes.push("gBizINFOに当該法人番号の法人活動情報がありませんでした。");
  }
  notes.push(
    "gBizINFO v2には独立した許認可項目がないため、届出・認定情報はcertificationsに保存し、licensesは空配列としています。",
  );

  return {
    corporateNumber,
    corporationSlug: corporation.slug,
    corporationName: corporation.name,
    officialName: info?.name ?? corporation.basicInfo.officialName,
    subsidies: (info?.subsidy ?? []).map(normalizeSubsidy),
    procurements: (info?.procurement ?? []).map(normalizeProcurement),
    certifications: (info?.certification ?? []).map(normalizeCertification),
    licenses: [],
    sourceName: SOURCE_NAME,
    sourceUrl: `https://info.gbiz.go.jp/hojin/ichiran?hojinBango=${corporateNumber}`,
    fetchedAt,
    notes,
  };
}

function writeOutput(records, eligibleCount) {
  const fetchedAt = new Date().toISOString();
  const output = {
    sourceType: "gbizinfo-api-v2",
    status: "draft",
    createdAt: fetchedAt.slice(0, 10),
    fetchedAt,
    apiVersion: "v2",
    eligibleCorporationCount: eligibleCount,
    targetCount: records.length,
    processedCount: records.length,
    recordFields: RECORD_FIELDS,
    summary: {
      corporationsWithSubsidies: records.filter(
        (record) => record.subsidies.length > 0,
      ).length,
      corporationsWithProcurements: records.filter(
        (record) => record.procurements.length > 0,
      ).length,
      corporationsWithCertifications: records.filter(
        (record) => record.certifications.length > 0,
      ).length,
      subsidyCount: records.reduce(
        (count, record) => count + record.subsidies.length,
        0,
      ),
      procurementCount: records.reduce(
        (count, record) => count + record.procurements.length,
        0,
      ),
      certificationCount: records.reduce(
        (count, record) => count + record.certifications.length,
        0,
      ),
      licenseCount: 0,
    },
    records,
  };
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const apiToken = process.env[API_TOKEN_ENV]?.trim();
  if (!apiToken) {
    throw new Error(
      `${API_TOKEN_ENV} is not set. Obtain a gBizINFO REST API token, set it in the environment, and rerun npm run enrich:gbizinfo.`,
    );
  }

  const eligibleCorporations = readEligibleCorporations();
  const targetCorporations =
    options.limit === null
      ? eligibleCorporations
      : eligibleCorporations.slice(0, options.limit);
  const records = [];

  for (let index = 0; index < targetCorporations.length; index += 1) {
    const corporation = targetCorporations[index];
    records.push(await fetchCorporation(corporation, apiToken));
    console.log(
      `[${index + 1}/${targetCorporations.length}] ${corporation.name}`,
    );
    if (index + 1 < targetCorporations.length && options.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }

  writeOutput(records, eligibleCorporations.length);
  console.log("gBizINFO enrichment candidate generated.");
  console.log(`- eligible corporations: ${eligibleCorporations.length}`);
  console.log(`- processed corporations: ${records.length}`);
  console.log(`- output: ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(`gBizINFO enrichment failed: ${error.message}`);
  process.exitCode = 1;
});
})();
