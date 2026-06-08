(() => {
const fs = require("node:fs");
const path = require("node:path");

const dataDirectory = path.join(process.cwd(), "data", "production");

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(dataDirectory, fileName), "utf8"));
}

const corporations = readJson("corporations.json");
const persons = readJson("persons.json");
const rankings = readJson("rankings.json");
const records = readJson("records.json");
const meta = readJson("meta.json");
const sources = readJson("sources.json");
const topics = readJson("topics.json");

console.log("Production static content source files loaded:");
console.log(`- corporations: ${corporations.length}`);
console.log(`- persons: ${persons.length}`);
console.log(`- ranking groups: ${Object.keys(rankings.rankings ?? {}).length}`);
console.log(`- records: ${records.length}`);
console.log(`- meta.productionRecordCount: ${meta.productionRecordCount ?? "n/a"}`);
console.log(`- meta.lastUpdated: ${meta.lastUpdated ?? "n/a"}`);
console.log(`- sources: ${sources.length}`);
console.log(`- topic groups: ${topics.length}`);
console.log("");
console.log("No generated files were written.");
console.log("Run `npm run validate:data` before using updated data.");
})();
