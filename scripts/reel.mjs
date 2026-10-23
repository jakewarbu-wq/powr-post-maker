// Turns a clip (QuickTime .mov, .mp4, any orientation) into a branded Instagram Reel for posts/<id>:
// a 2-second title card (the post's Story design, using a frame of the clip as its photo),
// then up to 25 seconds of the clip with a small POWR mark, then the POWR end card.
// Also writes feed.jpg (the cover for the grid) and story.jpg. The original clip stays outside the repo.
// Usage: node scripts/reel.mjs posts/2026-10-24 path/to/clip.mov
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const dir = resolve(process.argv[2] || ""), clip = process.argv[3] ? resolve(process.argv[3]) : "";
if (!existsSync(join(dir, "post.json")) || !existsSync(clip)) { console.error("Usage: node scripts/reel.mjs posts/<id> path/to/clip.mov"); process.exit(1); }

const TITLE = 2, END = 2.5, FADE = 0.4, MAX = 25;
const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", clip]).toString());
if (!(dur > 1)) { console.error("The clip is too short or unreadable."); process.exit(1); }
const len = Math.min(dur, MAX);

const tmp = mkdtempSync(join(tmpdir(), "powr-reel-"));
try {
  // A frame from early in the clip becomes the photo on the cover and title card.
  const frame = join(tmp, "frame.jpg");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(Math.min(1.5, len / 3)), "-i", clip, "-frames:v", "1", "-q:v", "2", frame]);
  execFileSync("node", [join(root, "scripts/render.mjs"), dir, frame], { stdio: "inherit" });

  const v = "fps=30,format=yuv420p,setsar=1";
  const filter = [
    `[0:v]scale=1080:1920,${v}[t]`,
    `[1:v]trim=0:${len.toFixed(2)},setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,${v}[c]`,
    `[c][3:v]overlay=W-w-64:H-h-150,format=yuv420p[cm]`,
    `[2:v]scale=1080:1920,${v}[e]`,
    `[t][cm]xfade=transition=fade:duration=${FADE}:offset=${TITLE - FADE}[x1]`,
    `[x1][e]xfade=transition=fade:duration=${FADE}:offset=${(TITLE - FADE + len - FADE).toFixed(2)}[v]`,
  ].join(";");
  const total = TITLE + len + END - 2 * FADE;
  execFileSync("ffmpeg", ["-v", "error", "-y",
    "-loop", "1", "-t", String(TITLE), "-i", join(dir, "story.jpg"),
    "-i", clip,
    "-loop", "1", "-t", String(END), "-i", join(root, "assets/reel-end.png"),
    "-i", join(root, "assets/reel-mark.png"),
    "-f", "lavfi", "-t", total.toFixed(2), "-i", "anullsrc=r=44100:cl=stereo",
    "-filter_complex", filter, "-map", "[v]", "-map", "4:a", "-pix_fmt", "yuv420p",
    "-c:v", "libx264", "-profile:v", "high", "-preset", "medium", "-crf", "23", "-maxrate", "6M", "-bufsize", "12M",
    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-t", total.toFixed(2), join(dir, "reel.mp4")]);
  // Re-run the index so the Ready page knows this post has a Reel.
  execFileSync("node", [join(root, "scripts/render.mjs"), dir, frame], { stdio: "inherit" });
  console.log(`Reel: ${total.toFixed(1)}s, ${join(dir, "reel.mp4")}`);
} finally { rmSync(tmp, { recursive: true, force: true }); }
