(() => {
const fs = require("node:fs");
const path = require("node:path");

const productionDirectory = path.join(process.cwd(), "data", "production");
const editorialDirectory = path.join(process.cwd(), "data", "editorial");

function readJson(fileName) {
  const filePath = path.join(productionDirectory, fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fileExists(fileName) {
  return fs.existsSync(path.join(productionDirectory, fileName));
}

function readEditorialJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(editorialDirectory, fileName), "utf8"));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return Array.from(duplicates);
}

function validateData() {
  const errors = [];
  const requiredFiles = [
    "corporations.json",
    "persons.json",
    "rankings.json",
    "sources.json",
    "topics.json",
    "records.json",
    "meta.json",
    "page-lastmod.json",
  ];

  for (const fileName of requiredFiles) {
    if (!fileExists(fileName)) {
      errors.push(`data/production/${fileName} is required.`);
    }
  }

  if (errors.length > 0) {
    return errors;
  }

  const corporations = readJson("corporations.json");
  const persons = readJson("persons.json");
  const rankings = readJson("rankings.json");
  const records = readJson("records.json");
  const meta = readJson("meta.json");
  const sources = readJson("sources.json");
  const topics = readJson("topics.json");
  const pageLastmod = readJson("page-lastmod.json");
  const corporationContexts = readEditorialJson("corporation-contexts.json");

  if (!Array.isArray(corporations)) errors.push("corporations.json must contain an array.");
  if (!Array.isArray(persons)) errors.push("persons.json must contain an array.");
  if (!Array.isArray(records)) errors.push("records.json must contain an array.");
  if (!Array.isArray(sources)) errors.push("sources.json must contain an array.");
  if (!Array.isArray(topics)) errors.push("topics.json must contain an array.");
  if (!Array.isArray(corporationContexts)) {
    errors.push("data/editorial/corporation-contexts.json must contain an array.");
  }
  if (
    !pageLastmod ||
    typeof pageLastmod !== "object" ||
    typeof pageLastmod.pages !== "object" ||
    Array.isArray(pageLastmod.pages)
  ) {
    errors.push("page-lastmod.json must contain a pages object.");
  } else {
    for (const [pathname, value] of Object.entries(pageLastmod.pages)) {
      if (!pathname.startsWith("/")) {
        errors.push(`page-lastmod.json path must start with /: ${pathname}`);
      }
      if (typeof value !== "string" || Number.isNaN(new Date(value).getTime())) {
        errors.push(`page-lastmod.json has an invalid date for: ${pathname}`);
      }
    }
  }

  if (errors.length > 0) {
    return errors;
  }

  const corporationSlugs = corporations.map((corporation) => corporation.slug);
  const personSlugs = persons.map((person) => person.person_slug);
  const recordRawIds = records.map((record) => record.rawId);
  const recordDedupeKeys = records.map((record) => record.dedupeKey);
  const sourceIds = new Set(sources.map((source) => source.id));
  const corporationSlugSet = new Set(corporationSlugs);
  const personSlugSet = new Set(personSlugs);
  const publicOfficerSlugs = [];
  const corporateNumbers = [];

  for (const slug of findDuplicates(corporationSlugs)) {
    errors.push(`Duplicate corporation slug: ${slug}`);
  }

  for (const slug of findDuplicates(personSlugs)) {
    errors.push(`Duplicate person_slug: ${slug}`);
  }

  for (const rawId of findDuplicates(recordRawIds)) {
    errors.push(`Duplicate record rawId: ${rawId}`);
  }

  for (const dedupeKey of findDuplicates(recordDedupeKeys)) {
    errors.push(`Duplicate record dedupeKey: ${dedupeKey}`);
  }

  corporations.forEach((corporation, index) => {
    const prefix = `corporations.json[${index}]`;
    const requiredStrings = [
      ["slug", corporation.slug],
      ["name", corporation.name],
      ["type", corporation.type],
      ["prefecture", corporation.prefecture],
      ["ministry.name", corporation.ministry?.name],
    ];

    for (const [field, value] of requiredStrings) {
      if (!isNonEmptyString(value)) errors.push(`${prefix}.${field} is required.`);
    }

    const numericFields = [
      ["ministry.count", corporation.ministry?.count],
      ["counts.publicRecords", corporation.counts?.publicRecords],
      ["counts.nextDay", corporation.counts?.nextDay],
      ["counts.within30Days", corporation.counts?.within30Days],
      ["waitingDays.average", corporation.waitingDays?.average],
    ];

    for (const [field, value] of numericFields) {
      if (!isFiniteNumber(value)) errors.push(`${prefix}.${field} must be a number.`);
    }

    for (const sourceId of corporation.sources ?? []) {
      if (!sourceIds.has(sourceId)) errors.push(`${prefix}.sources references unknown source: ${sourceId}`);
    }
    if (
      corporation.aliases !== undefined &&
      (!Array.isArray(corporation.aliases) ||
        corporation.aliases.some((alias) => !isNonEmptyString(alias)))
    ) {
      errors.push(`${prefix}.aliases must contain non-empty strings.`);
    }

    for (const [officerIndex, officer] of (corporation.publicOfficers ?? []).entries()) {
      const officerPrefix = `${prefix}.publicOfficers[${officerIndex}]`;
      publicOfficerSlugs.push(officer.slug);
      for (const [field, value] of [
        ["slug", officer.slug],
        ["name", officer.name],
        ["role", officer.role],
        ["formerOrganization", officer.formerOrganization],
        ["formerPosition", officer.formerPosition],
        ["profile", officer.profile],
      ]) {
        if (!isNonEmptyString(value)) errors.push(`${officerPrefix}.${field} is required.`);
      }
      if (!Array.isArray(officer.sourceIds) || officer.sourceIds.length === 0) {
        errors.push(`${officerPrefix}.sourceIds must contain at least one source.`);
      } else {
        for (const sourceId of officer.sourceIds) {
          if (!sourceIds.has(sourceId)) {
            errors.push(`${officerPrefix}.sourceIds references unknown source: ${sourceId}`);
          }
        }
      }
    }

    if (corporation.basicInfo !== undefined) {
      const basicInfo = corporation.basicInfo;
      const requiredBasicInfoStrings = [
        ["basicInfo.corporateNumber", basicInfo?.corporateNumber],
        ["basicInfo.officialName", basicInfo?.officialName],
        ["basicInfo.registeredAddress", basicInfo?.registeredAddress],
        ["basicInfo.prefecture", basicInfo?.prefecture],
        ["basicInfo.city", basicInfo?.city],
        ["basicInfo.sourceName", basicInfo?.sourceName],
        ["basicInfo.sourceUrl", basicInfo?.sourceUrl],
      ];
      for (const [field, value] of requiredBasicInfoStrings) {
        if (!isNonEmptyString(value)) errors.push(`${prefix}.${field} is required.`);
      }
      if (!/^\d{13}$/.test(basicInfo?.corporateNumber ?? "")) {
        errors.push(`${prefix}.basicInfo.corporateNumber must contain 13 digits.`);
      } else {
        corporateNumbers.push(basicInfo.corporateNumber);
      }
    }
  });

  for (const corporateNumber of findDuplicates(corporateNumbers)) {
    errors.push(`Duplicate corporation basicInfo.corporateNumber: ${corporateNumber}`);
  }

  for (const slug of findDuplicates(publicOfficerSlugs)) {
    errors.push(`Duplicate public officer slug: ${slug}`);
  }

  const contextSlugs = corporationContexts.map((context) => context.corporationSlug);
  for (const slug of findDuplicates(contextSlugs)) {
    errors.push(`Duplicate corporation editorial context: ${slug}`);
  }
  corporationContexts.forEach((context, index) => {
    const prefix = `data/editorial/corporation-contexts.json[${index}]`;
    if (!corporationSlugSet.has(context.corporationSlug)) {
      errors.push(`${prefix}.corporationSlug references unknown corporation: ${context.corporationSlug}`);
    }
    for (const [field, value] of [
      ["corporationSlug", context.corporationSlug],
      ["checkedAt", context.checkedAt],
      ["business.summary", context.business?.summary],
      ["business.officialWebsite.label", context.business?.officialWebsite?.label],
      ["business.officialWebsite.url", context.business?.officialWebsite?.url],
    ]) {
      if (!isNonEmptyString(value)) errors.push(`${prefix}.${field} is required.`);
    }
    if (!/^https:\/\//.test(context.business?.officialWebsite?.url ?? "")) {
      errors.push(`${prefix}.business.officialWebsite.url must be an HTTPS URL.`);
    }
    if (!Array.isArray(context.business?.details) || context.business.details.length === 0) {
      errors.push(`${prefix}.business.details must contain at least one item.`);
    }
    if (!Array.isArray(context.regulatoryTouchpoints) || context.regulatoryTouchpoints.length === 0) {
      errors.push(`${prefix}.regulatoryTouchpoints must contain at least one item.`);
    } else {
      context.regulatoryTouchpoints.forEach((touchpoint, touchpointIndex) => {
        for (const [field, value] of [
          ["agency", touchpoint.agency],
          ["area", touchpoint.area],
          ["description", touchpoint.description],
          ["sourceTitle", touchpoint.sourceTitle],
          ["sourceUrl", touchpoint.sourceUrl],
        ]) {
          if (!isNonEmptyString(value)) {
            errors.push(`${prefix}.regulatoryTouchpoints[${touchpointIndex}].${field} is required.`);
          }
        }
        if (!/^https:\/\//.test(touchpoint.sourceUrl ?? "")) {
          errors.push(`${prefix}.regulatoryTouchpoints[${touchpointIndex}].sourceUrl must be an HTTPS URL.`);
        }
      });
    }
    if (!Array.isArray(context.limitations) || context.limitations.length === 0) {
      errors.push(`${prefix}.limitations must contain at least one item.`);
    }
  });

  persons.forEach((person, index) => {
    const prefix = `persons.json[${index}]`;
    const requiredStrings = [
      ["person_slug", person.person_slug],
      ["name", person.name],
      ["fromMinistry", person.fromMinistry],
      ["previousPosition", person.previousPosition],
      ["corporationSlug", person.corporationSlug],
      ["corporationName", person.corporationName],
      ["newPosition", person.newPosition],
      ["retirementDate", person.retirementDate],
      ["reemploymentDate", person.reemploymentDate],
    ];

    for (const [field, value] of requiredStrings) {
      if (!isNonEmptyString(value)) errors.push(`${prefix}.${field} is required.`);
    }

    if (!isFiniteNumber(person.waitingDays)) {
      errors.push(`${prefix}.waitingDays must be a number.`);
    }

    if (!corporationSlugSet.has(person.corporationSlug)) {
      errors.push(`${prefix}.corporationSlug references unknown corporation: ${person.corporationSlug}`);
    }

    for (const sourceId of person.sources ?? []) {
      if (!sourceIds.has(sourceId)) errors.push(`${prefix}.sources references unknown source: ${sourceId}`);
    }
  });

  records.forEach((record, index) => {
    const prefix = `records.json[${index}]`;
    const requiredStrings = [
      ["rawId", record.rawId],
      ["dedupeKey", record.dedupeKey],
      ["personSlug", record.personSlug],
      ["name", record.name],
      ["fromMinistry", record.fromMinistry],
      ["previousPosition", record.previousPosition],
      ["corporationSlug", record.corporationSlug],
      ["corporationName", record.corporationName],
      ["newPosition", record.newPosition],
      ["retirementDate", record.retirementDate],
      ["reemploymentDate", record.reemploymentDate],
      ["sourceId", record.sourceId],
      ["sourceUrl", record.sourceUrl],
    ];

    for (const [field, value] of requiredStrings) {
      if (!isNonEmptyString(value)) errors.push(`${prefix}.${field} is required.`);
    }

    if (!isFiniteNumber(record.waitingDays)) {
      errors.push(`${prefix}.waitingDays must be a number.`);
    }

    if (!personSlugSet.has(record.personSlug)) {
      errors.push(`${prefix}.personSlug references unknown person: ${record.personSlug}`);
    }

    if (!corporationSlugSet.has(record.corporationSlug)) {
      errors.push(`${prefix}.corporationSlug references unknown corporation: ${record.corporationSlug}`);
    }

    if (!sourceIds.has(record.sourceId)) {
      errors.push(`${prefix}.sourceId references unknown source: ${record.sourceId}`);
    }
  });

  sources.forEach((source, index) => {
    const prefix = `sources.json[${index}]`;
    if (!isNonEmptyString(source.id)) errors.push(`${prefix}.id is required.`);
    if (!isNonEmptyString(source.title)) errors.push(`${prefix}.title is required.`);
    if (!isNonEmptyString(source.publisher)) errors.push(`${prefix}.publisher is required.`);
    if (!isNonEmptyString(source.url)) errors.push(`${prefix}.url is required.`);
  });

  const totals = rankings?.totals ?? {};
  for (const field of ["publicRecords", "corporations", "nextDayCorporations", "within30DaysCorporations"]) {
    if (!isFiniteNumber(totals[field])) errors.push(`rankings.json.totals.${field} must be a number.`);
  }

  const requiredRankingGroups = [
    ["totalReemploymentCount", "publicRecords"],
    ["nextDayReemploymentCount", "nextDay"],
    ["within30DaysReemploymentCount", "within30Days"],
    ["shortestAverageWaitingDays", "shortestAverageWaitingDays"],
  ];
  const rankingGroups = rankings?.rankings ?? {};

  if (rankings?.rankings === undefined || rankings?.rankings === null) {
    errors.push("rankings.json.rankings is required.");
  }

  for (const [groupName, dataKey] of requiredRankingGroups) {
    if (!Object.prototype.hasOwnProperty.call(rankingGroups, dataKey)) {
      errors.push(`rankings.json.rankings.${dataKey} (${groupName}) is required.`);
      continue;
    }

    if (Array.isArray(rankingGroups[dataKey]) && rankingGroups[dataKey].length === 0) {
      errors.push(`rankings.json.rankings.${dataKey} (${groupName}) must not be empty.`);
    }
  }

  for (const [groupName, items] of Object.entries(rankingGroups)) {
    if (!Array.isArray(items)) {
      errors.push(`rankings.json.rankings.${groupName} must contain an array.`);
      continue;
    }

    items.forEach((item, index) => {
      const prefix = `rankings.json.rankings.${groupName}[${index}]`;
      if (!isNonEmptyString(item.corporationSlug)) {
        errors.push(`${prefix}.corporationSlug is required.`);
      } else if (!corporationSlugSet.has(item.corporationSlug)) {
        errors.push(`${prefix}.corporationSlug references unknown corporation: ${item.corporationSlug}`);
      }

      if (!isFiniteNumber(item.value)) errors.push(`${prefix}.value must be a number.`);
    });
  }

  topics.forEach((topic, index) => {
    const prefix = `topics.json[${index}]`;
    if (!isNonEmptyString(topic.category)) errors.push(`${prefix}.category is required.`);
    if (!isNonEmptyString(topic.label)) errors.push(`${prefix}.label is required.`);
    if (!Array.isArray(topic.items) || topic.items.some((item) => !isNonEmptyString(item))) {
      errors.push(`${prefix}.items must contain non-empty strings.`);
    }
  });

  const metaNumericFields = [
    ["productionRecordCount", meta.productionRecordCount, records.length],
    ["corporationCount", meta.corporationCount, corporations.length],
    ["personCount", meta.personCount, persons.length],
    ["rankingCount", meta.rankingCount, Object.keys(rankingGroups).length],
  ];

  if (!isNonEmptyString(meta.lastUpdated)) errors.push("meta.json.lastUpdated is required.");
  if (!isNonEmptyString(meta.sourceDescription)) errors.push("meta.json.sourceDescription is required.");
  if (!isNonEmptyString(meta.note)) errors.push("meta.json.note is required.");

  for (const [field, actual, expected] of metaNumericFields) {
    if (!isFiniteNumber(actual)) {
      errors.push(`meta.json.${field} must be a number.`);
    } else if (actual !== expected) {
      errors.push(`meta.json.${field} (${actual}) does not match actual count (${expected}).`);
    }
  }

  return errors;
}

const errors = validateData();

if (errors.length > 0) {
  console.error(`Data validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Data validation passed.");
}
})();
