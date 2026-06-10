(() => {
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const XLSX = require("xlsx");

const DEFAULT_LIMIT = 10;
const SOURCE_TYPE = "cabinet-office-annual-excel";

const FIELD_ALIASES = {
  recordNumber: ["番号", "No.", "No"],
  personName: ["氏名", "名前"],
  originMinistry: [
    "府省庁",
    "元府省庁",
    "府省庁名",
    "府省名",
    "府省等名",
    "出身府省庁",
    "離職時の府省庁",
  ],
  titleAtRetirement: [
    "退職時役職",
    "退職時の役職",
    "退職時の官職",
    "離職時の官職",
    "離職時官職",
    "離職時の役職",
    "官職",
  ],
  retirementDate: ["退職日", "離職日", "離職年月日"],
  reemploymentDate: ["再就職日", "再就職年月日", "就職日"],
  corporationName: ["再就職先法人名", "再就職先の名称", "再就職先名称", "再就職先", "法人名"],
  corporationType: ["法人種別", "法人区分", "再就職先の区分", "再就職先区分"],
  newPosition: ["再就職先役職", "再就職先における地位", "再就職先での役職", "再就職後の役職"],
  publicationDate: ["公表日", "公表年月日"],
  remarks: ["備考", "注記"],
};

const REQUIRED_COLUMN_FIELDS = [
  { field: "personName", label: "氏名 / 名前" },
  { field: "titleAtRetirement", label: "退職時役職 / 官職" },
  { field: "corporationName", label: "再就職先 / 法人名" },
  { field: "reemploymentDate", label: "再就職日 / 就職日" },
];

const REQUIRED_RECORD_FIELDS = [
  { field: "personName", label: "氏名" },
  { field: "originMinistry", label: "元府省庁" },
  { field: "titleAtRetirement", label: "退職時役職" },
  { field: "corporationName", label: "再就職先法人名" },
  { field: "reemploymentDate", label: "再就職日" },
];

function usage() {
  console.error(
    [
      "Usage:",
      '  npm run import:excel -- --file "path/to/file.xlsx" --limit 10',
      "",
      "Options:",
      "  --file   Local .xlsx or .xls file to import (required)",
      `  --limit  Maximum records to write (default: ${DEFAULT_LIMIT})`,
      "  --all    Import every data row",
      "  --output          Output JSON path (optional)",
      "  --source-id       Source identifier stored in each record",
      "  --source-url      Source URL stored in each record",
      "  --source-title    Source title stored in each record",
      "  --published-date  Publication date stored in each record (YYYY-MM-DD)",
    ].join("\n"),
  );
}

function parseArguments(argv) {
  const options = {
    limit: DEFAULT_LIMIT,
    sourceId: "",
    sourceUrl: "",
    sourceTitle: "",
    publishedDate: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--file") {
      options.file = argv[index + 1];
      index += 1;
    } else if (argument === "--limit") {
      options.limit = Number(argv[index + 1]);
      index += 1;
    } else if (argument === "--all") {
      options.all = true;
    } else if (argument === "--output") {
      options.output = argv[index + 1];
      index += 1;
    } else if (argument === "--source-id") {
      options.sourceId = argv[index + 1] ?? "";
      index += 1;
    } else if (argument === "--source-url") {
      options.sourceUrl = argv[index + 1] ?? "";
      index += 1;
    } else if (argument === "--source-title") {
      options.sourceTitle = argv[index + 1] ?? "";
      index += 1;
    } else if (argument === "--published-date") {
      options.publishedDate = argv[index + 1] ?? "";
      index += 1;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!Number.isInteger(options.limit) || options.limit < 1) {
    throw new Error("--limit must be a positive integer.");
  }
  if (options.all) options.limit = null;
  if (
    options.publishedDate &&
    !/^\d{4}-\d{2}-\d{2}$/.test(options.publishedDate)
  ) {
    throw new Error("--published-date must use YYYY-MM-DD format.");
  }

  return options;
}

function cleanString(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeHeader(value) {
  return cleanString(value)
    .normalize("NFKC")
    .replace(/[\s　・･:：()（）【】［］\[\]]/g, "")
    .replace(/注\d+$/g, "")
    .toLowerCase();
}

const NORMALIZED_ALIASES = Object.fromEntries(
  Object.entries(FIELD_ALIASES).map(([field, aliases]) => [
    field,
    aliases.map((alias) => normalizeHeader(alias)),
  ]),
);

function findFieldForHeader(header) {
  const normalized = normalizeHeader(header);
  if (!normalized) return null;

  for (const [field, aliases] of Object.entries(NORMALIZED_ALIASES)) {
    if (aliases.includes(normalized)) return field;
  }

  return null;
}

function findHeaderRow(rows) {
  let best = null;
  const scanLimit = Math.min(rows.length, 40);

  for (let rowIndex = 0; rowIndex < scanLimit; rowIndex += 1) {
    const fields = new Set(rows[rowIndex].map(findFieldForHeader).filter(Boolean));
    const requiredMatches = ["personName", "corporationName"].filter((field) =>
      fields.has(field),
    ).length;
    const score = fields.size + requiredMatches * 3;

    if (!best || score > best.score) {
      best = { rowIndex, fields, score };
    }
  }

  if (
    !best ||
    !best.fields.has("personName") ||
    !best.fields.has("corporationName")
  ) {
    throw new Error(
      "Could not find a header row containing both a person-name column and a reemployment corporation column.",
    );
  }

  return best.rowIndex;
}

function buildColumnMap(headerRow) {
  const columnMap = {};

  headerRow.forEach((header, columnIndex) => {
    const field = findFieldForHeader(header);
    if (field && columnMap[field] === undefined) {
      columnMap[field] = columnIndex;
    }
  });

  return columnMap;
}

function findMissingRequiredColumns(columnMap) {
  return REQUIRED_COLUMN_FIELDS.filter(
    ({ field }) => columnMap[field] === undefined,
  );
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function formatDateParts(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${pad(month)}-${pad(day)}`;
}

function parseJapaneseEraDate(value) {
  const normalized = cleanString(value).normalize("NFKC");
  const match = normalized.match(
    /^(令和|平成|昭和)\s*(元|\d{1,2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日?$/,
  );
  if (!match) return null;

  const eraStart = { 令和: 2018, 平成: 1988, 昭和: 1925 };
  const eraYear = match[2] === "元" ? 1 : Number(match[2]);
  return formatDateParts(
    eraStart[match[1]] + eraYear,
    Number(match[3]),
    Number(match[4]),
  );
}

function parseDate(value) {
  if (value === null || value === undefined || cleanString(value) === "") {
    return { value: null, warning: null };
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      value: formatDateParts(
        value.getFullYear(),
        value.getMonth() + 1,
        value.getDate(),
      ),
      warning: null,
    };
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return {
        value: formatDateParts(parsed.y, parsed.m, parsed.d),
        warning: null,
      };
    }
  }

  const text = cleanString(value).normalize("NFKC");
  const eraDate = parseJapaneseEraDate(text);
  if (eraDate) return { value: eraDate, warning: null };

  const numericDate = text.match(
    /^(\d{4})[年./-]\s*(\d{1,2})[月./-]\s*(\d{1,2})日?$/,
  );
  if (numericDate) {
    const formatted = formatDateParts(
      Number(numericDate[1]),
      Number(numericDate[2]),
      Number(numericDate[3]),
    );
    if (formatted) return { value: formatted, warning: null };
  }

  return {
    value: null,
    warning: `Could not parse date value: "${text}"`,
  };
}

function calculateWaitingDays(retirementDate, reemploymentDate) {
  if (!retirementDate || !reemploymentDate) return null;
  const milliseconds =
    Date.parse(`${reemploymentDate}T00:00:00Z`) -
    Date.parse(`${retirementDate}T00:00:00Z`);
  return Math.round(milliseconds / 86_400_000);
}

function createId(parts) {
  return crypto
    .createHash("sha256")
    .update(parts.map((part) => cleanString(part)).join("\u001f"), "utf8")
    .digest("hex");
}

function rowValue(row, columnMap, field) {
  const columnIndex = columnMap[field];
  return columnIndex === undefined ? "" : row[columnIndex];
}

function inferOriginMinistry(titleAtRetirement) {
  if (
    /^(?:北海道|東北|関東|中部|近畿|中国四国|九州)管区警察/.test(
      titleAtRetirement,
    )
  ) {
    return "警察庁";
  }
  if (/^消防庁/.test(titleAtRetirement)) return "総務省";
  if (/^(?:独立行政法人統計センター)/.test(titleAtRetirement)) return "総務省";
  if (
    /^(?:最高検察庁|.+高等検察庁|.+地方検察庁|.+区検察庁|.+刑務所|.+拘置所|.+少年刑務所|.+少年鑑別所|.+少年院|法務局|.+法務局|国立武蔵野学院|.+地方更生保護委員会|法務総合研究所)/.test(
      titleAtRetirement,
    )
  ) {
    return "法務省";
  }
  if (
    /^(?:財務総合政策研究所|.+財務局|.+財務支局|.+税関|国税庁|.+国税局)/.test(
      titleAtRetirement,
    )
  ) {
    return "財務省";
  }
  if (/^科学技術・学術政策研究所/.test(titleAtRetirement)) return "文部科学省";
  if (
    /^(?:国立障害者リハビリテーションセンター|.+検疫所|国立社会保障・人口問題研究所|国立.+療養所|国立感染症研究所|国立医薬品食品衛生研究所)/.test(
      titleAtRetirement,
    )
  ) {
    return "厚生労働省";
  }
  if (/^(?:.+森林管理局|動物検疫所)/.test(titleAtRetirement)) {
    return "農林水産省";
  }
  if (/^(?:特許庁|中小企業庁|.+経済産業局)/.test(titleAtRetirement)) {
    return "経済産業省";
  }
  if (
    /^(?:海上保安庁|運輸安全委員会|海難審判所|国土技術政策総合研究所|.+運輸局|神戸運輸監理部)/.test(
      titleAtRetirement,
    )
  ) {
    return "国土交通省";
  }

  const authorities = [
    "内閣官房",
    "内閣法制局",
    "人事院",
    "内閣府",
    "宮内庁",
    "公正取引委員会",
    "国家公安委員会",
    "個人情報保護委員会",
    "カジノ管理委員会",
    "金融庁",
    "消費者庁",
    "こども家庭庁",
    "デジタル庁",
    "復興庁",
    "警察庁",
    "総務省",
    "法務省",
    "外務省",
    "財務省",
    "文部科学省",
    "厚生労働省",
    "農林水産省",
    "経済産業省",
    "国土交通省",
    "環境省",
    "原子力規制委員会",
    "防衛省",
    "会計検査院",
  ];
  return authorities.find((authority) => titleAtRetirement.startsWith(authority)) ?? "";
}

function inferCorporationType(corporationName) {
  const rules = [
    ["独立行政法人", "独立行政法人"],
    ["国立大学法人", "国立大学法人"],
    ["公益社団法人", "公益社団法人"],
    ["公益財団法人", "公益財団法人"],
    ["一般社団法人", "一般社団法人"],
    ["一般財団法人", "一般財団法人"],
    ["学校法人", "学校法人"],
    ["社会福祉法人", "社会福祉法人"],
    ["更生保護法人", "更生保護法人"],
    ["医療法人", "医療法人"],
    ["弁護士法人", "弁護士法人"],
    ["監査法人", "監査法人"],
    ["株式会社", "営利法人"],
    ["合同会社", "営利法人"],
  ];

  for (const [legalForm, type] of rules) {
    if (corporationName.includes(legalForm)) return type;
  }
  if (/\b(?:Ltd\.?|Limited|Inc\.?|Corporation|Corp\.?)\b/i.test(corporationName)) {
    return "営利法人";
  }
  return "";
}

function convertRow(
  row,
  columnMap,
  sourceTitle,
  sourceId,
  sourceUrl,
  publishedDate,
) {
  const personName = cleanString(rowValue(row, columnMap, "personName"));
  const titleAtRetirement = cleanString(
    rowValue(row, columnMap, "titleAtRetirement"),
  );
  const sourceOriginMinistry = cleanString(
    rowValue(row, columnMap, "originMinistry"),
  );
  const originMinistry =
    sourceOriginMinistry || inferOriginMinistry(titleAtRetirement);
  const corporationName = cleanString(
    rowValue(row, columnMap, "corporationName"),
  );
  const sourceCorporationType = cleanString(
    rowValue(row, columnMap, "corporationType"),
  );
  const corporationType =
    sourceCorporationType || inferCorporationType(corporationName);
  const newPosition = cleanString(rowValue(row, columnMap, "newPosition"));
  const retirementDateResult = parseDate(
    rowValue(row, columnMap, "retirementDate"),
  );
  const reemploymentDateResult = parseDate(
    rowValue(row, columnMap, "reemploymentDate"),
  );
  const publicationDateResult = parseDate(
    rowValue(row, columnMap, "publicationDate"),
  );
  const retirementDate = retirementDateResult.value;
  const reemploymentDate = reemploymentDateResult.value;
  const recordPublishedDate = publishedDate || publicationDateResult.value;
  const remarks = cleanString(rowValue(row, columnMap, "remarks"));
  const notes = [
    retirementDateResult.warning,
    reemploymentDateResult.warning,
    publicationDateResult.warning,
  ].filter(Boolean);

  if (remarks) notes.push(`備考: ${remarks}`);

  if (columnMap.retirementDate === undefined) {
    notes.push("Retirement date source column was not found.");
  }
  if (columnMap.reemploymentDate === undefined) {
    notes.push("Reemployment date source column was not found.");
  }
  if (
    columnMap.originMinistry === undefined &&
    originMinistry
  ) {
    notes.push("Origin ministry was inferred from the retirement title.");
  } else if (columnMap.originMinistry === undefined) {
    notes.push("Origin ministry source column was not found and could not be inferred.");
  }
  if (
    columnMap.corporationType === undefined &&
    corporationType
  ) {
    notes.push("Corporation type was inferred from the corporation name.");
  } else if (columnMap.corporationType === undefined) {
    notes.push("Corporation type source column was not found and could not be inferred.");
  }
  const waitingDays = calculateWaitingDays(retirementDate, reemploymentDate);

  if (waitingDays !== null && waitingDays < 0) {
    notes.push("Reemployment date is earlier than retirement date.");
  }

  const dedupeParts = [
    personName,
    originMinistry,
    titleAtRetirement,
    corporationName,
    reemploymentDate ?? "",
  ];

  return {
    rawId: createId([...dedupeParts, sourceUrl]),
    dedupeKey: createId(dedupeParts),
    personName,
    originMinistry,
    titleAtRetirement,
    retirementDate,
    reemploymentDate,
    waitingDays,
    corporationName,
    corporationType,
    newPosition,
    sourceTitle,
    sourceName: sourceTitle,
    sourceId,
    sourceUrl,
    publishedDate: recordPublishedDate,
    flags: {
      nextDay: waitingDays === 0,
      within30Days:
        waitingDays !== null && waitingDays >= 0 && waitingDays <= 30,
    },
    status: "draft",
    approved: false,
    notes,
  };
}

function findMissingRequiredRecordValues(record) {
  return REQUIRED_RECORD_FIELDS.filter(
    ({ field }) => !cleanString(record[field]),
  );
}

function isDataRow(row, columnMap) {
  if (columnMap.recordNumber !== undefined) {
    const recordNumber = rowValue(row, columnMap, "recordNumber");
    return (
      (typeof recordNumber === "number" && Number.isFinite(recordNumber)) ||
      /^\d+$/.test(cleanString(recordNumber))
    );
  }

  return Boolean(
    cleanString(rowValue(row, columnMap, "personName")) ||
      cleanString(rowValue(row, columnMap, "corporationName")),
  );
}

function validateRecords(records) {
  const errors = [];
  const rawIds = new Set();
  const dedupeKeys = new Set();

  records.forEach((record, index) => {
    if (!record.personName) errors.push(`records[${index}].personName is empty.`);
    if (!record.corporationName) {
      errors.push(`records[${index}].corporationName is empty.`);
    }
    if (!record.originMinistry) {
      errors.push(`records[${index}].originMinistry is empty.`);
    }
    if (!record.titleAtRetirement) {
      errors.push(`records[${index}].titleAtRetirement is empty.`);
    }
    if (!record.reemploymentDate) {
      errors.push(`records[${index}].reemploymentDate is empty.`);
    }
    if (!record.sourceName) {
      errors.push(`records[${index}].sourceName is empty.`);
    }
    if (record.status !== "draft") {
      errors.push(`records[${index}].status must be draft.`);
    }
    if (record.approved !== false) {
      errors.push(`records[${index}].approved must be false.`);
    }
    if (rawIds.has(record.rawId)) {
      errors.push(`records[${index}].rawId is duplicated.`);
    }
    if (dedupeKeys.has(record.dedupeKey)) {
      errors.push(`records[${index}].dedupeKey is duplicated.`);
    }
    rawIds.add(record.rawId);
    dedupeKeys.add(record.dedupeKey);
  });

  if (errors.length > 0) {
    throw new Error(`Draft validation failed:\n- ${errors.join("\n- ")}`);
  }
}

function localDateParts(date = new Date()) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return {
    iso: `${year}-${month}-${day}`,
    compact: `${year}${month}${day}`,
  };
}

function importExcel(filePath, options) {
  const {
    limit,
    output,
    sourceId,
    sourceUrl,
    sourceTitle: configuredSourceTitle,
    publishedDate,
  } = options;
  const resolvedFilePath = path.resolve(filePath);
  if (!fs.existsSync(resolvedFilePath)) {
    throw new Error(`Excel file not found: ${resolvedFilePath}`);
  }
  if (![".xlsx", ".xls"].includes(path.extname(resolvedFilePath).toLowerCase())) {
    throw new Error("Unsupported file type. Use a local .xlsx or .xls file.");
  }

  let workbook;
  try {
    workbook = XLSX.readFile(resolvedFilePath, {
      cellDates: true,
      raw: true,
    });
  } catch (error) {
    throw new Error(`Failed to read Excel file: ${error.message}`);
  }

  if (workbook.SheetNames.length === 0) {
    throw new Error("The Excel workbook contains no sheets.");
  }

  let selectedSheet = null;
  for (const candidateSheetName of workbook.SheetNames) {
    const candidateRows = XLSX.utils.sheet_to_json(
      workbook.Sheets[candidateSheetName],
      {
        header: 1,
        defval: "",
        raw: true,
      },
    );
    if (candidateRows.length === 0) continue;

    try {
      selectedSheet = {
        name: candidateSheetName,
        rows: candidateRows,
        headerRowIndex: findHeaderRow(candidateRows),
      };
      break;
    } catch {
      // Annual workbooks may contain cover or notes sheets before the data sheet.
    }
  }

  if (!selectedSheet) {
    throw new Error(
      "Could not find a sheet with both a person-name column and a reemployment corporation column.",
    );
  }

  const { name: sheetName, rows, headerRowIndex } = selectedSheet;
  const columnMap = buildColumnMap(rows[headerRowIndex]);
  const missingRequiredColumns = findMissingRequiredColumns(columnMap);
  if (missingRequiredColumns.length > 0) {
    const details = missingRequiredColumns
      .map(
        ({ field, label }) =>
          `${label} (${FIELD_ALIASES[field].join(", ")})`,
      )
      .join("; ");
    throw new Error(`Missing required Excel columns: ${details}`);
  }

  const sourceTitle = configuredSourceTitle || path.basename(resolvedFilePath);
  const dataRows = rows
    .slice(headerRowIndex + 1)
    .filter((row) => isDataRow(row, columnMap));
  const records = [];
  const skippedRows = [];
  const importedDedupeKeys = new Set();
  let duplicateRowCount = 0;
  let processedRowCount = 0;

  for (
    let index = 0;
    index < dataRows.length && (limit === null || records.length < limit);
    index += 1
  ) {
    const record = convertRow(
      dataRows[index],
      columnMap,
      sourceTitle,
      sourceId,
      sourceUrl,
      publishedDate,
    );
    const missingValues = findMissingRequiredRecordValues(record);

    processedRowCount += 1;
    if (missingValues.length > 0) {
      skippedRows.push({
        row: headerRowIndex + index + 2,
        missing: missingValues.map(({ label }) => label),
      });
      continue;
    }
    if (importedDedupeKeys.has(record.dedupeKey)) {
      duplicateRowCount += 1;
      skippedRows.push({
        row: headerRowIndex + index + 2,
        missing: ["Excel内の重複候補"],
      });
      continue;
    }

    importedDedupeKeys.add(record.dedupeKey);
    records.push(record);
  }

  if (records.length === 0) {
    throw new Error("No data rows were found below the detected header row.");
  }

  validateRecords(records);

  const productionRecordsPath = path.join(
    process.cwd(),
    "data",
    "production",
    "records.json",
  );
  const productionDedupeKeys = fs.existsSync(productionRecordsPath)
    ? new Set(readJson(productionRecordsPath).map((record) => record.dedupeKey))
    : new Set();
  const productionDuplicateCount = records.filter((record) =>
    productionDedupeKeys.has(record.dedupeKey),
  ).length;
  const duplicateCandidateCount =
    duplicateRowCount + productionDuplicateCount;

  const today = localDateParts();
  const outputDocument = {
    sourceType: SOURCE_TYPE,
    status: "draft",
    approved: false,
    createdAt: today.iso,
    limit: limit ?? records.length,
    rowsRead: dataRows.length,
    draftCount: records.length,
    skippedCount: skippedRows.length,
    duplicateCandidateCount,
    sources: sourceId
      ? [
          {
            id: sourceId,
            title: sourceTitle,
            publisher: "内閣官房",
            url: sourceUrl,
            publishedAt: publishedDate,
            memo: "国家公務員法第106条の25第1項等に基づく報告",
          },
        ]
      : [],
    records,
  };
  const outputDirectory = path.join(process.cwd(), "data", "draft");
  const outputSuffix = limit === null ? "all" : `sample${limit}`;
  const outputPath = output
    ? path.resolve(output)
    : path.join(
        outputDirectory,
        `${today.compact}_cabinet-office_reemployment_${outputSuffix}.json`,
      );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(outputDocument, null, 2)}\n`,
    "utf8",
  );

  const remainingRowCount = Math.max(0, dataRows.length - processedRowCount);
  console.log("Excel import completed.");
  console.log(`Input file: ${resolvedFilePath}`);
  console.log(`Sheet: ${sheetName}`);
  console.log(`Rows read: ${dataRows.length}`);
  console.log(`Draft records: ${records.length}`);
  console.log(`Skipped rows: ${skippedRows.length}`);
  console.log(`Duplicate candidates: ${duplicateCandidateCount}`);
  for (const skipped of skippedRows) {
    console.log(`  - Row ${skipped.row}: missing ${skipped.missing.join(", ")}`);
  }
  if (remainingRowCount > 0) {
    console.log(`Rows not processed after reaching limit: ${remainingRowCount}`);
  }
  console.log(`Output file: ${path.relative(process.cwd(), outputPath)}`);
  if (!sourceUrl) {
    console.warn("Warning: --source-url was not provided; sourceUrl is empty.");
  }
  if (limit !== null && records.length < limit) {
    console.warn(
      `Warning: requested ${limit} record(s), but only ${records.length} data row(s) were found.`,
    );
  }
}

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.help || !options.file) {
    usage();
    process.exitCode = options.help ? 0 : 1;
  } else {
    importExcel(options.file, options);
  }
} catch (error) {
  console.error(`Excel import failed: ${error.message}`);
  usage();
  process.exitCode = 1;
}
})();
