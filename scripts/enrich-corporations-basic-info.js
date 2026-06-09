(() => {
const fs = require("node:fs");
const path = require("node:path");

const SEARCH_PAGE_URL = "https://www.houjin-bangou.nta.go.jp/";
const SEARCH_RESULT_URL =
  "https://www.houjin-bangou.nta.go.jp/kensaku-kekka.html";
const SOURCE_NAME = "国税庁法人番号公表サイト";
const OUTPUT_DIRECTORY = path.join(
  process.cwd(),
  "data",
  "draft",
  "corporation-enrichment-candidate",
);
const OUTPUT_PATH = path.join(OUTPUT_DIRECTORY, "corporations.json");

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

function normalizeExactName(value) {
  return value.normalize("NFKC").replace(/\s+/g, "").trim();
}

function normalizeComparableName(value) {
  return normalizeExactName(value)
    .replace(/[・･.,，．'’"`´]/g, "")
    .replace(
      /^(?:株式会社|有限会社|合同会社|合名会社|合資会社|一般社団法人|一般財団法人|公益社団法人|公益財団法人|学校法人|社会福祉法人|医療法人(?:社団|財団)?|国立大学法人|独立行政法人|弁護士法人|監査法人)/,
      "",
    )
    .replace(
      /(?:株式会社|有限会社|合同会社|合名会社|合資会社|一般社団法人|一般財団法人|公益社団法人|公益財団法人|学校法人|社会福祉法人|医療法人(?:社団|財団)?|国立大学法人|独立行政法人|弁護士法人|監査法人)$/,
      "",
    )
    .toUpperCase();
}

function similarity(left, right) {
  if (!left || !right) return 0;
  if (left === right) return 1;
  const leftSet = new Set([...left]);
  const rightSet = new Set([...right]);
  const intersection = [...leftSet].filter((character) =>
    rightSet.has(character),
  ).length;
  return (2 * intersection) / (leftSet.size + rightSet.size);
}

function splitAddress(address) {
  const prefectureMatch = address.match(
    /^(東京都|北海道|(?:京都|大阪)府|.{2,3}県)/,
  );
  const prefecture = prefectureMatch?.[1] ?? "";
  const remainder = prefecture ? address.slice(prefecture.length) : address;
  const cityMatch = remainder.match(
    /^(.+?(?:市|区|町|村))(?:[^市区町村]|$)/,
  );
  return {
    prefecture,
    city: cityMatch?.[1] ?? "",
  };
}

function parseSearchResults(html) {
  const tableMatch = html.match(
    /<div class="tbl01">[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i,
  );
  if (!tableMatch) return [];

  const rows = [];
  for (const match of tableMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...match[1].matchAll(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)];
    if (cells.length < 3) continue;
    const corporateNumber = textContent(cells[0][1]).match(/\d{13}/)?.[0] ?? "";
    const officialName = textContent(cells[1][1]);
    const registeredAddress = textContent(cells[2][1]);
    if (!corporateNumber || !officialName) continue;
    rows.push({
      corporateNumber,
      officialName,
      registeredAddress,
      sourceUrl: `https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHouzinNo=${corporateNumber}`,
    });
  }
  return rows;
}

async function createSearchSession() {
  const response = await fetch(SEARCH_PAGE_URL, {
    headers: { "user-agent": "amakudari-map-mvp/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Official search page returned HTTP ${response.status}.`);
  }
  const html = await response.text();
  const token = html.match(
    /name="jp\.go\.nta\.houjin_bangou\.framework\.web\.common\.CNSFWTokenProcessor\.request\.token" value="([^"]+)"/,
  )?.[1];
  if (!token) throw new Error("Could not read the official search CSRF token.");
  const cookie = response.headers.getSetCookie?.().map((value) => value.split(";")[0]).join("; ")
    ?? response.headers.get("set-cookie")?.split(";")[0]
    ?? "";
  return { token, cookie };
}

async function searchOfficialCorporations(session, corporationName) {
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
  const response = await fetch(SEARCH_RESULT_URL, {
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

function classifyMatch(corporation, candidates) {
  const exactName = normalizeExactName(corporation.name);
  const comparableName = normalizeComparableName(corporation.name);
  const exactMatches = candidates.filter(
    (candidate) => normalizeExactName(candidate.officialName) === exactName,
  );
  const normalizedMatches = candidates.filter(
    (candidate) =>
      normalizeComparableName(candidate.officialName) === comparableName,
  );

  let status = "unmatched";
  let matchedBy = "none";
  let matchConfidence = 0;
  let selected = null;
  const notes = [];

  if (exactMatches.length === 1) {
    status = "high-confidence";
    matchedBy = "exact";
    matchConfidence = 1;
    selected = exactMatches[0];
  } else if (exactMatches.length > 1) {
    status = "ambiguous";
    matchedBy = "exact-multiple";
    matchConfidence = 0.5;
    notes.push("同名法人が複数存在するため自動確定していません。");
  } else if (normalizedMatches.length === 1) {
    status = "high-confidence";
    matchedBy = "normalized";
    matchConfidence = 0.95;
    selected = normalizedMatches[0];
  } else if (normalizedMatches.length > 1) {
    status = "ambiguous";
    matchedBy = "normalized-multiple";
    matchConfidence = 0.45;
    notes.push("正規化後に同名となる法人が複数存在します。");
  } else if (candidates.length > 0) {
    const ranked = candidates
      .map((candidate) => ({
        ...candidate,
        score: similarity(
          comparableName,
          normalizeComparableName(candidate.officialName),
        ),
      }))
      .sort((left, right) => right.score - left.score);
    const best = ranked[0];
    if (best.score >= 0.7) {
      status = "ambiguous";
      matchedBy = "fuzzy";
      matchConfidence = Number(best.score.toFixed(2));
      notes.push("名称が近い候補ですが、人間による確認が必要です。");
    }
  }

  const address = selected
    ? splitAddress(selected.registeredAddress)
    : { prefecture: "", city: "" };
  return {
    corporationSlug: corporation.slug,
    corporationName: corporation.name,
    status,
    corporateNumber: selected?.corporateNumber ?? "",
    officialName: selected?.officialName ?? "",
    registeredAddress: selected?.registeredAddress ?? "",
    prefecture: address.prefecture,
    city: address.city,
    sourceName: SOURCE_NAME,
    sourceUrl: selected?.sourceUrl ?? SEARCH_PAGE_URL,
    matchedBy,
    matchConfidence,
    candidateCount: candidates.length,
    candidates:
      status === "high-confidence"
        ? []
        : candidates.slice(0, 10).map((candidate) => ({
            ...candidate,
            ...splitAddress(candidate.registeredAddress),
          })),
    notes,
  };
}

function resolveCorporateNumberConflicts(records) {
  const byCorporateNumber = new Map();
  for (const record of records) {
    if (record.status !== "high-confidence") continue;
    const matches = byCorporateNumber.get(record.corporateNumber) ?? [];
    matches.push(record);
    byCorporateNumber.set(record.corporateNumber, matches);
  }

  for (const matches of byCorporateNumber.values()) {
    if (matches.length < 2) continue;
    const exactMatches = matches.filter((record) => record.matchedBy === "exact");
    const recordsToDowngrade =
      exactMatches.length === 1
        ? matches.filter((record) => record !== exactMatches[0])
        : matches;

    for (const record of recordsToDowngrade) {
      record.candidates = [
        {
          corporateNumber: record.corporateNumber,
          officialName: record.officialName,
          registeredAddress: record.registeredAddress,
          prefecture: record.prefecture,
          city: record.city,
          sourceUrl: record.sourceUrl,
        },
      ];
      record.status = "ambiguous";
      record.matchedBy = "corporate-number-conflict";
      record.matchConfidence = 0.4;
      record.corporateNumber = "";
      record.officialName = "";
      record.registeredAddress = "";
      record.prefecture = "";
      record.city = "";
      record.sourceUrl = SEARCH_PAGE_URL;
      record.notes.push(
        "同一法人番号が別のproduction法人名にも対応するため、自動確定していません。",
      );
    }
  }
}

function writeOutput(records) {
  const summary = {
    targetCount: records.length,
    foundCount: records.filter((record) => record.candidateCount > 0).length,
    highConfidenceCount: records.filter(
      (record) => record.status === "high-confidence",
    ).length,
    ambiguousCount: records.filter((record) => record.status === "ambiguous")
      .length,
    unmatchedCount: records.filter((record) => record.status === "unmatched")
      .length,
  };
  const output = {
    sourceType: "nta-corporate-number-official-search",
    status: "draft",
    createdAt: new Date().toISOString().slice(0, 10),
    sourceName: SOURCE_NAME,
    sourceUrl: SEARCH_PAGE_URL,
    summary,
    records,
  };
  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  return summary;
}

async function main() {
  const corporations = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "data", "production", "corporations.json"),
      "utf8",
    ),
  );
  const session = await createSearchSession();
  const records = [];

  for (let index = 0; index < corporations.length; index += 1) {
    const corporation = corporations[index];
    const candidates = await searchOfficialCorporations(
      session,
      corporation.name,
    );
    records.push(classifyMatch(corporation, candidates));
    console.log(
      `[${index + 1}/${corporations.length}] ${corporation.name}: ${candidates.length} candidate(s)`,
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  resolveCorporateNumberConflicts(records);
  const summary = writeOutput(records);
  console.log("Corporation enrichment candidate generated.");
  console.log(`- target corporations: ${summary.targetCount}`);
  console.log(`- candidates found: ${summary.foundCount}`);
  console.log(`- high confidence: ${summary.highConfidenceCount}`);
  console.log(`- ambiguous: ${summary.ambiguousCount}`);
  console.log(`- unmatched: ${summary.unmatchedCount}`);
  console.log(`- output: ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(`Corporation enrichment failed: ${error.message}`);
  process.exitCode = 1;
});
})();
