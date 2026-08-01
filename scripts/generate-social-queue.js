(() => {
  const fs = require("node:fs");
  const path = require("node:path");

  const SITE_URL = "https://amakudari.jp";
  const DEFAULT_INPUT = path.join("data", "draft", "pending", "daily-pick.json");
  const DEFAULT_OUTPUT = path.join("data", "social", "content-queue.json");
  const DEFAULT_CSV = path.join("data", "social", "content-queue.csv");
  const MAX_X_LENGTH = 280;

  function parseArguments(argv) {
    const options = {
      input: DEFAULT_INPUT,
      output: DEFAULT_OUTPUT,
      csv: DEFAULT_CSV,
      limit: 1,
    };
    for (let index = 0; index < argv.length; index += 1) {
      const argument = argv[index];
      if (argument === "--input") {
        options.input = argv[++index];
      } else if (argument === "--output") {
        options.output = argv[++index];
      } else if (argument === "--csv") {
        options.csv = argv[++index];
      } else if (argument === "--limit") {
        options.limit = Number(argv[++index]);
      } else if (argument === "--dry-run") {
        options.dryRun = true;
      } else {
        throw new Error(`Unknown argument: ${argument}`);
      }
    }
    if (!Number.isInteger(options.limit) || options.limit < 1) {
      throw new Error("--limit must be a positive integer.");
    }
    return options;
  }

  function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  function writeJson(filePath, value) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  }

  function writeText(filePath, value) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, value, "utf8");
  }

  function jstDate(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  function csvCell(value) {
    const normalized = String(value ?? "").replace(/\r?\n/g, "\n");
    return `"${normalized.replace(/"/g, '""')}"`;
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
      "一次資料名",
      "一次資料URL",
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
      entry.source.title,
      entry.source.url,
      entry.note.publicationEligibility,
      entry.editorialNote,
    ]);
    return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
  }

  function sourceFor(record, pendingSources, productionSources) {
    return (
      pendingSources.find((source) => source.id === record.sourceId) ??
      productionSources.find((source) => source.id === record.sourceId) ?? {
        title: record.sourceId,
        publisher: "公表元",
        url: record.sourceUrl,
      }
    );
  }

  function assertSafeText(text, label) {
    if ([...text].length > MAX_X_LENGTH) {
      throw new Error(`${label} must be ${MAX_X_LENGTH} characters or fewer.`);
    }
  }

  function memeHeadline(record) {
    const headlines = [
      "役所→法人の線、ここでつながって「え、そこ接続するんかーい」になる件ｗｗ",
      "公表資料を読んだら、役所→法人ルートがぬるっと一本線になってて情報量バグる件",
      "なんでここで名前つながるんですかねぇ…資料を追ったらこうなった",
      "長文資料を読んだ結果、役所→法人の答え合わせ会場はこちら",
    ];
    return headlines[Number.parseInt(record.rawId.slice(0, 2), 16) % headlines.length];
  }

  function createEntry(record, source, createdAt) {
    if (!record.personSlug || !record.corporationSlug) {
      throw new Error(`Published record is missing a public page slug: ${record.rawId}`);
    }
    if (!source.url || !source.url.startsWith("https://")) {
      throw new Error(`A primary source URL is required for ${record.rawId}.`);
    }
    const personUrl = `${SITE_URL}/persons/${record.personSlug}`;
    const personName = record.name;
    const organization = record.corporationName;
    const sourcePublisher = source.publisher || "公表元";
    const headline = memeHeadline(record);
    const waitingDays = Number.isInteger(record.waitingDays)
      ? `${record.waitingDays}日`
      : "資料に記載の期間";

    const xPost = `【${headline}】\n\n${personName}さんは、${record.fromMinistry}を${record.retirementDate}に離職→${organization}へ${record.reemploymentDate}に再就職。待機は${waitingDays}。\n\nここまでは${sourcePublisher}の公表資料で確認できる。採用の経緯や個別の事情は資料だけでは不明。妄想で補完するのはナシ寄りのナシ。\n\n資料はリプ欄👇`;
    const xReply = `【一次資料・時系列・資料だけでは分からない点】\n${personUrl}\n\n一次資料：${source.url}`;
    assertSafeText(xPost, "X post");
    assertSafeText(xReply, "X reply");

    const noteTitle = `【資料をアホかわいく読む】${headline}`;
    const noteDraft = `# ${noteTitle}\n\n公表資料が長すぎて脳みそが終了した人向けに、確認できるところだけ秒速で整理します。\n\n## 3行で\n\n- ${personName}さんは、${record.fromMinistry}を${record.retirementDate}に離職した記録がある。\n- ${record.reemploymentDate}に${organization}の${record.newPosition}へ再就職した記録がある。\n- 離職日と再就職日の差は${waitingDays}。\n\n## 確認できた事実\n\n${sourcePublisher}の「${source.title}」には、上記の離職時の所属・再就職先・就任日が記載されている。天下りマップでは、この公表記録を人物ページと法人ページから確認できるように整理している。\n\n## 資料だけでは確認できないこと\n\n採用に至った個別の経緯、誰かによる働きかけの有無、再就職の妥当性や違法性は、この公表資料だけからは判断できない。そこを脳内補完して断定するのはナシ寄りのナシ。\n\n## 資料と時系列を確認する\n\n- 人物ページ：${personUrl}\n- 法人ページ：${SITE_URL}/corporations/${record.corporationSlug}\n- 一次資料：${source.url}\n- 確認日：${createdAt}\n\n## 公開前メモ\n\nこの原稿は一次資料1件に基づく下書き。noteとして公開するなら、法人公式・所管情報など追加の一次資料で背景を補える場合だけにする。補えない日は、Xの短い公表資料紹介として使い、薄いnoteを量産しない。`;

    return {
      id: `record:${record.rawId}`,
      createdAt,
      status: "要確認",
      theme: `${record.fromMinistry}から${organization}への公表再就職記録`,
      sourceRecordId: record.rawId,
      siteUrl: personUrl,
      source: {
        title: source.title,
        publisher: sourcePublisher,
        url: source.url,
      },
      x: {
        thread: [xPost, xReply],
        characterCounts: [[...xPost].length, [...xReply].length],
      },
      note: {
        title: noteTitle,
        draft: noteDraft,
        publicationEligibility: "追加の一次資料で背景を補えた場合のみ公開",
      },
      editorialNote:
        "Xは公表資料の要約として確認後に使用可。noteはこの1件だけで公開せず、追加一次資料で内容を深められる場合だけ公開する。",
    };
  }

  function generate(options) {
    const inputPath = path.resolve(options.input);
    if (!fs.existsSync(inputPath)) {
      console.log("投稿キュー候補なし: 日次ピックが存在しません。");
      return;
    }
    const pending = readJson(inputPath);
    const productionRecords = readJson(path.join("data", "production", "records.json"));
    const productionSources = readJson(path.join("data", "production", "sources.json"));
    const outputPath = path.resolve(options.output);
    const csvPath = path.resolve(options.csv);
    const existing = fs.existsSync(outputPath)
      ? readJson(outputPath)
      : { version: 1, generatedAt: null, entries: [] };
    const entries = Array.isArray(existing.entries) ? existing.entries : [];
    const existingIds = new Set(entries.map((entry) => entry.id));
    const pendingRecords = (pending.records ?? []).slice(0, options.limit);
    // GitHub Actions runs at 21:00 UTC for the 06:00 JST schedule. Use JST
    // here so the spreadsheet row is dated for the intended publishing day.
    const createdAt = jstDate();
    const additions = [];

    for (const pendingRecord of pendingRecords) {
      const record = productionRecords.find(
        (candidate) => candidate.rawId === pendingRecord.rawId,
      );
      if (!record) {
        throw new Error(`Picked record was not found in production: ${pendingRecord.rawId}`);
      }
      const id = `record:${record.rawId}`;
      if (existingIds.has(id)) continue;
      additions.push(
        createEntry(
          record,
          sourceFor(record, pending.sources ?? [], productionSources),
          createdAt,
        ),
      );
    }

    const next = {
      version: 1,
      generatedAt: jstDate(),
      entries: [...entries, ...additions],
    };
    if (!options.dryRun) {
      writeJson(outputPath, next);
      writeText(csvPath, renderCsv(next.entries));
    }
    console.log(`Social queue entries added: ${additions.length}`);
    console.log(`Social queue entries total: ${next.entries.length}`);
    console.log(`- JSON: ${path.relative(process.cwd(), outputPath)}`);
    console.log(`- CSV: ${path.relative(process.cwd(), csvPath)}`);
  }

  try {
    generate(parseArguments(process.argv.slice(2)));
  } catch (error) {
    console.error(`Social queue generation failed: ${error.message}`);
    process.exitCode = 1;
  }
})();
