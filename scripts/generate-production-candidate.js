(() => {
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_SOURCE_ID = "cabinet-office-annual-2024";

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--file") {
      options.file = argv[index + 1];
      index += 1;
    } else if (argument === "--output-dir") {
      options.outputDirectory = argv[index + 1];
      index += 1;
    } else if (argument === "--merge-production") {
      options.mergeProduction = true;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

function usage() {
  console.error(
    [
      "Usage:",
      '  npm run generate:candidate -- --file "data/draft/pending/daily-pick.json"',
      "Options:",
      "  --merge-production  Merge draft records with current production records",
      "  --output-dir PATH   Candidate output directory",
    ].join("\n"),
  );
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stableSlug(prefix, value) {
  const hash = crypto
    .createHash("sha256")
    .update(value.normalize("NFKC"), "utf8")
    .digest("hex")
    .slice(0, 16);
  return `${prefix}-${hash}`;
}

function writeJson(directory, fileName, value) {
  fs.writeFileSync(
    path.join(directory, fileName),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8",
  );
}

function mode(values) {
  const counts = new Map();
  for (const value of values.filter(Boolean)) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return (
    [...counts.entries()].sort(
      (left, right) =>
        right[1] - left[1] || left[0].localeCompare(right[0], "ja"),
    )[0]?.[0] ?? "不明"
  );
}

function draftIdentity(record) {
  return [
    record.personName,
    record.originMinistry,
    record.titleAtRetirement,
    record.retirementDate ?? "",
  ].join("\u001f");
}

function loadExistingDraftRecords(productionDirectory) {
  const records = readJson(path.join(productionDirectory, "records.json"));
  const corporations = readJson(
    path.join(productionDirectory, "corporations.json"),
  );
  const corporationTypeBySlug = new Map(
    corporations.map((corporation) => [corporation.slug, corporation.type]),
  );

  return records.map((record) => ({
    rawId: record.rawId,
    dedupeKey: record.dedupeKey,
    personName: record.name,
    originMinistry: record.fromMinistry,
    titleAtRetirement: record.previousPosition,
    retirementDate: record.retirementDate,
    reemploymentDate: record.reemploymentDate,
    waitingDays: record.waitingDays,
    corporationName: record.corporationName,
    corporationType:
      corporationTypeBySlug.get(record.corporationSlug) || "未分類",
    newPosition: record.newPosition,
    sourceId: record.sourceId,
    sourceUrl: record.sourceUrl,
  }));
}

function mergeRecords(existingRecords, draftRecords) {
  const productionDedupeKeys = new Set(
    existingRecords.map((record) => record.dedupeKey),
  );
  const merged = [...existingRecords];
  const seen = new Set(productionDedupeKeys);

  for (const record of draftRecords) {
    if (seen.has(record.dedupeKey)) continue;
    seen.add(record.dedupeKey);
    merged.push(record);
  }

  return {
    records: merged,
    addedCount: merged.length - existingRecords.length,
    skippedCount: draftRecords.length - (merged.length - existingRecords.length),
  };
}

function generateCandidate(options) {
  const inputPath = path.resolve(options.file);
  const draft = readJson(inputPath);
  if (!Array.isArray(draft.records) || draft.records.length === 0) {
    throw new Error("Draft file must contain a non-empty records array.");
  }

  const productionDirectory = path.join(process.cwd(), "data", "production");
  const outputDirectory = path.resolve(
    options.outputDirectory ??
      path.join("data", "draft", "production-candidate"),
  );
  fs.mkdirSync(outputDirectory, { recursive: true });

  const existingRecords = options.mergeProduction
    ? loadExistingDraftRecords(productionDirectory)
    : [];
  const merged = mergeRecords(existingRecords, draft.records);
  if (options.mergeProduction && merged.addedCount === 0) {
    throw new Error("Draft contains no records that are new to production.");
  }

  const draftRecords = merged.records;
  const corporationSlugByName = new Map();
  const personSlugByIdentity = new Map();

  for (const record of draftRecords) {
    corporationSlugByName.set(
      record.corporationName,
      stableSlug("corporation", record.corporationName),
    );
    const identity = draftIdentity(record);
    personSlugByIdentity.set(identity, stableSlug("person", identity));
  }

  const records = draftRecords.map((record) => {
    const identity = draftIdentity(record);
    return {
      rawId: record.rawId,
      dedupeKey: record.dedupeKey,
      personSlug: personSlugByIdentity.get(identity),
      name: record.personName,
      fromMinistry: record.originMinistry,
      previousPosition: record.titleAtRetirement,
      corporationSlug: corporationSlugByName.get(record.corporationName),
      corporationName: record.corporationName,
      newPosition: record.newPosition || "不明",
      retirementDate: record.retirementDate,
      reemploymentDate: record.reemploymentDate,
      waitingDays: record.waitingDays,
      sourceId: record.sourceId || DEFAULT_SOURCE_ID,
      sourceUrl: record.sourceUrl,
    };
  });

  const personGroups = new Map();
  records.forEach((record) => {
    if (!personGroups.has(record.personSlug)) {
      personGroups.set(record.personSlug, []);
    }
    personGroups.get(record.personSlug).push(record);
  });
  const persons = [...personGroups.entries()].map(([personSlug, group]) => {
    const representative = group[0];
    return {
      person_slug: personSlug,
      name: representative.name,
      fromMinistry: representative.fromMinistry,
      previousPosition: representative.previousPosition,
      corporationSlug: representative.corporationSlug,
      corporationName: representative.corporationName,
      newPosition: representative.newPosition,
      retirementDate: representative.retirementDate,
      reemploymentDate: representative.reemploymentDate,
      waitingDays: representative.waitingDays,
      tags: [
        representative.fromMinistry,
        "再就職情報",
        ...(representative.waitingDays <= 30 ? ["30日以内"] : []),
      ],
      sources: [...new Set(group.map((record) => record.sourceId))],
    };
  });

  const corporationGroups = new Map();
  records.forEach((record, index) => {
    if (!corporationGroups.has(record.corporationSlug)) {
      corporationGroups.set(record.corporationSlug, []);
    }
    corporationGroups.get(record.corporationSlug).push({
      ...record,
      corporationType: draftRecords[index].corporationType || "未分類",
    });
  });
  const corporations = [...corporationGroups.entries()].map(
    ([corporationSlug, group]) => {
      const waitingDays = group.map((record) => record.waitingDays);
      const relatedPersons = [
        ...new Set(group.map((record) => record.personSlug)),
      ];
      const topMinistry = mode(group.map((record) => record.fromMinistry));
      return {
        slug: corporationSlug,
        name: group[0].corporationName,
        type: mode(group.map((record) => record.corporationType)),
        prefecture: "不明",
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
        relatedPersons,
        sources: [...new Set(group.map((record) => record.sourceId))],
        topics: [],
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

  const productionSources = options.mergeProduction
    ? readJson(path.join(productionDirectory, "sources.json"))
    : [];
  const sourceById = new Map(
    productionSources.map((source) => [source.id, source]),
  );
  for (const source of draft.sources ?? []) {
    sourceById.set(source.id, source);
  }
  const sources = [...sourceById.values()];

  const meta = {
    lastUpdated: draft.createdAt,
    sourceDescription:
      "内閣官房の国家公務員再就職状況公表Excelから生成したproduction候補",
    productionRecordCount: records.length,
    corporationCount: corporations.length,
    personCount: persons.length,
    rankingCount: Object.keys(rankings.rankings).length,
    note: "公表資料から生成。元府省庁と法人種別の一部は名称から推定。",
  };

  writeJson(outputDirectory, "records.json", records);
  writeJson(outputDirectory, "persons.json", persons);
  writeJson(outputDirectory, "corporations.json", corporations);
  writeJson(outputDirectory, "rankings.json", rankings);
  writeJson(outputDirectory, "meta.json", meta);
  writeJson(outputDirectory, "sources.json", sources);

  console.log(`Production candidate generated from ${draft.records.length} draft records.`);
  console.log(`- added records: ${merged.addedCount}`);
  console.log(`- skipped duplicates: ${merged.skippedCount}`);
  console.log(`- total records: ${records.length}`);
  console.log(`- persons: ${persons.length}`);
  console.log(`- corporations: ${corporations.length}`);
  console.log(`- output: ${path.relative(process.cwd(), outputDirectory)}`);
}

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.help || !options.file) {
    usage();
    process.exitCode = options.help ? 0 : 1;
  } else {
    generateCandidate(options);
  }
} catch (error) {
  console.error(`Candidate generation failed: ${error.message}`);
  process.exitCode = 1;
}
})();
