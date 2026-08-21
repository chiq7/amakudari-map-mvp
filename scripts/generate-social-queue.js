(() => {
  const fs = require("node:fs");
  const path = require("node:path");

  const DEFAULT_INPUT = path.join("data", "social", "content-queue.json");
  const DEFAULT_CSV = path.join("data", "social", "content-queue.csv");

  function parseArguments(argv) {
    const options = { input: DEFAULT_INPUT, csv: DEFAULT_CSV };
    for (let index = 0; index < argv.length; index += 1) {
      if (argv[index] === "--input") {
        options.input = argv[++index];
      } else if (argv[index] === "--csv") {
        options.csv = argv[++index];
      } else {
        throw new Error(`Unknown argument: ${argv[index]}`);
      }
    }
    return options;
  }

  function csvCell(value) {
    return `"${String(value ?? "").replace(/\r?\n/g, "\n").replace(/"/g, '""')}"`;
  }

  function renderCsv(entries) {
    const headers = [
      "作成日",
      "状態",
      "テーマ",
      "X投稿_1",
      "X投稿_返信",
      "noteタイトル",
      "note下書き",
      "天下りマップURL",
      "note公開判断",
      "確認事項",
    ];
    const rows = entries.map((entry) => [
      entry.createdAt,
      entry.status,
      entry.theme,
      entry.x.thread[0],
      entry.x.thread[1],
      entry.note.title,
      entry.note.draft,
      entry.siteUrl,
      entry.note.publicationEligibility,
      entry.editorialNote,
    ]);
    return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
  }

  try {
    const options = parseArguments(process.argv.slice(2));
    const inputPath = path.resolve(options.input);
    const csvPath = path.resolve(options.csv);
    const queue = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    if (!Array.isArray(queue.entries)) {
      throw new Error("content-queue.json must contain entries.");
    }
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, renderCsv(queue.entries), "utf8");
    console.log(`Social queue CSV synced: ${queue.entries.length}件`);
  } catch (error) {
    console.error(`Social queue sync failed: ${error.message}`);
    process.exitCode = 1;
  }
})();
