(() => {
const fs = require("node:fs");
const path = require("node:path");

const FILE_NAMES = [
  "records.json",
  "persons.json",
  "corporations.json",
  "rankings.json",
  "meta.json",
];
const SOURCE = {
  id: "cabinet-office-annual-2024",
  title: "国家公務員の再就職状況の公表（令和6年度分）",
  publisher: "内閣官房",
  url: "https://www.cas.go.jp/jp/gaiyou/jimu/jinjikyoku/106-25-2/r07/files/siryou1-1_20250926.xlsx",
  publishedAt: "2025-09-26",
  memo: "国家公務員法第106条の25第2項等に基づく年度公表資料",
};
const EXPECTED_RECORD_COUNT = 117;

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

function assertCandidate(candidateDirectory) {
  for (const fileName of FILE_NAMES) {
    const filePath = path.join(candidateDirectory, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Candidate file is missing: ${filePath}`);
    }
    readJson(filePath);
  }

  const records = readJson(path.join(candidateDirectory, "records.json"));
  const persons = readJson(path.join(candidateDirectory, "persons.json"));
  const corporations = readJson(
    path.join(candidateDirectory, "corporations.json"),
  );
  const rankings = readJson(path.join(candidateDirectory, "rankings.json"));
  const meta = readJson(path.join(candidateDirectory, "meta.json"));

  if (!Array.isArray(records) || records.length !== EXPECTED_RECORD_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_RECORD_COUNT} candidate records, found ${
        Array.isArray(records) ? records.length : "non-array"
      }.`,
    );
  }
  if (!Array.isArray(persons) || persons.length === 0) {
    throw new Error("Candidate persons.json must contain a non-empty array.");
  }
  if (!Array.isArray(corporations) || corporations.length === 0) {
    throw new Error(
      "Candidate corporations.json must contain a non-empty array.",
    );
  }
  if (Object.keys(rankings?.rankings ?? {}).length !== 4) {
    throw new Error("Candidate rankings.json must contain 4 ranking groups.");
  }
  if (
    meta.productionRecordCount !== records.length ||
    meta.personCount !== persons.length ||
    meta.corporationCount !== corporations.length
  ) {
    throw new Error("Candidate meta counts do not match candidate data.");
  }

  return {
    records: records.length,
    persons: persons.length,
    corporations: corporations.length,
    rankingGroups: Object.keys(rankings.rankings).length,
  };
}

function applyCandidate() {
  const rootDirectory = process.cwd();
  const candidateDirectory = path.join(
    rootDirectory,
    "data",
    "draft",
    "production-candidate",
  );
  const productionDirectory = path.join(rootDirectory, "data", "production");
  const archiveDirectory = path.join(
    rootDirectory,
    "data",
    "archive",
    `production-${timestamp()}`,
  );

  const counts = assertCandidate(candidateDirectory);

  for (const fileName of FILE_NAMES) {
    const productionPath = path.join(productionDirectory, fileName);
    if (!fs.existsSync(productionPath)) {
      throw new Error(`Production file is missing: ${productionPath}`);
    }
    readJson(productionPath);
  }
  const sourcesPath = path.join(productionDirectory, "sources.json");
  if (!fs.existsSync(sourcesPath)) {
    throw new Error(`Production file is missing: ${sourcesPath}`);
  }
  const sources = readJson(sourcesPath);
  if (!Array.isArray(sources)) {
    throw new Error("Production sources.json must contain an array.");
  }

  fs.mkdirSync(archiveDirectory, { recursive: false });
  for (const fileName of [...FILE_NAMES, "sources.json"]) {
    fs.copyFileSync(
      path.join(productionDirectory, fileName),
      path.join(archiveDirectory, fileName),
    );
  }
  for (const fileName of FILE_NAMES) {
    fs.copyFileSync(
      path.join(candidateDirectory, fileName),
      path.join(productionDirectory, fileName),
    );
  }
  if (!sources.some((source) => source.id === SOURCE.id)) {
    sources.push(SOURCE);
  }
  fs.writeFileSync(
    sourcesPath,
    `${JSON.stringify(sources, null, 2)}\n`,
    "utf8",
  );

  console.log("Production candidate applied.");
  console.log(`- archive: ${path.relative(rootDirectory, archiveDirectory)}`);
  console.log(`- records: ${counts.records}`);
  console.log(`- persons: ${counts.persons}`);
  console.log(`- corporations: ${counts.corporations}`);
  console.log(`- ranking groups: ${counts.rankingGroups}`);
  console.log(`- source: ${SOURCE.id}`);
}

try {
  applyCandidate();
} catch (error) {
  console.error(`Production candidate apply failed: ${error.message}`);
  process.exitCode = 1;
}
})();
