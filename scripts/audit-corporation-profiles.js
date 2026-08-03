(() => {
  const fs = require("node:fs");
  const path = require("node:path");

  function readJson(relativePath) {
    return JSON.parse(
      fs.readFileSync(path.join(process.cwd(), relativePath), "utf8"),
    );
  }

  const corporations = readJson("data/production/corporations.json");
  const contexts = readJson("data/editorial/corporation-contexts.json");
  const contextBySlug = new Map(
    contexts.map((context) => [context.corporationSlug, context]),
  );

  const rows = corporations.map((corporation) => {
    const context = contextBySlug.get(corporation.slug);
    const officialWebsite =
      context?.business?.officialWebsite || corporation.gbizInfo?.officialWebsite;
    const businessSummary =
      context?.business?.summary || corporation.gbizInfo?.businessSummary;

    return {
      slug: corporation.slug,
      name: corporation.name,
      publicRecords: corporation.counts?.publicRecords ?? 0,
      hasLegalIdentity: Boolean(corporation.basicInfo?.corporateNumber),
      hasOfficialWebsite: Boolean(officialWebsite?.url),
      hasBusinessSummary: Boolean(businessSummary?.trim()),
    };
  });

  const count = (key) => rows.filter((row) => row[key]).length;
  const priority = rows
    .filter((row) => !row.hasOfficialWebsite || !row.hasBusinessSummary)
    .sort(
      (left, right) =>
        right.publicRecords - left.publicRecords || left.name.localeCompare(right.name, "ja"),
    );

  console.log("法人プロフィール充足状況");
  console.log(`- 対象法人: ${rows.length}`);
  console.log(`- 法人番号・正式名称を確認済み: ${count("hasLegalIdentity")}`);
  console.log(`- 法人公式ページを確認済み: ${count("hasOfficialWebsite")}`);
  console.log(`- 事業内容を確認済み: ${count("hasBusinessSummary")}`);
  console.log("");
  console.log("次に一次資料で確認する候補（再就職記録数順）");
  priority.slice(0, 20).forEach((row) => {
    const missing = [
      row.hasOfficialWebsite ? "" : "公式ページ",
      row.hasBusinessSummary ? "" : "事業内容",
    ]
      .filter(Boolean)
      .join("・");
    console.log(`- ${row.name}（${row.publicRecords}件）: ${missing} 未確認`);
  });
})();
