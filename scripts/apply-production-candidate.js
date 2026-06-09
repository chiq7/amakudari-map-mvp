(() => {
const fs = require("node:fs");
const path = require("node:path");

const FILE_NAMES = [
  "records.json",
  "persons.json",
  "corporations.json",
  "rankings.json",
  "meta.json",
  "sources.json",
];

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--archive-label") {
      options.archiveLabel = argv[index + 1];
      index += 1;
    } else if (argv[index] === "--candidate-dir") {
      options.candidateDirectory = argv[index + 1];
      index += 1;
    } else if (argv[index] === "--production-dir") {
      options.productionDirectory = argv[index + 1];
      index += 1;
    } else if (argv[index] === "--archive-root") {
      options.archiveRoot = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function timestamp(date = new Date()) {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "-",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
  ].join("");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertCandidate(candidateDirectory, productionDirectory) {
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
  const currentRecords = readJson(
    path.join(productionDirectory, "records.json"),
  );

  if (!Array.isArray(records) || records.length <= currentRecords.length) {
    throw new Error(
      `Candidate records (${records.length}) must exceed current production records (${currentRecords.length}).`,
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
    addedRecords: records.length - currentRecords.length,
    persons: persons.length,
    corporations: corporations.length,
    rankingGroups: Object.keys(rankings.rankings).length,
  };
}

function applyCandidate(options) {
  const rootDirectory = process.cwd();
  const candidateDirectory = path.resolve(
    options.candidateDirectory ??
      path.join("data", "draft", "production-candidate"),
  );
  const productionDirectory = path.resolve(
    options.productionDirectory ?? path.join("data", "production"),
  );
  const archiveName = options.archiveLabel
    ? `production-${options.archiveLabel}`
    : `production-${timestamp()}`;
  const archiveDirectory = path.resolve(
    options.archiveRoot ?? path.join("data", "archive"),
    archiveName,
  );

  const counts = assertCandidate(candidateDirectory, productionDirectory);

  for (const fileName of FILE_NAMES) {
    const productionPath = path.join(productionDirectory, fileName);
    if (!fs.existsSync(productionPath)) {
      throw new Error(`Production file is missing: ${productionPath}`);
    }
    readJson(productionPath);
  }
  if (fs.existsSync(archiveDirectory)) {
    throw new Error(`Archive directory already exists: ${archiveDirectory}`);
  }

  fs.mkdirSync(archiveDirectory, { recursive: false });
  for (const fileName of FILE_NAMES) {
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

  console.log("Production candidate applied.");
  console.log(`- archive: ${path.relative(rootDirectory, archiveDirectory)}`);
  console.log(`- added records: ${counts.addedRecords}`);
  console.log(`- records: ${counts.records}`);
  console.log(`- persons: ${counts.persons}`);
  console.log(`- corporations: ${counts.corporations}`);
  console.log(`- ranking groups: ${counts.rankingGroups}`);
}

try {
  const options = parseArguments(process.argv.slice(2));
  applyCandidate(options);
} catch (error) {
  console.error(`Production candidate apply failed: ${error.message}`);
  process.exitCode = 1;
}
})();
