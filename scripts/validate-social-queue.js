(() => {
  const fs = require("node:fs");
  const path = require("node:path");

  const DEFAULT_QUEUE_PATH = path.join("data", "social", "content-queue.json");
  const DEFAULT_CSV_PATH = path.join("data", "social", "content-queue.csv");
  const MAX_X_LENGTH = 280;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function parseArguments(argv) {
    const options = { file: DEFAULT_QUEUE_PATH, csv: DEFAULT_CSV_PATH };
    for (let index = 0; index < argv.length; index += 1) {
      if (argv[index] === "--file") {
        options.file = argv[++index];
      } else if (argv[index] === "--csv") {
        options.csv = argv[++index];
      } else {
        throw new Error(`Unknown argument: ${argv[index]}`);
      }
    }
    return options;
  }

  try {
    const options = parseArguments(process.argv.slice(2));
    const queuePath = path.resolve(options.file);
    const csvPath = path.resolve(options.csv);
    if (!fs.existsSync(queuePath)) {
      console.log("投稿キューはまだ空です。次の日次公開時に生成されます。");
      process.exit(0);
    }
    const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
    assert(Array.isArray(queue.entries), "content-queue.json must contain entries.");
    assert(fs.existsSync(csvPath), "content-queue.csv is required.");
    const ids = new Set();
    for (const entry of queue.entries) {
      assert(typeof entry.id === "string" && entry.id.length > 0, "Queue entry id is required.");
      assert(!ids.has(entry.id), `Duplicate queue entry: ${entry.id}`);
      ids.add(entry.id);
      assert(entry.status === "要確認", `${entry.id} must remain 要確認.`);
      assert(
        /^https:\/\/amakudari\.jp\/(persons|corporations|news|ministries|topics|rankings)(\/|$)/.test(entry.siteUrl ?? ""),
        `${entry.id} has an invalid public site URL.`,
      );
      assert(entry.source?.url?.startsWith("https://"), `${entry.id} needs an HTTPS source URL.`);
      assert(Array.isArray(entry.x?.thread) && entry.x.thread.length === 2, `${entry.id} needs a two-post X thread.`);
      for (const post of entry.x.thread) {
        assert([...post].length <= MAX_X_LENGTH, `${entry.id} X post exceeds ${MAX_X_LENGTH} characters.`);
      }
      assert(entry.x.thread[1].includes(entry.siteUrl), `${entry.id} reply must include the person URL.`);
      assert(entry.x.thread[1].includes(entry.source.url), `${entry.id} reply must include the primary source URL.`);
      assert(entry.note?.title, `${entry.id} needs a note title.`);
      assert(entry.note?.draft?.includes("## 確認できた事実"), `${entry.id} note draft needs verified facts.`);
      assert(entry.note.publicationEligibility.includes("追加の一次資料"), `${entry.id} must block thin note publication.`);
    }
    console.log(`投稿キュー検証 OK: ${queue.entries.length}件`);
  } catch (error) {
    console.error(`投稿キュー検証エラー: ${error.message}`);
    process.exitCode = 1;
  }
})();
