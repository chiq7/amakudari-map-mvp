import { appendFile, copyFile, cp, glob, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

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
const bundle = join(worker, "bundle");
await mkdir(bundle);
await copyFile(join(root, "scripts", "directory-worker.mjs"), join(bundle, "index.mjs"));
const directory = await readFile(join(dist, "corporations", "filter-data.json"), "utf8");
await writeFile(join(bundle, "directory-data.js"), `export default ${directory};\n`);
const oldOrganizations = JSON.parse(await readFile(join(root, "public", "data", "organizations.json"), "utf8"));
const normalizeName = (value) => value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
const destinations = new Map();
for (const corporation of JSON.parse(directory)) {
  for (const name of [corporation.name, ...corporation.aliases]) {
    const key = normalizeName(name);
    if (!destinations.has(key)) destinations.set(key, new Set());
    destinations.get(key).add(corporation.slug);
  }
}
const redirects = Object.fromEntries(oldOrganizations.flatMap((entry) => {
  const matches = destinations.get(normalizeName(entry.再就職先名称));
  // Keep the exact encoded slug. The original export truncated some multibyte escapes.
  return matches?.size === 1 ? [[entry.organization_slug.toLowerCase(), [...matches][0]]] : [];
}));
await writeFile(join(bundle, "legacy-organizations.js"), `export default ${JSON.stringify(redirects)};\n`);
for (const name of ["directory-filters", "corporation-types", "search-key"]) {
  const source = await readFile(join(root, "lib", `${name}.ts`), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  await writeFile(join(bundle, `${name}.js`), outputText.replace(/from "(\.\/[\w-]+)"/g, 'from "$1.js"'));
}
await writeFile(join(worker, "worker.config.json"), JSON.stringify({
  name: "amakudari-map",
  compatibilityDate: "2026-11-09",
  workersDev: false,
  previewUrls: true,
  env: { ASSETS: { type: "assets" } },
  manifest: { type: "partial", mainModule: "index.mjs", modules: {} },
  assets: { htmlHandling: "drop-trailing-slash", notFoundHandling: "404-page", runWorkerFirst: ["/corporations", "/organizations/*"] },
}));
