(() => {
const fs = require("node:fs");
const path = require("node:path");

const productionPath = path.join(
  process.cwd(),
  "data",
  "production",
  "corporations.json",
);
const candidatePath = path.join(
  process.cwd(),
  "data",
  "draft",
  "gbizinfo-enrichment-candidate",
  "corporations.json",
);
const metaPath = path.join(
  process.cwd(),
  "data",
  "production",
  "meta.json",
);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function hasMeaningfulData(value) {
  if (Array.isArray(value)) return value.some(hasMeaningfulData);
  if (value && typeof value === "object") {
    return Object.values(value).some(hasMeaningfulData);
  }
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
}

function hasInvalidText(value) {
  return (
    typeof value === "string" &&
    (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]/.test(value) ||
      value.trim() !== value)
  );
}

function walkStrings(value, prefix, errors) {
  if (typeof value === "string") {
    if (hasInvalidText(value)) errors.push(`${prefix} contains invalid text.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, `${prefix}[${index}]`, errors));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) =>
      walkStrings(child, `${prefix}.${key}`, errors),
    );
  }
}

function validateCollection(collection, prefix, errors, maxExamples) {
  if (collection === undefined) return;
  if (!collection || typeof collection !== "object" || Array.isArray(collection)) {
    errors.push(`${prefix} must be an object.`);
    return;
  }
  if (!Number.isInteger(collection.count) || collection.count <= 0) {
    errors.push(`${prefix}.count must be a positive integer.`);
  }
  if (!Array.isArray(collection.examples) || collection.examples.length === 0) {
    errors.push(`${prefix}.examples must be a non-empty array.`);
  } else if (collection.examples.length > maxExamples) {
    errors.push(`${prefix}.examples must contain at most ${maxExamples} items.`);
  }
}

function validate() {
  const errors = [];
  const corporations = JSON.parse(fs.readFileSync(productionPath, "utf8"));
  const candidate = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  if (!Array.isArray(corporations)) return ["Production corporations must be an array."];
  if (!Array.isArray(candidate.records)) return ["Candidate records must be an array."];

  const candidateBySlug = new Map(
    candidate.records.map((record) => [record.corporationSlug, record]),
  );
  const corporationsBySlug = new Map(
    corporations.map((corporation) => [corporation.slug, corporation]),
  );
  const expectedProductionCount = meta.corporationCount;
  if (corporations.length !== expectedProductionCount) {
    errors.push(
      `Production corporation count (${corporations.length}) must remain ${expectedProductionCount}.`,
    );
  }

  let gbizInfoCount = 0;
  corporations.forEach((corporation, index) => {
    const prefix = `corporations[${index}]`;
    if (corporation.basicInfo !== undefined) {
      if (!isNonEmptyString(corporation.basicInfo?.corporateNumber)) {
        errors.push(`${prefix}.basicInfo.corporateNumber is required.`);
      }
    }
    if (corporation.gbizInfo === undefined) return;

    gbizInfoCount += 1;
    const gbizInfo = corporation.gbizInfo;
    const candidateRecord = candidateBySlug.get(corporation.slug);
    if (
      candidateRecord &&
      corporation.basicInfo?.corporateNumber &&
      corporation.basicInfo.corporateNumber !== candidateRecord.corporateNumber
    ) {
      errors.push(`${prefix}.basicInfo corporate number no longer matches candidate.`);
    }

    for (const field of ["sourceName", "sourceUrl", "fetchedAt"]) {
      if (!isNonEmptyString(gbizInfo[field])) {
        errors.push(`${prefix}.gbizInfo.${field} is required.`);
      }
    }
    if (gbizInfo.officialWebsite !== undefined) {
      if (
        !isNonEmptyString(gbizInfo.officialWebsite?.label) ||
        !/^https?:\/\//.test(gbizInfo.officialWebsite?.url ?? "")
      ) {
        errors.push(`${prefix}.gbizInfo.officialWebsite must contain a label and HTTP(S) URL.`);
      }
    }
    if (gbizInfo.sourceName !== "gBizINFO") {
      errors.push(`${prefix}.gbizInfo.sourceName must be gBizINFO.`);
    }
    if (!gbizInfo.sourceUrl?.includes("info.gbiz.go.jp/")) {
      errors.push(`${prefix}.gbizInfo.sourceUrl must link to gBizINFO.`);
    }

    for (const field of ["employeeNumber", "capitalStock"]) {
      if (gbizInfo[field] !== undefined && !isFiniteNumber(gbizInfo[field])) {
        errors.push(`${prefix}.gbizInfo.${field} must be a number.`);
      }
    }
    for (const field of [
      "businessSummary",
      "establishmentDate",
      "representativeName",
    ]) {
      if (gbizInfo[field] !== undefined && !isNonEmptyString(gbizInfo[field])) {
        errors.push(`${prefix}.gbizInfo.${field} must be a non-empty string.`);
      }
    }

    validateCollection(gbizInfo.subsidies, `${prefix}.gbizInfo.subsidies`, errors, 3);
    validateCollection(
      gbizInfo.procurements,
      `${prefix}.gbizInfo.procurements`,
      errors,
      3,
    );
    validateCollection(
      gbizInfo.certifications,
      `${prefix}.gbizInfo.certifications`,
      errors,
      5,
    );
    validateCollection(gbizInfo.awards, `${prefix}.gbizInfo.awards`, errors, 5);
    validateCollection(gbizInfo.patents, `${prefix}.gbizInfo.patents`, errors, 3);

    for (const field of ["subsidies", "procurements"]) {
      const collection = gbizInfo[field];
      if (collection?.totalAmount !== undefined && !isFiniteNumber(collection.totalAmount)) {
        errors.push(`${prefix}.gbizInfo.${field}.totalAmount must be a number.`);
      }
      for (const [exampleIndex, example] of (collection?.examples ?? []).entries()) {
        if (example.amount !== undefined && !isFiniteNumber(example.amount)) {
          errors.push(
            `${prefix}.gbizInfo.${field}.examples[${exampleIndex}].amount must be a number.`,
          );
        }
      }
    }

    for (const field of ["finance", "workplaceInfo"]) {
      if (
        gbizInfo[field] !== undefined &&
        (!gbizInfo[field] ||
          typeof gbizInfo[field] !== "object" ||
          Array.isArray(gbizInfo[field]) ||
          Object.keys(gbizInfo[field]).length === 0)
      ) {
        errors.push(`${prefix}.gbizInfo.${field} must be a non-empty object.`);
      }
    }
    walkStrings(gbizInfo, `${prefix}.gbizInfo`, errors);
  });

  candidate.records.forEach((record, index) => {
    const corporation = corporationsBySlug.get(record.corporationSlug);
    if (!corporation) {
      errors.push(`candidate.records[${index}] references an unknown production corporation.`);
      return;
    }
    if (
      corporation.basicInfo?.corporateNumber !== record.corporateNumber
    ) {
      errors.push(
        `candidate.records[${index}] basicInfo was removed or its corporate number changed.`,
      );
    }
  });

  const expectedGbizInfoCount = candidate.records.filter((record) =>
    hasMeaningfulData({
      businessSummary: record.businessSummary,
      employeeNumber: record.employeeNumber,
      capitalStock: record.capitalStock,
      establishmentDate: record.establishmentDate,
      representativeName: record.representativeName,
      certifications: record.certifications,
      awards: record.awards,
      finance: record.finance,
      patents: record.patents,
      procurements: record.procurements,
      subsidies: record.subsidies,
      workplaceInfo: record.workplaceInfo,
    }),
  ).length;
  if (gbizInfoCount < expectedGbizInfoCount) {
    errors.push(
      `Expected at least ${expectedGbizInfoCount} corporations with gbizInfo, found ${gbizInfoCount}.`,
    );
  }
  return errors;
}

try {
  const errors = validate();
  if (errors.length > 0) {
    console.error(
      `gBizINFO production validation failed with ${errors.length} error(s):`,
    );
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log("gBizINFO production validation passed.");
  }
} catch (error) {
  console.error(`gBizINFO production validation failed: ${error.message}`);
  process.exitCode = 1;
}
})();
