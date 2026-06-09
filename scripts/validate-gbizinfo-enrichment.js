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
const expectedRecordFields = [
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

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validate() {
  const errors = [];
  const candidate = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
  const corporations = JSON.parse(fs.readFileSync(productionPath, "utf8"));
  const eligibleCorporations = corporations.filter((corporation) =>
    /^\d{13}$/.test(corporation.basicInfo?.corporateNumber ?? ""),
  );
  const eligibleByNumber = new Map(
    eligibleCorporations.map((corporation) => [
      corporation.basicInfo.corporateNumber,
      corporation,
    ]),
  );

  if (candidate.sourceType !== "gbizinfo-api-v2") {
    errors.push("sourceType must be gbizinfo-api-v2.");
  }
  if (!["awaiting-api-token", "draft"].includes(candidate.status)) {
    errors.push("status must be awaiting-api-token or draft.");
  }
  if (
    JSON.stringify(candidate.recordFields) !==
    JSON.stringify(expectedRecordFields)
  ) {
    errors.push("recordFields does not match the expected output format.");
  }
  if (candidate.eligibleCorporationCount !== eligibleCorporations.length) {
    errors.push(
      `eligibleCorporationCount must equal ${eligibleCorporations.length}.`,
    );
  }
  if (!Array.isArray(candidate.records)) {
    return [...errors, "records must contain an array."];
  }

  if (candidate.status === "awaiting-api-token") {
    if (candidate.records.length !== 0 || candidate.processedCount !== 0) {
      errors.push("awaiting-api-token candidates must not contain records.");
    }
  } else if (
    candidate.records.length !== candidate.processedCount ||
    candidate.records.length !== candidate.targetCount
  ) {
    errors.push("draft record, processed, and target counts must match.");
  }

  const seenCorporateNumbers = new Set();
  const seenSlugs = new Set();
  candidate.records.forEach((record, index) => {
    const prefix = `records[${index}]`;
    const productionCorporation = eligibleByNumber.get(record.corporateNumber);
    if (!productionCorporation) {
      errors.push(`${prefix}.corporateNumber is not eligible production data.`);
    } else if (productionCorporation.slug !== record.corporationSlug) {
      errors.push(`${prefix}.corporationSlug does not match production data.`);
    }
    if (seenCorporateNumbers.has(record.corporateNumber)) {
      errors.push(`${prefix}.corporateNumber is duplicated.`);
    }
    if (seenSlugs.has(record.corporationSlug)) {
      errors.push(`${prefix}.corporationSlug is duplicated.`);
    }
    seenCorporateNumbers.add(record.corporateNumber);
    seenSlugs.add(record.corporationSlug);

    for (const field of [
      "corporationSlug",
      "corporationName",
      "officialName",
      "sourceName",
      "sourceUrl",
      "fetchedAt",
    ]) {
      if (!isNonEmptyString(record[field])) {
        errors.push(`${prefix}.${field} is required.`);
      }
    }
    for (const field of [
      "subsidies",
      "procurements",
      "certifications",
      "licenses",
      "notes",
    ]) {
      if (!Array.isArray(record[field])) {
        errors.push(`${prefix}.${field} must be an array.`);
      }
    }
    if (record.sourceName !== "gBizINFO") {
      errors.push(`${prefix}.sourceName must be gBizINFO.`);
    }
    if (
      !record.sourceUrl?.includes(
        `hojinBango=${record.corporateNumber}`,
      )
    ) {
      errors.push(`${prefix}.sourceUrl must link to the corporate number.`);
    }
  });

  return errors;
}

try {
  const errors = validate();
  if (errors.length > 0) {
    console.error(
      `gBizINFO enrichment validation failed with ${errors.length} error(s):`,
    );
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log("gBizINFO enrichment validation passed.");
  }
} catch (error) {
  console.error(`gBizINFO enrichment validation failed: ${error.message}`);
  process.exitCode = 1;
}
})();
