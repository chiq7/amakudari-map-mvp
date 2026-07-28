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
const PAGE_LASTMOD_FILE = "page-lastmod.json";

function recordsBySlug(records, field) {
  return new Map(records.map((record) => [record[field], record]));
}

function changedSlugs(beforeRecords, afterRecords, field) {
  const before = recordsBySlug(beforeRecords, field);
  const after = recordsBySlug(afterRecords, field);
  const slugs = new Set([...before.keys(), ...after.keys()]);

  return [...slugs].filter(
    (slug) => JSON.stringify(before.get(slug)) !== JSON.stringify(after.get(slug)),
  );
}

function updatePageLastmod(productionDirectory, before, after) {
  const pageLastmodPath = path.join(productionDirectory, PAGE_LASTMOD_FILE);
  const existing = fs.existsSync(pageLastmodPath) ? readJson(pageLastmodPath) : {};
  const pages = { ...(existing.pages ?? {}) };
  const updatedAt = new Date().toISOString();
  const changedPersons = changedSlugs(before.persons, after.persons, "person_slug");
  const changedCorporations = changedSlugs(
    before.corporations,
    after.corporations,
    "slug",
  );
  const hasDatasetChange =
    JSON.stringify(before.records) !== JSON.stringify(after.records) ||
    changedPersons.length > 0 ||
    changedCorporations.length > 0;

  if (hasDatasetChange) {
    for (const pathname of [
      "/",
      "/rankings",
      "/corporations",
      "/persons",
      "/organizations",
    ]) {
      pages[pathname] = updatedAt;
    }
  }
  for (const slug of changedPersons) pages[`/persons/${slug}`] = updatedAt;
  for (const slug of changedCorporations) {
    pages[`/corporations/${slug}`] = updatedAt;
  }

  fs.writeFileSync(
    pageLastmodPath,
    `${JSON.stringify({ version: 1, pages }, null, 2)}\n`,
  );
}

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
  const pageLastmodPath = path.join(productionDirectory, PAGE_LASTMOD_FILE);
  if (fs.existsSync(pageLastmodPath)) {
    fs.copyFileSync(pageLastmodPath, path.join(archiveDirectory, PAGE_LASTMOD_FILE));
  }
  const before = {
    records: readJson(path.join(productionDirectory, "records.json")),
    persons: readJson(path.join(productionDirectory, "persons.json")),
    corporations: readJson(path.join(productionDirectory, "corporations.json")),
  };
  for (const fileName of FILE_NAMES) {
    fs.copyFileSync(
      path.join(candidateDirectory, fileName),
      path.join(productionDirectory, fileName),
    );
  }
  updatePageLastmod(productionDirectory, before, {
    records: readJson(path.join(productionDirectory, "records.json")),
    persons: readJson(path.join(productionDirectory, "persons.json")),
    corporations: readJson(path.join(productionDirectory, "corporations.json")),
  });

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
