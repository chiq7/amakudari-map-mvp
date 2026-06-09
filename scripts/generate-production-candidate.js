(() => {
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const SOURCE_ID = "cabinet-office-annual-2024";

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--file") {
      options.file = argv[index + 1];
      index += 1;
    } else if (argv[index] === "--help" || argv[index] === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

function usage() {
  console.error(
    'Usage: npm run generate:candidate -- --file "data/draft/..._all.json"',
  );
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

function generateCandidate(draftFile) {
  const inputPath = path.resolve(draftFile);
  const draft = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  if (!Array.isArray(draft.records) || draft.records.length === 0) {
    throw new Error("Draft file must contain a non-empty records array.");
  }

  const outputDirectory = path.join(
    process.cwd(),
    "data",
    "draft",
    "production-candidate",
  );
  fs.mkdirSync(outputDirectory, { recursive: true });

  const corporationSlugByName = new Map();
  const personSlugByIdentity = new Map();

  for (const record of draft.records) {
    corporationSlugByName.set(
      record.corporationName,
      stableSlug("corporation", record.corporationName),
    );
    const identity = [
      record.personName,
      record.originMinistry,
      record.titleAtRetirement,
      record.retirementDate ?? "",
    ].join("\u001f");
    personSlugByIdentity.set(identity, stableSlug("person", identity));
  }

  const records = draft.records.map((record) => {
    const identity = [
      record.personName,
      record.originMinistry,
      record.titleAtRetirement,
      record.retirementDate ?? "",
    ].join("\u001f");
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
      sourceId: SOURCE_ID,
      sourceUrl: record.sourceUrl,
    };
  });

  const personGroups = new Map();
  records.forEach((record) => {
    if (!personGroups.has(record.personSlug)) personGroups.set(record.personSlug, []);
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
      sources: [SOURCE_ID],
    };
  });

  const corporationGroups = new Map();
  records.forEach((record, index) => {
    if (!corporationGroups.has(record.corporationSlug)) {
      corporationGroups.set(record.corporationSlug, []);
    }
    corporationGroups.get(record.corporationSlug).push({
      ...record,
      corporationType: draft.records[index].corporationType || "未分類",
    });
  });
  const corporations = [...corporationGroups.entries()].map(
    ([corporationSlug, group]) => {
      const waitingDays = group.map((record) => record.waitingDays);
      const relatedPersons = [...new Set(group.map((record) => record.personSlug))];
      return {
        slug: corporationSlug,
        name: group[0].corporationName,
        type: mode(group.map((record) => record.corporationType)),
        prefecture: "不明",
        ministry: {
          name: mode(group.map((record) => record.fromMinistry)),
          count: Math.max(
            ...[...new Set(group.map((record) => record.fromMinistry))].map(
              (ministry) =>
                group.filter((record) => record.fromMinistry === ministry).length,
            ),
          ),
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
        sources: [SOURCE_ID],
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

  const meta = {
    lastUpdated: draft.createdAt,
    sourceDescription:
      "内閣官房の国家公務員再就職状況年度公表Excelから生成したproduction候補",
    productionRecordCount: records.length,
    corporationCount: corporations.length,
    personCount: persons.length,
    rankingCount: Object.keys(rankings.rankings).length,
    note: "人間確認前の候補データ。data/productionには未反映。",
  };

  writeJson(outputDirectory, "records.json", records);
  writeJson(outputDirectory, "persons.json", persons);
  writeJson(outputDirectory, "corporations.json", corporations);
  writeJson(outputDirectory, "rankings.json", rankings);
  writeJson(outputDirectory, "meta.json", meta);

  console.log(`Production candidate generated from ${draft.records.length} draft records.`);
  console.log(`- records: ${records.length}`);
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
    generateCandidate(options.file);
  }
} catch (error) {
  console.error(`Candidate generation failed: ${error.message}`);
  process.exitCode = 1;
}
})();
