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
  const isCurrentSchema = candidate.schemaVersion === 2;
  if (!["awaiting-api-token", "draft"].includes(candidate.status)) {
    errors.push("status must be awaiting-api-token or draft.");
  }
  if (
    isCurrentSchema &&
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
      "certifications",
      "procurements",
      "subsidies",
      "licenses",
      "notes",
    ]) {
      if (!Array.isArray(record[field])) {
        errors.push(`${prefix}.${field} must be an array.`);
      }
    }
    if (!isCurrentSchema) return;
    for (const field of ["awards", "patents"]) {
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
    for (const field of ["employeeNumber", "capitalStock"]) {
      if (
        record[field] !== null &&
        (typeof record[field] !== "number" || !Number.isFinite(record[field]))
      ) {
        errors.push(`${prefix}.${field} must be a number or null.`);
      }
    }
    for (const field of [
      "businessSummary",
      "establishmentDate",
      "representativeName",
    ]) {
      if (typeof record[field] !== "string") {
        errors.push(`${prefix}.${field} must be a string.`);
      }
    }
    for (const field of ["basicInfo", "workplaceInfo", "finance"]) {
      if (
        record[field] !== null &&
        (typeof record[field] !== "object" || Array.isArray(record[field]))
      ) {
        errors.push(`${prefix}.${field} must be an object or null.`);
      }
    }
    if (record.licenses.length !== 0) {
      errors.push(`${prefix}.licenses must remain empty for gBizINFO v2.`);
    }
  });

  if (candidate.status === "draft" && isCurrentSchema) {
    const records = candidate.records;
    const hasMeaningfulData = (value) => {
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
    };
    const expectedSummary = {
      total: records.length,
      basicInfoCount: records.filter((record) =>
        hasMeaningfulData(record.basicInfo),
      ).length,
      businessSummaryCount: records.filter(
        (record) => record.businessSummary,
      ).length,
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
    };
    for (const [field, expected] of Object.entries(expectedSummary)) {
      if (candidate.summary?.[field] !== expected) {
        errors.push(`summary.${field} must equal ${expected}.`);
      }
    }
  }

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
