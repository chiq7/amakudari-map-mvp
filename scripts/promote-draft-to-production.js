(() => {
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const FILE_NAMES = [
  "records.json",
  "persons.json",
  "corporations.json",
  "rankings.json",
  "meta.json",
  "sources.json",
];

function usage() {
  console.log(
    [
      "Usage:",
      '  npm run promote:draft -- --file "data/draft/example.json" --dry-run',
      '  npm run promote:draft -- --file "data/draft/example.json" --apply',
      "",
      "Options:",
      "  --file PATH            Draft JSON file (required)",
      "  --dry-run              Report changes without writing (default)",
      "  --apply                Back up and update production",
      "  --production-dir PATH  Override production directory",
      "  --archive-root PATH    Override archive root",
    ].join("\n"),
  );
}

function parseArguments(argv) {
  const options = { apply: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--file") {
      options.file = argv[index + 1];
      index += 1;
    } else if (argument === "--apply") {
      options.apply = true;
    } else if (argument === "--dry-run") {
      options.apply = false;
    } else if (argument === "--production-dir") {
      options.productionDirectory = argv[index + 1];
      index += 1;
    } else if (argument === "--archive-root") {
      options.archiveRoot = argv[index + 1];
      index += 1;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(directory, fileName, value) {
  fs.writeFileSync(
    path.join(directory, fileName),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8",
  );
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function stableSlug(prefix, value) {
  const hash = crypto
    .createHash("sha256")
    .update(value.normalize("NFKC"), "utf8")
    .digest("hex")
    .slice(0, 16);
  return `${prefix}-${hash}`;
}

function personIdentity(record) {
  return [
    record.personName,
    record.originMinistry,
    record.titleAtRetirement,
    record.retirementDate,
  ].join("\u001f");
}

function mode(values, fallback = "不明") {
  const counts = new Map();
  for (const value of values.filter(Boolean)) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return (
    [...counts.entries()].sort(
      (left, right) =>
        right[1] - left[1] || left[0].localeCompare(right[0], "ja"),
    )[0]?.[0] ?? fallback
  );
}

function timestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "_",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function validateApprovedRecord(record, index) {
  const errors = [];
  const requiredStrings = [
    "rawId",
    "dedupeKey",
    "personName",
    "originMinistry",
    "titleAtRetirement",
    "corporationName",
    "reemploymentDate",
    "sourceId",
    "sourceUrl",
  ];
  for (const field of requiredStrings) {
    if (!clean(record[field])) errors.push(`records[${index}].${field}`);
  }
  if (!clean(record.retirementDate)) {
    errors.push(`records[${index}].retirementDate`);
  }
  if (
    typeof record.waitingDays !== "number" ||
    !Number.isFinite(record.waitingDays) ||
    record.waitingDays < 0
  ) {
    errors.push(`records[${index}].waitingDays`);
  }
  return errors;
}

function loadProduction(productionDirectory) {
  const production = {};
  for (const fileName of FILE_NAMES) {
    const filePath = path.join(productionDirectory, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Production file is missing: ${filePath}`);
    }
    production[path.basename(fileName, ".json")] = readJson(filePath);
  }
  return production;
}

function classifyDraft(draft, productionRecords) {
  if (!Array.isArray(draft.records)) {
    throw new Error("Draft file must contain a records array.");
  }

  const approved = draft.records.filter((record) => record.approved === true);
  const unapprovedCount = draft.records.length - approved.length;
  const productionKeys = new Set(
    productionRecords.map((record) => record.dedupeKey),
  );
  const seen = new Set();
  const additions = [];
  const invalid = [];
  let productionDuplicateCount = 0;
  let draftDuplicateCount = 0;

  approved.forEach((record, index) => {
    const errors = validateApprovedRecord(record, index);
    if (errors.length > 0) {
      invalid.push(...errors);
      return;
    }
    if (productionKeys.has(record.dedupeKey)) {
      productionDuplicateCount += 1;
      return;
    }
    if (seen.has(record.dedupeKey)) {
      draftDuplicateCount += 1;
      return;
    }
    seen.add(record.dedupeKey);
    additions.push(record);
  });

  return {
    totalCount: draft.records.length,
    approvedCount: approved.length,
    unapprovedCount,
    additions,
    invalid,
    productionDuplicateCount,
    draftDuplicateCount,
  };
}

function buildCandidate(draft, production, additions) {
  const corporationByName = new Map(
    production.corporations.map((corporation) => [
      corporation.name,
      corporation,
    ]),
  );
  const personBySlug = new Map(
    production.persons.map((person) => [person.person_slug, person]),
  );
  const draftTypeByCorporation = new Map();

  const newRecords = additions.map((record) => {
    const existingCorporation = corporationByName.get(record.corporationName);
    const corporationSlug =
      existingCorporation?.slug ??
      stableSlug("corporation", record.corporationName);
    const identity = personIdentity(record);
    const personSlug = stableSlug("person", identity);
    const existingPerson = personBySlug.get(personSlug);

    if (
      existingPerson &&
      (existingPerson.corporationSlug !== corporationSlug ||
        existingPerson.corporationName !== record.corporationName)
    ) {
      throw new Error(
        `Person identity collision requires manual review: ${record.personName}`,
      );
    }

    if (!existingCorporation) {
      draftTypeByCorporation.set(
        corporationSlug,
        clean(record.corporationType) || "不明",
      );
    }

    return {
      rawId: record.rawId,
      dedupeKey: record.dedupeKey,
      personSlug,
      name: record.personName,
      fromMinistry: record.originMinistry,
      previousPosition: record.titleAtRetirement,
      corporationSlug,
      corporationName: record.corporationName,
      newPosition: clean(record.newPosition) || "不明",
      retirementDate: record.retirementDate,
      reemploymentDate: record.reemploymentDate,
      waitingDays: record.waitingDays,
      sourceId: record.sourceId,
      sourceUrl: record.sourceUrl,
    };
  });

  const records = [...production.records, ...newRecords];
  const recordsByPerson = new Map();
  const recordsByCorporation = new Map();
  for (const record of records) {
    const personGroup = recordsByPerson.get(record.personSlug) ?? [];
    personGroup.push(record);
    recordsByPerson.set(record.personSlug, personGroup);

    const corporationGroup =
      recordsByCorporation.get(record.corporationSlug) ?? [];
    corporationGroup.push(record);
    recordsByCorporation.set(record.corporationSlug, corporationGroup);
  }

  const persons = [...production.persons];
  for (const record of newRecords) {
    const existingIndex = persons.findIndex(
      (person) => person.person_slug === record.personSlug,
    );
    if (existingIndex >= 0) {
      const existing = persons[existingIndex];
      persons[existingIndex] = {
        ...existing,
        sources: [...new Set([...existing.sources, record.sourceId])],
      };
      continue;
    }
    persons.push({
      person_slug: record.personSlug,
      name: record.name,
      fromMinistry: record.fromMinistry,
      previousPosition: record.previousPosition,
      corporationSlug: record.corporationSlug,
      corporationName: record.corporationName,
      newPosition: record.newPosition,
      retirementDate: record.retirementDate,
      reemploymentDate: record.reemploymentDate,
      waitingDays: record.waitingDays,
      tags: [
        record.fromMinistry,
        "再就職情報",
        ...(record.waitingDays <= 30 ? ["30日以内"] : []),
      ],
      sources: [record.sourceId],
    });
  }

  const existingCorporationBySlug = new Map(
    production.corporations.map((corporation) => [
      corporation.slug,
      corporation,
    ]),
  );
  const corporations = [...recordsByCorporation.entries()].map(
    ([corporationSlug, group]) => {
      const existing = existingCorporationBySlug.get(corporationSlug);
      const topMinistry = mode(group.map((record) => record.fromMinistry));
      const waitingDays = group.map((record) => record.waitingDays);
      return {
        ...(existing ?? {
          slug: corporationSlug,
          name: group[0].corporationName,
          type: draftTypeByCorporation.get(corporationSlug) ?? "不明",
          prefecture: "不明",
          topics: [],
        }),
        ministry: {
          name: topMinistry,
          count: group.filter(
            (record) => record.fromMinistry === topMinistry,
          ).length,
        },
        counts: {
          publicRecords: group.length,
          nextDay: group.filter((record) => record.waitingDays === 0).length,
          within30Days: group.filter(
            (record) => record.waitingDays >= 0 && record.waitingDays <= 30,
          ).length,
        },
        waitingDays: {
          average: Math.round(
            waitingDays.reduce((sum, value) => sum + value, 0) /
              waitingDays.length,
          ),
        },
        relatedPersons: [
          ...new Set(group.map((record) => record.personSlug)),
        ],
        sources: [...new Set(group.map((record) => record.sourceId))],
      };
    },
  );

  const ranking = (selector, direction = "desc") =>
    [...corporations]
      .sort((left, right) => {
        const difference = selector(left) - selector(right);
        return direction === "asc" ? difference : -difference;
      })
      .map((corporation) => ({
        corporationSlug: corporation.slug,
        value: selector(corporation),
      }));

  const rankings = {
    totals: {
      publicRecords: records.length,
      corporations: corporations.length,
      nextDayCorporations: corporations.filter(
        (corporation) => corporation.counts.nextDay > 0,
      ).length,
      within30DaysCorporations: corporations.filter(
        (corporation) => corporation.counts.within30Days > 0,
      ).length,
    },
    rankings: {
      publicRecords: ranking(
        (corporation) => corporation.counts.publicRecords,
      ),
      nextDay: ranking((corporation) => corporation.counts.nextDay),
      within30Days: ranking(
        (corporation) => corporation.counts.within30Days,
      ),
      shortestAverageWaitingDays: ranking(
        (corporation) => corporation.waitingDays.average,
        "asc",
      ),
    },
  };

  const sourceById = new Map(
    production.sources.map((source) => [source.id, source]),
  );
  for (const source of draft.sources ?? []) {
    if (source?.id) sourceById.set(source.id, source);
  }
  const sources = [...sourceById.values()];
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const record of newRecords) {
    if (!sourceIds.has(record.sourceId)) {
      throw new Error(
        `Draft source is not present in production or draft.sources: ${record.sourceId}`,
      );
    }
  }

  const meta = {
    ...production.meta,
    lastUpdated: draft.createdAt || new Date().toISOString().slice(0, 10),
    productionRecordCount: records.length,
    corporationCount: corporations.length,
    personCount: persons.length,
    rankingCount: Object.keys(rankings.rankings).length,
  };

  return { records, persons, corporations, rankings, meta, sources };
}

function runNodeScript(scriptPath, args) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    throw new Error(`Validation command failed: ${path.basename(scriptPath)}`);
  }
}

function writeCandidate(directory, candidate) {
  fs.mkdirSync(directory, { recursive: true });
  for (const fileName of FILE_NAMES) {
    writeJson(
      directory,
      fileName,
      candidate[path.basename(fileName, ".json")],
    );
  }
}

function restoreProduction(archiveDirectory, productionDirectory) {
  for (const fileName of FILE_NAMES) {
    fs.copyFileSync(
      path.join(archiveDirectory, fileName),
      path.join(productionDirectory, fileName),
    );
  }
}

function promote(options) {
  const draftPath = path.resolve(options.file);
  if (!fs.existsSync(draftPath)) {
    throw new Error(`Draft file not found: ${draftPath}`);
  }
  const productionDirectory = path.resolve(
    options.productionDirectory ?? path.join("data", "production"),
  );
  const archiveRoot = path.resolve(
    options.archiveRoot ?? path.join("data", "archive"),
  );
  const draft = readJson(draftPath);
  const production = loadProduction(productionDirectory);
  const summary = classifyDraft(draft, production.records);

  console.log(options.apply ? "Promotion apply requested." : "Promotion dry-run.");
  console.log(`Input file: ${draftPath}`);
  console.log(`Draft records: ${summary.totalCount}`);
  console.log(`Approved records: ${summary.approvedCount}`);
  console.log(`Unapproved skipped: ${summary.unapprovedCount}`);
  console.log(
    `Existing production duplicates: ${summary.productionDuplicateCount}`,
  );
  console.log(`Draft duplicates: ${summary.draftDuplicateCount}`);
  console.log(`Invalid approved records: ${summary.invalid.length}`);
  console.log(`Records to add: ${summary.additions.length}`);

  if (summary.invalid.length > 0) {
    console.log(`Missing or invalid fields: ${summary.invalid.join(", ")}`);
    if (options.apply) {
      throw new Error("Approved records contain invalid production fields.");
    }
  }
  if (!options.apply) return;
  if (summary.additions.length === 0) {
    throw new Error("No approved, non-duplicate records are available to add.");
  }

  const candidate = buildCandidate(draft, production, summary.additions);
  const candidateDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "amakudari-promote-"),
  );
  writeCandidate(candidateDirectory, candidate);
  runNodeScript(
    path.join(process.cwd(), "scripts", "validate-production-candidate.js"),
    ["--dir", candidateDirectory],
  );

  const archiveDirectory = path.join(
    archiveRoot,
    `${timestamp()}_before_promote`,
  );
  if (fs.existsSync(archiveDirectory)) {
    throw new Error(`Archive directory already exists: ${archiveDirectory}`);
  }
  fs.mkdirSync(archiveDirectory, { recursive: true });
  for (const fileName of FILE_NAMES) {
    fs.copyFileSync(
      path.join(productionDirectory, fileName),
      path.join(archiveDirectory, fileName),
    );
  }

  try {
    for (const fileName of FILE_NAMES) {
      fs.copyFileSync(
        path.join(candidateDirectory, fileName),
        path.join(productionDirectory, fileName),
      );
    }
    if (
      productionDirectory ===
      path.resolve(path.join("data", "production"))
    ) {
      runNodeScript(
        path.join(process.cwd(), "scripts", "validate-data.js"),
        [],
      );
      runNodeScript(
        path.join(process.cwd(), "scripts", "generate-static-content.js"),
        [],
      );
    }
  } catch (error) {
    restoreProduction(archiveDirectory, productionDirectory);
    throw new Error(
      `Promotion failed and production was restored: ${error.message}`,
    );
  } finally {
    fs.rmSync(candidateDirectory, { recursive: true, force: true });
  }

  console.log("Promotion completed.");
  console.log(`Archive: ${path.relative(process.cwd(), archiveDirectory)}`);
  console.log(`Production records: ${candidate.records.length}`);
  console.log(`Production persons: ${candidate.persons.length}`);
  console.log(`Production corporations: ${candidate.corporations.length}`);
}

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.help || !options.file) {
    usage();
    process.exitCode = options.help ? 0 : 1;
  } else {
    promote(options);
  }
} catch (error) {
  console.error(`Draft promotion failed: ${error.message}`);
  process.exitCode = 1;
}
})();
