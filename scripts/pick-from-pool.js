(() => {
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_COUNT = 20;

function parseArguments(argv) {
  const options = {
    count: DEFAULT_COUNT,
    pool: path.join("data", "pool", "unreleased_records.json"),
    output: path.join("data", "draft", "pending", "daily-pick.json"),
  };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--count") {
      options.count = Number(argv[index + 1]);
      index += 1;
    } else if (argv[index] === "--pool") {
      options.pool = argv[index + 1];
      index += 1;
    } else if (argv[index] === "--output") {
      options.output = argv[index + 1];
      index += 1;
    } else if (argv[index] === "--dry-run") {
      options.dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  if (!Number.isInteger(options.count) || options.count < 1) {
    throw new Error("--count must be a positive integer.");
  }
  return options;
}

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

function setGithubOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`, "utf8");
}

function pickFromPool(options) {
  const root = process.cwd();
  const poolPath = path.resolve(options.pool);
  const outputPath = path.resolve(options.output);
  const pool = readJson(poolPath);
  const productionRecords = readJson(
    path.join(root, "data", "production", "records.json"),
  );
  const productionRawIds = new Set(
    productionRecords.map((record) => record.rawId),
  );
  const productionDedupeKeys = new Set(
    productionRecords.map((record) => record.dedupeKey),
  );

  const eligible = [];
  let productionDuplicateCount = 0;
  for (const record of pool.records ?? []) {
    if (
      productionRawIds.has(record.rawId) ||
      productionDedupeKeys.has(record.dedupeKey)
    ) {
      productionDuplicateCount += 1;
      continue;
    }
    eligible.push(record);
  }

  const picked = eligible.slice(0, options.count);
  setGithubOutput("picked_count", picked.length);
  if (picked.length === 0) {
    console.log("追加対象なし");
    return;
  }

  const pickedRawIds = new Set(picked.map((record) => record.rawId));
  const pickedSourceIds = new Set(picked.map((record) => record.sourceId));
  const document = {
    sourceType: "cabinet-office-pool-pick",
    status: "draft",
    createdAt: isoDate(),
    limit: picked.length,
    sources: (pool.sources ?? []).filter((source) =>
      pickedSourceIds.has(source.id),
    ),
    records: picked,
  };
  writeJson(outputPath, document);

  if (!options.dryRun) {
    const remainingRecords = eligible.filter(
      (record) => !pickedRawIds.has(record.rawId),
    );
    writeJson(poolPath, {
      ...pool,
      productionDuplicateCount:
        (pool.productionDuplicateCount ?? 0) + productionDuplicateCount,
      remainingCount: remainingRecords.length,
      records: remainingRecords,
    });
  }

  console.log(`Picked ${picked.length} record(s) from the pool.`);
  console.log(`- production duplicates skipped: ${productionDuplicateCount}`);
  console.log(`- remaining records: ${eligible.length - picked.length}`);
  console.log(`- output: ${path.relative(root, outputPath)}`);
  if (options.dryRun) console.log("- dry run: pool was not modified");
}

try {
  pickFromPool(parseArguments(process.argv.slice(2)));
} catch (error) {
  console.error(`Pool pick failed: ${error.message}`);
  process.exitCode = 1;
}
})();
