(() => {
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;
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
      '  npm run promote:draft -- --file "data/draft/example.json" --dry-run --limit 10',
      '  npm run promote:draft -- --file "data/draft/example.json" --apply --limit 10',
      "",
      "Options:",
      "  --file PATH            Draft JSON file (required)",
      "  --dry-run              Report changes without writing (default)",
      "  --apply                Back up and update production",
      `  --limit NUMBER         Maximum records to apply (default: ${DEFAULT_LIMIT}, max: ${MAX_LIMIT})`,
      "  --production-dir PATH  Override production directory",
      "  --archive-root PATH    Override archive root",
    ].join("\n"),
  );
}

function parseArguments(argv) {
  const options = { apply: false, limit: DEFAULT_LIMIT };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--file") {
      options.file = argv[index + 1];
      index += 1;
    } else if (argument === "--apply") {
      options.apply = true;
    } else if (argument === "--dry-run") {
      options.apply = false;
    } else if (argument === "--limit") {
      options.limit = Number(argv[index + 1]);
      index += 1;
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
  if (
    !Number.isInteger(options.limit) ||
    options.limit < 1 ||
    options.limit > MAX_LIMIT
  ) {
    throw new Error(`--limit must be an integer from 1 to ${MAX_LIMIT}.`);
  }
  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
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

function validateCorporationEnrichments(draft) {
  if (draft.corporationEnrichments === undefined) return;
  if (!Array.isArray(draft.corporationEnrichments)) {
    throw new Error("Draft corporationEnrichments must contain an array.");
  }
  const sourceIds = new Set(
    (draft.sources ?? []).map((source) => source?.id).filter(Boolean),
  );
  const seenNames = new Set();
  draft.corporationEnrichments.forEach((enrichment, index) => {
    const prefix = `corporationEnrichments[${index}]`;
    for (const field of [
      "corporationName",
      "corporateNumber",
      "officialName",
      "registeredAddress",
      "prefecture",
      "city",
      "sourceName",
      "sourceUrl",
      "sourceId",
    ]) {
      if (!clean(enrichment[field])) {
        throw new Error(`${prefix}.${field} is required.`);
      }
    }
    if (!/^\d{13}$/.test(enrichment.corporateNumber)) {
      throw new Error(`${prefix}.corporateNumber must contain 13 digits.`);
    }
    if (!sourceIds.has(enrichment.sourceId)) {
      throw new Error(`${prefix}.sourceId is not present in draft.sources.`);
    }
    if (seenNames.has(enrichment.corporationName)) {
      throw new Error(
        `Duplicate corporation enrichment: ${enrichment.corporationName}`,
      );
    }
    seenNames.add(enrichment.corporationName);
  });
}

function classifyDraft(draft, productionRecords, limit) {
  if (!Array.isArray(draft.records)) {
    throw new Error("Draft file must contain a records array.");
  }

  const approved = draft.records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => record.approved === true);
  const unapprovedCount = draft.records.length - approved.length;
  const productionKeys = new Set(
    productionRecords.map((record) => record.dedupeKey),
  );
  const seen = new Set();
  const additions = [];
  const invalid = [];
  let invalidRecordCount = 0;
  let productionDuplicateCount = 0;
  let draftDuplicateCount = 0;

  approved.forEach(({ record, index }) => {
    const errors = validateApprovedRecord(record, index);
    if (errors.length > 0) {
      invalidRecordCount += 1;
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

  const selectedAdditions = additions.slice(0, limit);

  return {
    totalCount: draft.records.length,
    approvedCount: approved.length,
    unapprovedCount,
    additions,
    selectedAdditions,
    pendingCount: additions.length - selectedAdditions.length,
    invalid,
    invalidRecordCount,
    productionDuplicateCount,
    draftDuplicateCount,
    duplicateCount: productionDuplicateCount + draftDuplicateCount,
  };
}

function buildCandidate(draft, production, additions) {
  const enrichmentByCorporationName = new Map(
    (draft.corporationEnrichments ?? []).map((enrichment) => [
      enrichment.corporationName,
      enrichment,
    ]),
  );
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
  const recordCorporations = [...recordsByCorporation.entries()].map(
    ([corporationSlug, group]) => {
      const existing = existingCorporationBySlug.get(corporationSlug);
      const enrichment = enrichmentByCorporationName.get(
        group[0].corporationName,
      );
      const topMinistry = mode(group.map((record) => record.fromMinistry));
      const waitingDays = group.map((record) => record.waitingDays);
      const corporation = {
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
      if (enrichment) {
        corporation.basicInfo = {
          corporateNumber: enrichment.corporateNumber,
          officialName: enrichment.officialName,
          registeredAddress: enrichment.registeredAddress,
          prefecture: enrichment.prefecture,
          city: enrichment.city,
          sourceName: enrichment.sourceName,
          sourceUrl: enrichment.sourceUrl,
        };
        if (enrichment.gbizInfo) corporation.gbizInfo = enrichment.gbizInfo;
        corporation.sources = [
          ...new Set([
            ...corporation.sources,
            ...(enrichment.sourceId ? [enrichment.sourceId] : []),
          ]),
        ];
        corporation.prefecture =
          enrichment.prefecture || corporation.prefecture;
      }
      return corporation;
    },
  );
  const recordCorporationSlugs = new Set(
    recordCorporations.map((corporation) => corporation.slug),
  );
  const profileOnlyCorporations = production.corporations.filter(
    (corporation) =>
      !recordCorporationSlugs.has(corporation.slug) &&
      (corporation.publicOfficers?.length ?? 0) > 0,
  );
  const corporations = [...recordCorporations, ...profileOnlyCorporations];
  const rankedCorporations = corporations.filter(
    (corporation) => corporation.counts.publicRecords > 0,
  );

  const ranking = (selector, direction = "desc") =>
    [...rankedCorporations]
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
  validateCorporationEnrichments(draft);
  const production = loadProduction(productionDirectory);
  const summary = classifyDraft(draft, production.records, options.limit);

  console.log(options.apply ? "Promotion apply requested." : "Promotion dry-run.");
  console.log(`Input file: ${draftPath}`);
  console.log(`Limit: ${options.limit}`);
  console.log(`Draft records: ${summary.totalCount}`);
  console.log(`Approved records: ${summary.approvedCount}`);
  console.log(`Skipped: ${summary.unapprovedCount}`);
  console.log(`Duplicates: ${summary.duplicateCount}`);
  console.log(
    `  - Existing production: ${summary.productionDuplicateCount}`,
  );
  console.log(`  - Within draft: ${summary.draftDuplicateCount}`);
  console.log(`Invalid approved records: ${summary.invalidRecordCount}`);
  console.log(`Eligible records: ${summary.additions.length}`);
  console.log(`Pending after limit: ${summary.pendingCount}`);
  console.log(
    options.apply
      ? "Applied: 0 (not written yet)"
      : "Applied: 0 (dry-run)",
  );
  console.log(
    options.apply
      ? `Selected for apply: ${summary.selectedAdditions.length}`
      : `Would apply: ${summary.selectedAdditions.length}`,
  );

  if (summary.invalid.length > 0) {
    console.log(`Missing or invalid fields: ${summary.invalid.join(", ")}`);
    if (options.apply) {
      throw new Error("Approved records contain invalid production fields.");
    }
  }
  if (!options.apply) return;
  if (summary.selectedAdditions.length === 0) {
    console.log("No approved, non-duplicate records are available to add.");
    console.log("Production was not changed and no archive was created.");
    return;
  }

  const candidate = buildCandidate(
    draft,
    production,
    summary.selectedAdditions,
  );
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
  console.log(`Applied: ${summary.selectedAdditions.length}`);
  console.log(`Archive: ${path.relative(process.cwd(), archiveDirectory)}`);
  console.log(`Production records: ${candidate.records.length}`);
  console.log(`Production persons: ${candidate.persons.length}`);
  console.log(`Production corporations: ${candidate.corporations.length}`);
  console.log("Run the remaining post-apply checks before committing:");
  console.log("  npx.cmd tsc --noEmit");
  console.log("  npm.cmd run build");
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
