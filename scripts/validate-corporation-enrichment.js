(() => {
const fs = require("node:fs");
const path = require("node:path");

const candidatePath = path.join(
  process.cwd(),
  "data",
  "draft",
  "corporation-enrichment-candidate",
  "corporations.json",
);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validate() {
  const errors = [];
  const production = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "data", "production", "corporations.json"),
      "utf8",
    ),
  );
  const candidate = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
  if (!Array.isArray(candidate.records)) {
    return ["records must contain an array."];
  }
  const productionSlugs = new Set(production.map((item) => item.slug));
  const seenSlugs = new Set();
  const seenCorporateNumbers = new Set();
  const validStatuses = new Set([
    "high-confidence",
    "ambiguous",
    "unmatched",
  ]);
  const validMatchedBy = new Set([
    "exact",
    "exact-multiple",
    "normalized",
    "normalized-multiple",
    "fuzzy",
    "corporate-number-conflict",
    "none",
  ]);

  candidate.records.forEach((record, index) => {
    const prefix = `records[${index}]`;
    if (!productionSlugs.has(record.corporationSlug)) {
      errors.push(`${prefix}.corporationSlug is unknown.`);
    }
    if (seenSlugs.has(record.corporationSlug)) {
      errors.push(`${prefix}.corporationSlug is duplicated.`);
    }
    seenSlugs.add(record.corporationSlug);
    if (!isNonEmptyString(record.corporationName)) {
      errors.push(`${prefix}.corporationName is required.`);
    }
    if (!validStatuses.has(record.status)) {
      errors.push(`${prefix}.status is invalid.`);
    }
    if (!validMatchedBy.has(record.matchedBy)) {
      errors.push(`${prefix}.matchedBy is invalid.`);
    }
    if (
      typeof record.matchConfidence !== "number" ||
      record.matchConfidence < 0 ||
      record.matchConfidence > 1
    ) {
      errors.push(`${prefix}.matchConfidence must be between 0 and 1.`);
    }
    if (!isNonEmptyString(record.sourceName) || !isNonEmptyString(record.sourceUrl)) {
      errors.push(`${prefix} source fields are required.`);
    }
    if (!Array.isArray(record.notes) || !Array.isArray(record.candidates)) {
      errors.push(`${prefix} notes and candidates must be arrays.`);
    }

    if (record.status === "high-confidence") {
      if (!/^\d{13}$/.test(record.corporateNumber)) {
        errors.push(`${prefix}.corporateNumber must contain 13 digits.`);
      }
      for (const field of [
        "officialName",
        "registeredAddress",
        "prefecture",
        "city",
      ]) {
        if (!isNonEmptyString(record[field])) {
          errors.push(`${prefix}.${field} is required for high-confidence matches.`);
        }
      }
      if (seenCorporateNumbers.has(record.corporateNumber)) {
        errors.push(`${prefix}.corporateNumber is duplicated.`);
      }
      seenCorporateNumbers.add(record.corporateNumber);
      if (!["exact", "normalized"].includes(record.matchedBy)) {
        errors.push(`${prefix} high-confidence match method is invalid.`);
      }
    } else if (record.corporateNumber) {
      errors.push(`${prefix} non-high-confidence records must not be auto-confirmed.`);
    }
  });

  const summary = candidate.summary ?? {};
  const expectedSummary = {
    targetCount: candidate.records.length,
    foundCount: candidate.records.filter((record) => record.candidateCount > 0)
      .length,
    highConfidenceCount: candidate.records.filter(
      (record) => record.status === "high-confidence",
    ).length,
    ambiguousCount: candidate.records.filter(
      (record) => record.status === "ambiguous",
    ).length,
    unmatchedCount: candidate.records.filter(
      (record) => record.status === "unmatched",
    ).length,
  };
  for (const [field, expected] of Object.entries(expectedSummary)) {
    if (summary[field] !== expected) {
      errors.push(`summary.${field} (${summary[field]}) must equal ${expected}.`);
    }
  }
  return errors;
}

try {
  const errors = validate();
  if (errors.length) {
    console.error(
      `Corporation enrichment validation failed with ${errors.length} error(s):`,
    );
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log("Corporation enrichment validation passed.");
  }
} catch (error) {
  console.error(`Corporation enrichment validation failed: ${error.message}`);
  process.exitCode = 1;
}
})();
