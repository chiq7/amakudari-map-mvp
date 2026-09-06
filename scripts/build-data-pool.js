(() => {
const fs = require("node:fs");
const path = require("node:path");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function isoDate(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function buildPool() {
  const root = process.cwd();
  const processedDirectory = path.join(root, "data", "pool", "processed");
  const outputPath = path.join(
    root,
    "data",
    "pool",
    "unreleased_records.json",
  );
  const productionRecords = readJson(
    path.join(root, "data", "production", "records.json"),
  );
  const productionRawIds = new Set(
    productionRecords.map((record) => record.rawId),
  );
  const productionDedupeKeys = new Set(
    productionRecords.map((record) => record.dedupeKey),
  );

  const processedFiles = fs
    .readdirSync(processedDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();
  if (processedFiles.length === 0) {
    throw new Error("No processed pool JSON files were found.");
  }

  const sourcesById = new Map();
  const records = [];
  let inputCount = 0;
  let productionDuplicateCount = 0;
  let poolDuplicateCount = 0;
  const seenRawIds = new Set();
  const seenDedupeKeys = new Set();

  for (const fileName of processedFiles) {
    const document = readJson(path.join(processedDirectory, fileName));
    for (const source of document.sources ?? []) {
      sourcesById.set(source.id, source);
    }
    for (const record of document.records ?? []) {
      inputCount += 1;
      if (
        productionRawIds.has(record.rawId) ||
        productionDedupeKeys.has(record.dedupeKey)
      ) {
        productionDuplicateCount += 1;
        continue;
      }
      if (
        seenRawIds.has(record.rawId) ||
        seenDedupeKeys.has(record.dedupeKey)
      ) {
        poolDuplicateCount += 1;
        continue;
      }
      seenRawIds.add(record.rawId);
      seenDedupeKeys.add(record.dedupeKey);
      records.push({
        ...record,
        // Excel imports use originMinistry, while production records use
        // fromMinistry. Keep the pool filterable without changing the
        // imported draft format consumed by the candidate generator.
        fromMinistry: record.fromMinistry ?? record.originMinistry ?? "",
      });
    }
  }

  const output = {
    sourceType: "cabinet-office-106-25-1-pool",
    status: "unreleased",
    createdAt: isoDate(),
    inputCount,
    productionDuplicateCount,
    poolDuplicateCount,
    remainingCount: records.length,
    sources: [...sourcesById.values()],
    records,
  };
  writeJson(outputPath, output);

  console.log("Data pool built.");
  console.log(`- processed files: ${processedFiles.length}`);
  console.log(`- input records: ${inputCount}`);
  console.log(`- production duplicates: ${productionDuplicateCount}`);
  console.log(`- pool duplicates: ${poolDuplicateCount}`);
  console.log(`- unreleased records: ${records.length}`);
  console.log(`- output: ${path.relative(root, outputPath)}`);
}

try {
  buildPool();
} catch (error) {
  console.error(`Data pool build failed: ${error.message}`);
  process.exitCode = 1;
}
})();
