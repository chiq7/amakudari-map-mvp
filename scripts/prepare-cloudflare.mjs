import { appendFile, copyFile, cp, glob, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = await realpath(fileURLToPath(new URL("../", import.meta.url)));
const cloudflare = join(root, ".cloudflare");
const output = join(cloudflare, "output", "v0");
const worker = join(output, "workers", "default");
const assets = join(worker, "assets");
const dist = join(root, "dist");
const preview = process.argv.includes("--preview");
const buildCommit = process.env.CLOUDFLARE_BUILD_COMMIT;
if (buildCommit && !/^[0-9a-f]{40}$/.test(buildCommit)) {
  throw new Error("CLOUDFLARE_BUILD_COMMIT must be a full Git commit SHA.");
}

const homepage = await readFile(join(dist, "index.html"), "utf8");
if (!/googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+/.test(homepage)) {
  throw new Error("Build with NEXT_PUBLIC_GA_MEASUREMENT_ID before deploying.");
}
await mkdir(output, { recursive: true });
if ((await realpath(output)) !== output) {
  throw new Error("Cloudflare build output must be inside the repository.");
}
await rm(output, { recursive: true });
await mkdir(worker, { recursive: true });

// Next 16.3 on Windows exports some prefetch segments as nested files.
// The client router requests the same segments as dot-separated filenames.
const segmentDirectories = new Map();
for await (const entry of glob("**/__next.*", { cwd: dist, withFileTypes: true })) {
  if (entry.isDirectory()) {
    segmentDirectories.set(join(entry.parentPath, entry.name), entry);
  }
}
await cp(dist, assets, {
  recursive: true,
  filter: (source) => !segmentDirectories.has(source),
});
for (const [directory, entry] of segmentDirectories) {
  const routeAssets = join(assets, relative(dist, entry.parentPath));
  for await (const file of glob("**/*.txt", { cwd: directory })) {
    await copyFile(join(directory, file), join(routeAssets, `${entry.name}.${file.split(sep).join(".")}`));
  }
}
if (buildCommit) {
  await appendFile(join(assets, "_headers"), `\n/\n  X-Amakudari-Build: ${buildCommit}\n`);
}
await writeFile(join(output, "config.json"), JSON.stringify({
  buildContext: { isPreview: preview },
}));
await writeFile(join(worker, "worker.config.json"), JSON.stringify({
  name: "amakudari-map",
  compatibilityDate: "2026-11-09",
  workersDev: false,
  previewUrls: true,
  assets: { htmlHandling: "drop-trailing-slash", notFoundHandling: "404-page" },
}));
