// Builds the reminder email for posts/<id>/post.json and prints {subject, html, text} as JSON.
// Usage: node scripts/email.mjs posts/2026-10-21
import { readFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";

const SITE = "https://jakewarbu-wq.github.io/powr-post-maker";
const dir = resolve(process.argv[2] || "");
const id = basename(dir);
const p = JSON.parse(readFileSync(join(dir, "post.json"), "utf8"));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const day = new Date((p.date || id) + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const caption = (p.caption || "").trim() + (p.hashtags?.length ? "\n\n" + p.hashtags.join(" ") : "");
const ready = `${SITE}/ready.html`;
const teal = "#15464D", blush = "#F4E9E6";

const subject = `Today's POWR post is ready: ${p.title || p.headline}`;
const html = `<!doctype html><html><body style="margin:0;background:${blush};font-family:Helvetica,Arial,sans-serif;color:${teal}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${blush}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px">
<tr><td style="padding:24px 24px 8px">
  <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#4E6F73">${esc(day)} · ${esc(p.pillar || "")}</p>
  <h1 style="margin:6px 0 0;font-size:22px;line-height:1.3;color:${teal}">Today's post is ready</h1>
  <p style="margin:8px 0 0;font-size:15px;line-height:1.5">It takes about two minutes. Open the <a href="${ready}" style="color:${teal};font-weight:bold">Ready to post page</a> on your phone, tap <b>Post to Instagram feed</b>, then paste the caption.</p>
  <p style="margin:10px 0 0;font-size:15px"><a href="${ready}" style="color:${teal};font-weight:bold">👉 Go to Ready to post</a></p>
</td></tr>
<tr><td style="padding:16px 24px"><a href="${ready}"><img src="${SITE}/posts/${id}/feed.jpg" width="512" alt="${esc(p.headline)}" style="display:block;width:100%;max-width:512px;height:auto;border-radius:8px;border:0"></a></td></tr>
<tr><td align="center" style="padding:0 24px 20px">
  <a href="${ready}" style="display:inline-block;background:${teal};color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 26px;border-radius:10px">Open Ready to post</a>
</td></tr>
<tr><td style="padding:0 24px 24px">
  <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#4E6F73">Caption</p>
  <div style="background:${blush};border-radius:10px;padding:14px;font-size:14px;line-height:1.5;white-space:pre-wrap">${esc(caption)}</div>
  <p style="margin:16px 0 0;font-size:15px;text-align:center"><a href="${ready}" style="color:${teal};font-weight:bold">Open the Ready to post page →</a><br><span style="font-size:12px;color:#4E6F73">${ready}</span></p>
  <p style="margin:14px 0 0;font-size:13px;color:#4E6F73">Story too? Use <b>Post to Instagram Story</b> on the same page, and add the booking link sticker: https://app.classfit.com/Studio/247669</p>
</td></tr>
</table>
<p style="font-size:12px;color:#4E6F73;margin:14px 0 0">POWR Studio · automatic post reminder · <a href="${SITE}/archive.html" style="color:#4E6F73">past posts</a></p>
</td></tr></table></body></html>`;
const text = `Today's POWR post is ready (${day}).\n\nOpen ${ready} on your phone, tap "Post to Instagram feed", then paste the caption.\n\nCaption:\n\n${caption}\n\nBooking link for Stories: https://app.classfit.com/Studio/247669`;
console.log(JSON.stringify({ subject, html, text }));
