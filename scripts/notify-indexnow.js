const fs = require("node:fs");
const path = require("node:path");

const SITE_URL = "https://amakudari.jp";
const HOST = "amakudari.jp";
const INDEXNOW_KEY = "3725674dc455444b8328b0609657f6ab";
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const MAX_URLS_PER_REQUEST = 10_000;

function usage() {
  console.log("Usage:");
  console.log("  npm run notify:indexnow -- --url /ministries/finance --url /corporations/example");
  console.log("  npm run notify:indexnow -- --file changed-urls.txt");
  console.log("");
  console.log("Run this only after the matching Vercel deployment is Ready.");
}

function parseArguments(argv) {
  const options = { urls: [], dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--url") {
      options.urls.push(argv[index + 1]);
      index += 1;
    } else if (argument === "--file") {
      options.file = argv[index + 1];
      index += 1;
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

function readUrlFile(filePath) {
  return fs
    .readFileSync(path.resolve(filePath), "utf8")
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function toSiteUrl(value) {
  const url = new URL(value, SITE_URL);
  if (url.protocol !== "https:" || url.hostname !== HOST) {
    throw new Error(`Only ${SITE_URL} URLs can be submitted: ${value}`);
  }
  url.hash = "";
  return url.toString();
}

function assertKeyFile() {
  const keyPath = path.join(process.cwd(), "public", `${INDEXNOW_KEY}.txt`);
  if (!fs.existsSync(keyPath)) {
    throw new Error(`IndexNow key file is missing: ${keyPath}`);
  }
  if (fs.readFileSync(keyPath, "utf8").trim() !== INDEXNOW_KEY) {
    throw new Error("IndexNow key file contents do not match the configured key.");
  }
}

async function submit(urlList) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "amakudari-map-indexnow/1.0",
    },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });

  const responseText = await response.text();
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(
      `IndexNow submission failed (${response.status}): ${responseText || response.statusText}`,
    );
  }
  console.log(`IndexNow accepted ${urlList.length} URL(s) with HTTP ${response.status}.`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }

  const rawUrls = [...options.urls, ...(options.file ? readUrlFile(options.file) : [])];
  if (rawUrls.length === 0) {
    usage();
    throw new Error("Provide at least one --url or a --file.");
  }

  assertKeyFile();
  const urlList = Array.from(new Set(rawUrls.map(toSiteUrl)));
  if (urlList.length > MAX_URLS_PER_REQUEST) {
    throw new Error(`IndexNow accepts at most ${MAX_URLS_PER_REQUEST} URLs per request.`);
  }

  if (options.dryRun) {
    console.log("Dry run: no IndexNow request was sent.");
    urlList.forEach((url) => console.log(`- ${url}`));
    return;
  }

  await submit(urlList);
}

main().catch((error) => {
  console.error(`IndexNow notification failed: ${error.message}`);
  process.exitCode = 1;
});
