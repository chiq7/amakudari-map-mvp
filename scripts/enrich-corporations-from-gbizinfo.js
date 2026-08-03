(() => {
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;
const API_TOKEN_ENV = "GBIZINFO_API_TOKEN";
const GBIZINFO_API_URL = "https://api.info.gbiz.go.jp/hojin/v2/hojin";
const NTA_SEARCH_URL = "https://www.houjin-bangou.nta.go.jp/";
const NTA_RESULT_URL =
  "https://www.houjin-bangou.nta.go.jp/kensaku-kekka.html";
const LEGAL_FORMS = [
  "株式会社",
  "有限会社",
  "合同会社",
  "合名会社",
  "合資会社",
  "一般社団法人",
  "一般財団法人",
  "公益社団法人",
  "公益財団法人",
  "学校法人",
  "社会福祉法人",
  "医療法人社団",
  "医療法人財団",
  "医療法人",
  "国立大学法人",
  "独立行政法人",
  "地方独立行政法人",
  "弁護士法人",
  "監査法人",
  "有限責任監査法人",
];

function usage() {
  console.log(
    [
      "Usage:",
      '  npm run enrich:corporations -- --file "data/draft/example.json" --dry-run',
      '  npm run enrich:corporations -- --file "data/draft/example.json" --apply',
      "  npm run enrich:corporations -- --production --dry-run --limit 30",
      "  npm run enrich:corporations -- --production --apply --limit 30",
      "",
      "Options:",
      "  --file PATH            Enrich corporation names in a draft JSON",
      "  --production           Enrich data/production/corporations.json",
      "  --dry-run              Report without writing (default)",
      "  --apply                Write an enriched draft or production files",
      `  --limit NUMBER         Maximum corporation names to process (default: ${DEFAULT_LIMIT}, max: ${MAX_LIMIT})`,
      "  --output PATH          Draft enriched output path",
      "  --review-output PATH   Review-needed output path",
      "  --offline              Use existing production data only",
      "  --delay-ms NUMBER      Delay between official searches (default: 150)",
      "",
      `Optional environment: ${API_TOKEN_ENV}`,
      "  Without the token, corporate-number information can still be used,",
      "  but gBizINFO detail fields are only copied from existing local data.",
    ].join("\n"),
  );
}

function parseArguments(argv) {
  const options = {
    apply: false,
    limit: DEFAULT_LIMIT,
    delayMs: 150,
    offline: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--file") {
      options.file = argv[index + 1];
      index += 1;
    } else if (argument === "--production") {
      options.production = true;
    } else if (argument === "--apply") {
      options.apply = true;
    } else if (argument === "--dry-run") {
      options.apply = false;
    } else if (argument === "--limit") {
      options.limit = Number(argv[index + 1]);
      index += 1;
    } else if (argument === "--output") {
      options.output = argv[index + 1];
      index += 1;
    } else if (argument === "--review-output") {
      options.reviewOutput = argv[index + 1];
      index += 1;
    } else if (argument === "--offline") {
      options.offline = true;
    } else if (argument === "--delay-ms") {
      options.delayMs = Number(argv[index + 1]);
      index += 1;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (options.file && options.production) {
    throw new Error("Use either --file or --production, not both.");
  }
  if (!options.help && !options.file && !options.production) {
    throw new Error("--file or --production is required.");
  }
  if (
    !Number.isInteger(options.limit) ||
    options.limit < 1 ||
    options.limit > MAX_LIMIT
  ) {
    throw new Error(`--limit must be an integer from 1 to ${MAX_LIMIT}.`);
  }
  if (!Number.isInteger(options.delayMs) || options.delayMs < 0) {
    throw new Error("--delay-ms must be a non-negative integer.");
  }
  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeExactName(value) {
  return clean(value)
    .normalize("NFKC")
    .replace(/[\s\u3000・･.,，．'’"`´()（）［\][\]{}「」『』]/g, "")
    .toUpperCase();
}

function legalForm(value) {
  const normalized = clean(value).normalize("NFKC").replace(/\s+/g, "");
  return LEGAL_FORMS.find(
    (form) => normalized.startsWith(form) || normalized.endsWith(form),
  ) ?? "";
}

function normalizeComparableName(value) {
  let normalized = normalizeExactName(value);
  for (const form of LEGAL_FORMS) {
    const normalizedForm = normalizeExactName(form);
    if (normalized.startsWith(normalizedForm)) {
      normalized = normalized.slice(normalizedForm.length);
    }
    if (normalized.endsWith(normalizedForm)) {
      normalized = normalized.slice(0, -normalizedForm.length);
    }
  }
  return normalized;
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function textContent(value) {
  return decodeHtml(
    value
      .replace(/<div class="furigana">[\s\S]*?<\/div>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function splitAddress(address) {
  const prefectureMatch = clean(address).match(
    /^(東京都|北海道|(?:京都|大阪)府|.{2,3}県)/,
  );
  const prefecture = prefectureMatch?.[1] ?? "";
  const remainder = prefecture ? address.slice(prefecture.length) : address;
  const cityMatch = remainder.match(/^(.+?(?:市|区|町|村))(?:[^市区町村]|$)/);
  return { prefecture, city: cityMatch?.[1] ?? "" };
}

function readApiToken() {
  const environmentToken = process.env[API_TOKEN_ENV]?.trim();
  if (environmentToken) return environmentToken;
  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envLocalPath)) return "";
  const line = fs
    .readFileSync(envLocalPath, "utf8")
    .split(/\r?\n/)
    .filter((candidate) =>
      candidate.match(new RegExp(`^\\s*${API_TOKEN_ENV}\\s*=`)),
    )
    .at(-1);
  return line
    ? line
        .slice(line.indexOf("=") + 1)
        .trim()
        .replace(/^(['"])(.*)\1$/, "$2")
    : "";
}

function localCandidates(corporations) {
  return corporations
    .filter((corporation) =>
      /^\d{13}$/.test(corporation.basicInfo?.corporateNumber ?? ""),
    )
    .map((corporation) => ({
      corporateNumber: corporation.basicInfo.corporateNumber,
      officialName: corporation.basicInfo.officialName,
      registeredAddress: corporation.basicInfo.registeredAddress,
      prefecture: corporation.basicInfo.prefecture,
      city: corporation.basicInfo.city,
      sourceName: corporation.basicInfo.sourceName,
      sourceUrl: corporation.basicInfo.sourceUrl,
      gbizInfo: corporation.gbizInfo,
      aliases: [corporation.name, ...(corporation.aliases ?? [])],
      origin: "production",
    }));
}

function findLocalMatches(name, candidates) {
  const exact = normalizeExactName(name);
  const comparable = normalizeComparableName(name);
  return candidates.filter((candidate) =>
    [candidate.officialName, ...candidate.aliases].some(
      (candidateName) =>
        normalizeExactName(candidateName) === exact ||
        normalizeComparableName(candidateName) === comparable,
    ),
  );
}

function parseSearchResults(html) {
  const tableMatch = html.match(
    /<div class="tbl01">[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i,
  );
  if (!tableMatch) return [];
  const rows = [];
  for (const match of tableMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
    const cells = [
      ...match[1].matchAll(
        /<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi,
      ),
    ];
    if (cells.length < 3) continue;
    const corporateNumber =
      textContent(cells[0][1]).match(/\d{13}/)?.[0] ?? "";
    const officialName = textContent(cells[1][1]);
    const registeredAddress = textContent(cells[2][1]);
    if (!corporateNumber || !officialName || !registeredAddress) continue;
    rows.push({
      corporateNumber,
      officialName,
      registeredAddress,
      ...splitAddress(registeredAddress),
      sourceName: "国税庁法人番号公表サイト",
      sourceUrl: `https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHouzinNo=${corporateNumber}`,
      origin: "nta",
    });
  }
  return rows;
}

async function createSearchSession() {
  const response = await fetch(NTA_SEARCH_URL, {
    headers: { "user-agent": "amakudari-map-mvp/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Official search page returned HTTP ${response.status}.`);
  }
  const html = await response.text();
  const token = html.match(
    /name="jp\.go\.nta\.houjin_bangou\.framework\.web\.common\.CNSFWTokenProcessor\.request\.token" value="([^"]+)"/,
  )?.[1];
  if (!token) throw new Error("Could not read the official search token.");
  const cookie =
    response.headers
      .getSetCookie?.()
      .map((value) => value.split(";")[0])
      .join("; ") ??
    response.headers.get("set-cookie")?.split(";")[0] ??
    "";
  return { token, cookie };
}

async function searchNta(session, corporationName) {
  const body = new URLSearchParams({
    "jp.go.nta.houjin_bangou.framework.web.common.CNSFWTokenProcessor.request.token":
      session.token,
    houzinNmShTypeRbtn: "2",
    houzinNmTxtf: corporationName,
    noconvCkbx: "2",
    _noconvCkbx: "on",
    houzinAddrShTypeRbtn: "1",
    houzinNoShTyoumeSts: "0",
    houzinNoShSonotaZyoukenSts: "0",
    closeCkbx: "1",
    _closeCkbx: "on",
    orderRbtn: "1",
    searchFlg: "1",
    preSyousaiScreenId: "KJSCR0101010",
  });
  const response = await fetch(NTA_RESULT_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: session.cookie,
      "user-agent": "amakudari-map-mvp/1.0",
    },
    body,
  });
  if (!response.ok) {
    throw new Error(
      `Official search returned HTTP ${response.status} for "${corporationName}".`,
    );
  }
  return parseSearchResults(await response.text());
}

function uniqueCandidates(candidates) {
  const byNumber = new Map();
  for (const candidate of candidates) {
    const existing = byNumber.get(candidate.corporateNumber);
    byNumber.set(candidate.corporateNumber, {
      ...candidate,
      gbizInfo: candidate.gbizInfo ?? existing?.gbizInfo,
    });
  }
  return [...byNumber.values()];
}

function classifyMatch(inputName, candidates) {
  const exactName = normalizeExactName(inputName);
  const comparableName = normalizeComparableName(inputName);
  const inputForm = legalForm(inputName);
  if (candidates.length > 1) {
    return {
      status: "review-needed",
      reason: "multiple-candidates",
      candidates,
    };
  }
  const exactMatches = candidates.filter(
    (candidate) => normalizeExactName(candidate.officialName) === exactName,
  );
  const normalizedMatches = candidates.filter(
    (candidate) =>
      normalizeComparableName(candidate.officialName) === comparableName,
  );
  const choose = (matches, matchedBy) => {
    if (matches.length !== 1) return null;
    const candidateForm = legalForm(matches[0].officialName);
    if (inputForm && candidateForm && inputForm !== candidateForm) {
      return {
        status: "review-needed",
        reason: "legal-form-mismatch",
        candidates: matches,
      };
    }
    if (!clean(matches[0].registeredAddress)) {
      return {
        status: "review-needed",
        reason: "address-missing",
        candidates: matches,
      };
    }
    return {
      status: "auto-enrich",
      matchedBy,
      candidate: matches[0],
      candidates: [],
    };
  };

  if (exactMatches.length === 1) return choose(exactMatches, "exact");
  if (exactMatches.length > 1) {
    return {
      status: "review-needed",
      reason: "multiple-exact-candidates",
      candidates: exactMatches,
    };
  }
  if (normalizedMatches.length === 1) {
    return choose(normalizedMatches, "normalized");
  }
  if (normalizedMatches.length > 1) {
    return {
      status: "review-needed",
      reason: "multiple-normalized-candidates",
      candidates: normalizedMatches,
    };
  }
  if (candidates.length > 0) {
    return {
      status: "review-needed",
      reason: "low-confidence-name-match",
      candidates,
    };
  }
  return { status: "not-found", reason: "no-candidate", candidates: [] };
}

async function fetchGbizInfo(corporateNumber, apiToken) {
  if (!apiToken) return null;
  const response = await fetch(
    `${GBIZINFO_API_URL}/${encodeURIComponent(corporateNumber)}`,
    {
      headers: {
        "X-hojinInfo-api-token": apiToken,
        accept: "application/json",
        "user-agent": "amakudari-map-mvp/1.0",
      },
    },
  );
  if (response.status === 401 || response.status === 403) {
    throw new Error(`${API_TOKEN_ENV} was rejected by gBizINFO.`);
  }
  if (!response.ok) {
    throw new Error(
      `gBizINFO returned HTTP ${response.status} for ${corporateNumber}.`,
    );
  }
  const payload = await response.json();
  return Array.isArray(payload?.["hojin-infos"])
    ? payload["hojin-infos"][0] ?? null
    : null;
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function compactObject(entries) {
  return Object.fromEntries(
    entries.filter(([, value]) => value !== undefined && value !== ""),
  );
}

function normalizeGbizInfo(info, corporateNumber, fallback) {
  if (!info && fallback) return fallback;
  if (!info) return undefined;
  const officialWebsiteUrl = clean(info.company_url);
  return {
    ...compactObject([
      [
        "officialWebsite",
        officialWebsiteUrl
          ? {
              label: `${clean(info.name) || fallback?.officialName || "法人"} 公式サイト`,
              url: officialWebsiteUrl,
            }
          : undefined,
      ],
      ["businessSummary", clean(info.business_summary)],
      ["employeeNumber", finiteNumber(info.employee_number)],
      ["capitalStock", finiteNumber(info.capital_stock)],
      ["establishmentDate", clean(info.date_of_establishment)],
      ["representativeName", clean(info.representative_name)],
    ]),
    sourceName: "gBizINFO",
    sourceUrl: `https://info.gbiz.go.jp/hojin/ichiran?hojinBango=${corporateNumber}`,
    fetchedAt: new Date().toISOString(),
  };
}

function enrichmentFromCandidate(candidate, gbizInfo) {
  return {
    corporateNumber: candidate.corporateNumber,
    officialName: candidate.officialName,
    registeredAddress: candidate.registeredAddress,
    prefecture:
      candidate.prefecture || splitAddress(candidate.registeredAddress).prefecture,
    city: candidate.city || splitAddress(candidate.registeredAddress).city,
    sourceName: candidate.sourceName,
    sourceUrl: candidate.sourceUrl,
    gbizInfo,
  };
}

function draftCorporationNames(draft) {
  if (!Array.isArray(draft.records)) {
    throw new Error("Draft file must contain a records array.");
  }
  const fields = [
    "corporationName",
    "organizationName",
    "reemploymentCorporationName",
  ];
  const names = [];
  for (const record of draft.records) {
    const name = fields.map((field) => clean(record[field])).find(Boolean);
    if (name) names.push(name);
  }
  return [...new Set(names)];
}

function productionTargets(corporations) {
  return corporations.filter(
    (corporation) =>
      !/^\d{13}$/.test(corporation.basicInfo?.corporateNumber ?? "") ||
      corporation.gbizInfo === undefined,
  );
}

function sourceForEnrichment(enrichment) {
  const sourceUrl =
    enrichment.gbizInfo?.sourceUrl ?? enrichment.sourceUrl;
  const sourceName =
    enrichment.gbizInfo?.sourceName ?? enrichment.sourceName;
  return {
    id: `corporation-info-${enrichment.corporateNumber}`,
    title: `${enrichment.officialName} 法人情報`,
    publisher: sourceName,
    url: sourceUrl,
    publishedAt: "",
    memo: "法人番号・所在地・法人プロフィールの公開情報",
  };
}

function timestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function dateStamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function defaultDraftOutput(inputPath) {
  const extension = path.extname(inputPath);
  return `${inputPath.slice(0, -extension.length)}.enriched${extension}`;
}

function reviewDocument(results) {
  const records = results
    .filter((result) => result.status !== "auto-enrich")
    .map((result) => ({
      inputCorporationName: result.inputCorporationName,
      normalizedName: normalizeComparableName(result.inputCorporationName),
      status: result.status,
      reason: result.reason,
      candidates: result.candidates.map((candidate) => ({
        corporateNumber: candidate.corporateNumber,
        officialName: candidate.officialName,
        registeredAddress: candidate.registeredAddress,
        sourceUrl: candidate.sourceUrl,
      })),
      suggestedAction:
        result.status === "review-needed"
          ? "候補の法人番号・所在地・法人格を一次資料で確認してください。"
          : "法人名の正式表記または別の公開ソースを確認してください。",
    }));
  return {
    sourceType: "corporation-enrichment-review",
    status: "review-needed",
    createdAt: new Date().toISOString().slice(0, 10),
    records,
  };
}

function summaryFor(results, existingCorporateNumberCount) {
  return {
    targetCount: results.length,
    searchedCount: results.filter((result) => result.searched).length,
    autoEnrichCount: results.filter(
      (result) => result.status === "auto-enrich",
    ).length,
    reviewNeededCount: results.filter(
      (result) => result.status === "review-needed",
    ).length,
    notFoundCount: results.filter(
      (result) => result.status === "not-found",
    ).length,
    existingCorporateNumberCount,
  };
}

async function run(options) {
  const productionDirectory = path.join(process.cwd(), "data", "production");
  const corporationsPath = path.join(productionDirectory, "corporations.json");
  const sourcesPath = path.join(productionDirectory, "sources.json");
  const metaPath = path.join(productionDirectory, "meta.json");
  const corporations = readJson(corporationsPath);
  const localIndex = localCandidates(corporations);
  const apiToken = readApiToken();
  const draftPath = options.file ? path.resolve(options.file) : null;
  const draft = draftPath ? readJson(draftPath) : null;
  const allNames = draft
    ? draftCorporationNames(draft)
    : productionTargets(corporations).map((corporation) => corporation.name);
  const existingCorporateNumberCount = draft
    ? allNames.filter((name) => findLocalMatches(name, localIndex).length > 0)
        .length
    : corporations.length - productionTargets(corporations).length;
  const names = allNames.slice(0, options.limit);
  let session = null;
  const results = [];

  console.log(options.apply ? "Corporation enrichment apply requested." : "Corporation enrichment dry-run.");
  console.log(`Mode: ${draft ? "draft" : "production"}`);
  console.log(`Limit: ${options.limit}`);
  console.log(
    apiToken
      ? `gBizINFO details: enabled via ${API_TOKEN_ENV}`
      : `gBizINFO details: disabled (${API_TOKEN_ENV} is not set)`,
  );
  console.log(
    options.offline
      ? "Official search: disabled (--offline)"
      : "Official search: enabled with local-data fallback",
  );

  for (let index = 0; index < names.length; index += 1) {
    const inputCorporationName = names[index];
    const localMatches = findLocalMatches(inputCorporationName, localIndex);
    let candidates = localMatches;
    let searched = false;
    let searchError = "";

    if (!options.offline && localMatches.length !== 1) {
      try {
        session ??= await createSearchSession();
        candidates = uniqueCandidates([
          ...localMatches,
          ...(await searchNta(session, inputCorporationName)),
        ]);
        searched = true;
      } catch (error) {
        searchError = error.message;
        candidates = localMatches;
      }
    }

    const classification = classifyMatch(inputCorporationName, candidates);
    if (searchError && classification.status === "not-found") {
      classification.status = "review-needed";
      classification.reason = "official-search-unavailable";
    }
    let enrichment;
    if (classification.status === "auto-enrich") {
      let apiInfo = null;
      if (apiToken && !options.offline) {
        try {
          apiInfo = await fetchGbizInfo(
            classification.candidate.corporateNumber,
            apiToken,
          );
        } catch (error) {
          searchError = [searchError, error.message].filter(Boolean).join(" ");
        }
      }
      enrichment = enrichmentFromCandidate(
        classification.candidate,
        normalizeGbizInfo(
          apiInfo,
          classification.candidate.corporateNumber,
          classification.candidate.gbizInfo,
        ),
      );
    }

    results.push({
      inputCorporationName,
      searched,
      searchError,
      ...classification,
      enrichment,
    });
    console.log(
      `[${index + 1}/${names.length}] ${inputCorporationName}: ${classification.status}`,
    );
    if (searchError) {
      console.warn(`  warning: ${searchError}`);
    }
    if (
      searched &&
      index + 1 < names.length &&
      options.delayMs > 0
    ) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }

  const summary = summaryFor(results, existingCorporateNumberCount);
  const fieldNames = [
    "basicInfo.corporateNumber",
    "basicInfo.officialName",
    "basicInfo.registeredAddress",
    "basicInfo.prefecture",
    "basicInfo.city",
    "gbizInfo.businessSummary",
    "gbizInfo.employeeNumber",
    "gbizInfo.capitalStock",
    "gbizInfo.establishmentDate",
    "gbizInfo.representativeName",
    "sources",
  ];
  console.log("Summary:");
  console.log(`- target corporations: ${summary.targetCount}`);
  console.log(`- searched corporations: ${summary.searchedCount}`);
  console.log(`- auto-enrich: ${summary.autoEnrichCount}`);
  console.log(`- review-needed: ${summary.reviewNeededCount}`);
  console.log(`- not-found: ${summary.notFoundCount}`);
  console.log(
    `- already has corporate number/local match: ${summary.existingCorporateNumberCount}`,
  );
  console.log(`- planned fields: ${fieldNames.join(", ")}`);
  if (!options.apply) {
    console.log("Dry-run completed. No files were written.");
    return;
  }

  const autoResults = results.filter(
    (result) => result.status === "auto-enrich",
  );
  const review = reviewDocument(results);
  const reviewPath = path.resolve(
    options.reviewOutput ??
      path.join(
        "data",
        "draft",
        `review-needed-corporation-enrichment-${dateStamp()}.json`,
      ),
  );

  if (draft) {
    const enrichments = autoResults.map((result) => ({
      corporationName: result.inputCorporationName,
      ...result.enrichment,
      sourceId: sourceForEnrichment(result.enrichment).id,
    }));
    const sourceById = new Map(
      (draft.sources ?? []).map((source) => [source.id, source]),
    );
    for (const result of autoResults) {
      const source = sourceForEnrichment(result.enrichment);
      sourceById.set(source.id, source);
    }
    const outputPath = path.resolve(options.output ?? defaultDraftOutput(draftPath));
    writeJson(outputPath, {
      ...draft,
      corporationEnrichments: enrichments,
      sources: [...sourceById.values()],
      enrichmentSummary: summary,
    });
    if (review.records.length > 0) writeJson(reviewPath, review);
    console.log(`Enriched draft: ${path.relative(process.cwd(), outputPath)}`);
  } else {
    const archiveDirectory = path.join(
      process.cwd(),
      "data",
      "archive",
      `${timestamp()}_before_enrich_corporations`,
    );
    fs.mkdirSync(archiveDirectory, { recursive: false });
    for (const filePath of [corporationsPath, sourcesPath, metaPath]) {
      fs.copyFileSync(filePath, path.join(archiveDirectory, path.basename(filePath)));
    }
    const corporationsByName = new Map(
      corporations.map((corporation) => [corporation.name, corporation]),
    );
    const sources = readJson(sourcesPath);
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    for (const result of autoResults) {
      const corporation = corporationsByName.get(result.inputCorporationName);
      if (!corporation) continue;
      const enrichment = result.enrichment;
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
      const source = sourceForEnrichment(enrichment);
      sourceById.set(source.id, source);
      corporation.sources = [
        ...new Set([...(corporation.sources ?? []), source.id]),
      ];
    }
    try {
      writeJson(corporationsPath, corporations);
      writeJson(sourcesPath, [...sourceById.values()]);
      if (review.records.length > 0) writeJson(reviewPath, review);
    } catch (error) {
      for (const filePath of [corporationsPath, sourcesPath, metaPath]) {
        fs.copyFileSync(
          path.join(archiveDirectory, path.basename(filePath)),
          filePath,
        );
      }
      throw new Error(
        `Production enrichment failed and files were restored: ${error.message}`,
      );
    }
    console.log(
      `Archive: ${path.relative(process.cwd(), archiveDirectory)}`,
    );
  }
  if (review.records.length > 0) {
    console.log(`Review-needed: ${path.relative(process.cwd(), reviewPath)}`);
  }
  console.log(`Applied enrichments: ${autoResults.length}`);
}

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    usage();
  } else {
    run(options).catch((error) => {
      console.error(`Corporation enrichment failed: ${error.message}`);
      process.exitCode = 1;
    });
  }
} catch (error) {
  console.error(`Corporation enrichment failed: ${error.message}`);
  usage();
  process.exitCode = 1;
}
})();
