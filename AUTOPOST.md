# Automatic posts (Monday, Wednesday, Friday)

A scheduled Claude session follows these steps each Monday, Wednesday and Friday morning. It adds one finished post to `posts/`. The owner then picks it up from `ready.html` on the GitHub Pages site.

## 1. Decide what today's post is about

Read the content calendar Google Sheet `1nT0P1lHylH-bXXSEFmhkWF1_Gz0cOLcc__isC7RdcBM` with the Google Sheets connector:

- **Monthly themes**: the row for the current month sets the theme, the offer or call to action, and the classes to feature.
- **Key dates**: if a moment falls within the next 3 days, use it, unless it says "Check nearer the time", has an empty Date, or is marked Posted.
- **Weekly rhythm**: the pillar for the day.

The posts here are still images with no photo, so use these pillars:

| Day | Pillar | `type` |
|---|---|---|
| Monday | Week ahead: the month's theme and a reason to book this week | `time` or `motiv` |
| Wednesday | Teach something: one practical Pilates, Barre or posture tip | `cls` or `motiv` |
| Friday | Monthly theme, key date or current offer from the calendar | `offer`, `news` or `cls` |

Read the last 6 entries in `posts/index.json` and don't repeat a headline or angle from them. Rotate `style` through `arch`, `overlay` and `frame`, so it differs from the previous post.

## 2. Facts you may use

- The studio is POWR Studio, 9 York Street, Clitheroe (Ribble Valley, Lancashire), Instagram @powrstudioclitheroe.
- Classes are Reformer Pilates, Mat Pilates, Barre, Stretch, and PT / 1-2-1s. Booking is through the link in the bio (ClassFit).
- Barre is the standout, because no other studio nearby offers it.
- Never invent prices, class times, dates, member names, testimonials or offers that aren't written in the calendar. If a calendar offer has no details, say "details in our Stories" or "link in bio".
- Don't write member spotlights or anything that needs a real person's consent.

## 3. Write `posts/YYYY-MM-DD/post.json`

Use today's date in the folder name:

```json
{
  "date": "2026-10-19",
  "title": "Short name shown on the Ready to post page",
  "pillar": "Week ahead",
  "type": "time",
  "style": "arch",
  "headline": "2 to 5 words, fits on the image",
  "detail": "Short line under it, max ~40 characters",
  "caption": "Finished caption...",
  "hashtags": ["#powrstudio", "#pilatesclitheroe", "..."],
  "source": "Which calendar rows this came from"
}
```

Caption voice:

- Warm, calm and encouraging. Beginners and all levels are welcome.
- British English. Always write POWR in capitals.
- Short lines with a blank line between ideas, and at most 3 emoji.
- No hashtags in the caption itself.
- Include a search phrase such as "Pilates in Clitheroe" or "reformer Pilates in the Ribble Valley".
- Finish with a call to action pointing to the link in the bio, then the last line `📍 POWR Studio, 9 York Street, Clitheroe`.

Hashtags: 5 to 8, always including `#powrstudio`.

## 4. Render and publish

```bash
node scripts/render.mjs posts/YYYY-MM-DD
```

Look at the rendered `feed.jpg` and `story.jpg` once. Check that the headline fits and nothing is cut off; if it is, shorten it and render again.

Then commit to `main` and push. The Pages workflow publishes the post to `ready.html`.

If any step fails, stop, and report the failing step and the error rather than pushing a broken post.
