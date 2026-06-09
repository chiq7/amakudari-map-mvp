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

function applyEnrichment() {
  const candidate = readJson(candidatePath);
  const corporations = readJson(productionPath);
  const highConfidence = candidate.records.filter(
    (record) => record.status === "high-confidence",
  );
  const corporationsBySlug = new Map(
    corporations.map((corporation) => [corporation.slug, corporation]),
  );
  const corporateNumbers = new Set();

  for (const record of highConfidence) {
    if (!corporationsBySlug.has(record.corporationSlug)) {
      throw new Error(
        `High-confidence candidate references unknown corporation: ${record.corporationSlug}`,
      );
    }
    if (!/^\d{13}$/.test(record.corporateNumber)) {
      throw new Error(
        `Invalid corporate number for ${record.corporationName}.`,
      );
    }
    if (corporateNumbers.has(record.corporateNumber)) {
      throw new Error(
        `Duplicate high-confidence corporate number: ${record.corporateNumber}`,
      );
    }
    corporateNumbers.add(record.corporateNumber);
  }

  const archiveDirectory = path.join(
    archiveRoot,
    `corporation-enrichment-${timestamp()}`,
  );
  if (fs.existsSync(archiveDirectory)) {
    throw new Error(`Archive directory already exists: ${archiveDirectory}`);
  }
  fs.mkdirSync(archiveDirectory, { recursive: false });
  fs.copyFileSync(
    productionPath,
    path.join(archiveDirectory, "corporations.json"),
  );

  for (const record of highConfidence) {
    const corporation = corporationsBySlug.get(record.corporationSlug);
    corporation.basicInfo = {
      corporateNumber: record.corporateNumber,
      officialName: record.officialName,
      registeredAddress: record.registeredAddress,
      prefecture: record.prefecture,
      city: record.city,
      sourceName: record.sourceName,
      sourceUrl: record.sourceUrl,
    };
  }

  fs.writeFileSync(
    productionPath,
    `${JSON.stringify(corporations, null, 2)}\n`,
    "utf8",
  );

  console.log("Corporation enrichment applied.");
  console.log(`- production corporations: ${corporations.length}`);
  console.log(`- applied high-confidence records: ${highConfidence.length}`);
  console.log(
    `- not applied: ${candidate.records.length - highConfidence.length}`,
  );
  console.log(
    `- archive: ${path.relative(process.cwd(), archiveDirectory)}`,
  );
}

try {
  applyEnrichment();
} catch (error) {
  console.error(`Corporation enrichment apply failed: ${error.message}`);
  process.exitCode = 1;
}
})();
