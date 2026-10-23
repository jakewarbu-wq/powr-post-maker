// Turns a clip (QuickTime .mov, .mp4, any orientation) into a branded Instagram Reel for posts/<id>:
// up to 25 seconds of the clip with the post's headline and small line softly over it and the POWR mark,
// then the POWR end card. Also writes feed.jpg (a cover frame) and rebuilds posts/index.json.
// The words come from post.json (headline, detail). The original clip stays outside the repo.
// Usage: node scripts/reel.mjs posts/2026-10-25 path/to/clip.mov
import { existsSync, mkdtempSync, rmSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync, execSync } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const dir = resolve(process.argv[2] || ""), clip = process.argv[3] ? resolve(process.argv[3]) : "";
if (!existsSync(join(dir, "post.json")) || !existsSync(clip)) { console.error("Usage: node scripts/reel.mjs posts/<id> path/to/clip.mov"); process.exit(1); }
const spec = JSON.parse(readFileSync(join(dir, "post.json"), "utf8"));

const END = 2.5, FADE = 0.5, MAX = 25;
const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", clip]).toString());
if (!(dur > 1)) { console.error("The clip is too short or unreadable."); process.exit(1); }
const len = Math.min(dur, MAX);

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { chromium = createRequire(join(execSync("npm root -g").toString().trim(), "x"))("playwright").chromium; }
const launch = existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};

const tmp = mkdtempSync(join(tmpdir(), "powr-reel-"));
try {
  // The words, mark and end card are drawn by the Post Maker, so they match what the page makes.
  const browser = await chromium.launch(launch);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(join(root, "maker.html")).href);
  await page.waitForFunction(() => window.POWR);
  await page.evaluate(() => window.POWR.ready);
  const cards = await page.evaluate(([h, d]) => window.POWR.reelCards(h, d), [spec.headline || "", spec.detail || ""]);
  await browser.close();
  const overlay = join(tmp, "overlay.png"), end = join(tmp, "end.png");
  writeFileSync(overlay, Buffer.from(cards.overlay.split(",")[1], "base64"));
  writeFileSync(end, Buffer.from(cards.end.split(",")[1], "base64"));

  const v = "fps=30,format=yuv420p,setsar=1";
  const filter = [
    `[0:v]trim=0:${len.toFixed(2)},setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,${v}[c]`,
    `[1:v]format=rgba,fade=in:st=0.3:d=${FADE}:alpha=1[o]`,
    `[c][o]overlay=0:0:shortest=1,format=yuv420p[co]`,
    `[2:v]scale=1080:1920,${v}[e]`,
    `[co][e]xfade=transition=fade:duration=${FADE}:offset=${(len - FADE).toFixed(2)},format=yuv420p[v]`,
  ].join(";");
  const total = len + END - FADE;
  execFileSync("ffmpeg", ["-v", "error", "-y",
    "-i", clip,
    "-loop", "1", "-t", len.toFixed(2), "-i", overlay,
    "-loop", "1", "-t", String(END), "-i", end,
    "-f", "lavfi", "-t", total.toFixed(2), "-i", "anullsrc=r=44100:cl=stereo",
    "-filter_complex", filter, "-map", "[v]", "-map", "3:a", "-pix_fmt", "yuv420p",
    "-c:v", "libx264", "-profile:v", "high", "-preset", "medium", "-crf", "23", "-maxrate", "6M", "-bufsize", "12M",
    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-t", total.toFixed(2), join(dir, "reel.mp4")]);
  // Cover for the Ready page and the email: a frame with the words showing.
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(Math.min(2, len - 0.2)), "-i", join(dir, "reel.mp4"), "-frames:v", "1", "-q:v", "3", join(dir, "feed.jpg")]);
  console.log(`Reel: ${total.toFixed(1)}s, ${join(dir, "reel.mp4")}`);
} finally { rmSync(tmp, { recursive: true, force: true }); }

const postsDir = join(root, "posts");
const list = readdirSync(postsDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(postsDir, d.name, "post.json")))
  .map(d => { const p = JSON.parse(readFileSync(join(postsDir, d.name, "post.json"), "utf8")); return { id: d.name, date: p.date, title: p.title || p.headline, pillar: p.pillar || "", ...(existsSync(join(postsDir, d.name, "reel.mp4")) ? { reel: true } : {}) }; })
  .sort((a, b) => b.id.localeCompare(a.id));
writeFileSync(join(postsDir, "index.json"), JSON.stringify(list, null, 2) + "\n");
console.log(`Index has ${list.length} posts (${basename(dir)} is a Reel)`);
