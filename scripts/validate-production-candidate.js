(() => {
const fs = require("node:fs");
const path = require("node:path");

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--dir") {
      options.directory = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

const options = parseArguments(process.argv.slice(2));
const directory = path.resolve(
  options.directory ?? path.join("data", "draft", "production-candidate"),
);

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(directory, fileName), "utf8"));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function duplicates(values) {
  const seen = new Set();
  const duplicateValues = new Set();
  values.forEach((value) => {
    if (seen.has(value)) duplicateValues.add(value);
    seen.add(value);
  });
  return [...duplicateValues];
}

function validate() {
  const errors = [];
  const requiredFiles = [
    "records.json",
    "persons.json",
    "corporations.json",
    "rankings.json",
    "meta.json",
    "sources.json",
  ];
  requiredFiles.forEach((fileName) => {
    if (!fs.existsSync(path.join(directory, fileName))) {
      errors.push(`${fileName} is required.`);
    }
  });
  if (errors.length) return errors;

  const records = readJson("records.json");
  const persons = readJson("persons.json");
  const corporations = readJson("corporations.json");
  const rankings = readJson("rankings.json");
  const meta = readJson("meta.json");
  const sources = readJson("sources.json");

  if (!Array.isArray(records)) errors.push("records.json must contain an array.");
  if (!Array.isArray(persons)) errors.push("persons.json must contain an array.");
  if (!Array.isArray(corporations)) {
    errors.push("corporations.json must contain an array.");
  }
  if (!Array.isArray(sources)) errors.push("sources.json must contain an array.");
  if (errors.length) return errors;

  duplicates(records.map((record) => record.rawId)).forEach((value) =>
    errors.push(`Duplicate rawId: ${value}`),
  );
  duplicates(records.map((record) => record.dedupeKey)).forEach((value) =>
    errors.push(`Duplicate dedupeKey: ${value}`),
  );
  duplicates(persons.map((person) => person.person_slug)).forEach((value) =>
    errors.push(`Duplicate person_slug: ${value}`),
  );
  duplicates(corporations.map((corporation) => corporation.slug)).forEach(
    (value) => errors.push(`Duplicate corporation slug: ${value}`),
  );

  const personSlugs = new Set(persons.map((person) => person.person_slug));
  const corporationSlugs = new Set(
    corporations.map((corporation) => corporation.slug),
  );
  const sourceIds = new Set(sources.map((source) => source.id));

  records.forEach((record, index) => {
    const prefix = `records[${index}]`;
    [
      "rawId",
      "dedupeKey",
      "personSlug",
      "name",
      "fromMinistry",
      "previousPosition",
      "corporationSlug",
      "corporationName",
      "newPosition",
      "retirementDate",
      "reemploymentDate",
      "sourceId",
      "sourceUrl",
    ].forEach((field) => {
      if (!isNonEmptyString(record[field])) errors.push(`${prefix}.${field} is required.`);
    });
    if (!isFiniteNumber(record.waitingDays) || record.waitingDays < 0) {
      errors.push(`${prefix}.waitingDays must be a non-negative number.`);
    }
    if (!personSlugs.has(record.personSlug)) {
      errors.push(`${prefix}.personSlug references an unknown person.`);
    }
    if (!corporationSlugs.has(record.corporationSlug)) {
      errors.push(`${prefix}.corporationSlug references an unknown corporation.`);
    }
    if (!sourceIds.has(record.sourceId)) {
      errors.push(`${prefix}.sourceId references an unknown source.`);
    }
  });

  persons.forEach((person, index) => {
    const prefix = `persons[${index}]`;
    [
      "person_slug",
      "name",
      "fromMinistry",
      "previousPosition",
      "corporationSlug",
      "corporationName",
      "newPosition",
      "retirementDate",
      "reemploymentDate",
    ].forEach((field) => {
      if (!isNonEmptyString(person[field])) errors.push(`${prefix}.${field} is required.`);
    });
    if (!isFiniteNumber(person.waitingDays) || person.waitingDays < 0) {
      errors.push(`${prefix}.waitingDays must be a non-negative number.`);
    }
    if (!corporationSlugs.has(person.corporationSlug)) {
      errors.push(`${prefix}.corporationSlug references an unknown corporation.`);
    }
    for (const sourceId of person.sources ?? []) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`${prefix}.sources references an unknown source.`);
      }
    }
  });

  corporations.forEach((corporation, index) => {
    const prefix = `corporations[${index}]`;
    ["slug", "name", "type", "prefecture"].forEach((field) => {
      if (!isNonEmptyString(corporation[field])) errors.push(`${prefix}.${field} is required.`);
    });
    if (!isNonEmptyString(corporation.ministry?.name)) {
      errors.push(`${prefix}.ministry.name is required.`);
    }
    [
      corporation.ministry?.count,
      corporation.counts?.publicRecords,
      corporation.counts?.nextDay,
      corporation.counts?.within30Days,
      corporation.waitingDays?.average,
    ].forEach((value, fieldIndex) => {
      if (!isFiniteNumber(value)) {
        errors.push(`${prefix} numeric field ${fieldIndex} must be a number.`);
      }
    });
    for (const sourceId of corporation.sources ?? []) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`${prefix}.sources references an unknown source.`);
      }
    }
  });

  sources.forEach((source, index) => {
    const prefix = `sources[${index}]`;
    ["id", "title", "publisher", "url"].forEach((field) => {
      if (!isNonEmptyString(source[field])) {
        errors.push(`${prefix}.${field} is required.`);
      }
    });
  });

  const rankingGroups = rankings?.rankings ?? {};
  ["publicRecords", "nextDay", "within30Days", "shortestAverageWaitingDays"].forEach(
    (groupName) => {
      if (!Array.isArray(rankingGroups[groupName]) || rankingGroups[groupName].length === 0) {
        errors.push(`rankings.${groupName} must contain a non-empty array.`);
      }
    },
  );

  const expectedCounts = {
    productionRecordCount: records.length,
    corporationCount: corporations.length,
    personCount: persons.length,
    rankingCount: Object.keys(rankingGroups).length,
  };
  Object.entries(expectedCounts).forEach(([field, expected]) => {
    if (meta[field] !== expected) {
      errors.push(`meta.${field} (${meta[field]}) must equal ${expected}.`);
    }
  });
  if (!isNonEmptyString(meta.lastUpdated)) errors.push("meta.lastUpdated is required.");
  if (!isNonEmptyString(meta.sourceDescription)) {
    errors.push("meta.sourceDescription is required.");
  }
  if (!isNonEmptyString(meta.note)) errors.push("meta.note is required.");

  return errors;
}

try {
  const errors = validate();
  if (errors.length) {
    console.error(`Candidate validation failed with ${errors.length} error(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log("Production candidate validation passed.");
  }
} catch (error) {
  console.error(`Candidate validation failed: ${error.message}`);
  process.exitCode = 1;
}
})();
