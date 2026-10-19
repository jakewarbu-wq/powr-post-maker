// Renders posts/<id>/post.json into feed.jpg and story.jpg using index.html,
// then rebuilds posts/index.json for the Ready to post page.
// Usage: node scripts/render.mjs posts/2026-10-21
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const dir = resolve(process.argv[2] || "");
if (!existsSync(join(dir, "post.json"))) { console.error("Usage: node scripts/render.mjs posts/<id>  (needs post.json)"); process.exit(1); }
const spec = JSON.parse(readFileSync(join(dir, "post.json"), "utf8"));

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { chromium = createRequire(join(execSync("npm root -g").toString().trim(), "x"))("playwright").chromium; }
const launch = existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};

const browser = await chromium.launch(launch);
const page = await browser.newPage();
await page.goto(pathToFileURL(join(root, "index.html")).href);
await page.waitForFunction(() => window.POWR);
await page.evaluate(() => window.POWR.ready);
await page.evaluate((s) => window.POWR.applySpec(s), spec);
const imgs = await page.evaluate(() => window.POWR.exportAll());
for (const k of ["feed", "story"]) writeFileSync(join(dir, `${k}.jpg`), Buffer.from(imgs[k].split(",")[1], "base64"));
await browser.close();

const postsDir = join(root, "posts");
const list = readdirSync(postsDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(postsDir, d.name, "post.json")))
  .map(d => { const p = JSON.parse(readFileSync(join(postsDir, d.name, "post.json"), "utf8")); return { id: d.name, date: p.date, title: p.title || p.headline, pillar: p.pillar || "" }; })
  .sort((a, b) => b.id.localeCompare(a.id));
writeFileSync(join(postsDir, "index.json"), JSON.stringify(list, null, 2) + "\n");
console.log(`Rendered ${basename(dir)}: feed.jpg, story.jpg; index has ${list.length} posts`);
