# Automatic posts (4 a week)

A scheduled Claude session wakes every Monday, Tuesday, Wednesday, Friday and Saturday morning. Each week there are at most **4 posts**: Tuesday's Statement, plus 3 of Monday, Wednesday, Friday and Saturday. One of those four days is skipped at random each week. Each run adds at most one finished post to `posts/`. The owner picks it up from `ready.html` on the GitHub Pages site, which can be filtered by day of the week.

## 0. Check whether today is the week's skip day

```bash
node scripts/skip-day.mjs
```

If `skipToday` is true, stop: make no post and send no email. Just say "No post today (this week's skip day)". Tuesday is never skipped. Also stop if `posts/` already holds 4 posts dated this week (Monday to Sunday).

## 1. Decide what today's post is about

### Start from the week and the time of year

Before choosing the post, work out what this week is like in Clitheroe and the UK:

- the season, the weather people are dealing with (dark evenings, cold mornings, spring light, summer holidays), and any clock change;
- school holidays and half terms in Lancashire;
- bank holidays, and national moments or awareness days that fall in the coming 7 days.

Then read the content calendar Google Sheet `1nT0P1lHylH-bXXSEFmhkWF1_Gz0cOLcc__isC7RdcBM` with the Google Sheets connector:

- **Monthly themes**: the row for the current month sets the theme, the offer or call to action, and the classes to feature. If the week straddles two months, lead into the next month's theme in the last few days.
- **Key dates**: if a moment falls within the next 3 days, use it, unless it says "Check nearer the time", has an empty Date, or is marked Posted. Mention moments later in the week as "coming up".
- **Weekly rhythm**: the pillar for the day.

Read this week's earlier posts in `posts/` (up to 3 since Monday) and the last 10 entries in `posts/index.json`. The four posts each week should read as one connected set: same monthly theme, different angles, and no repeated headline or opening line.

### Pillar for each day

The posts are still images with no photo:

| Day | Pillar | `type` |
|---|---|---|
| Monday | Week ahead: the month's theme, what the week holds (key dates, seasonal moment) and a reason to book this week | `time` or `motiv` |
| Tuesday | Statement: one short, quotable line in the studio's voice (strength, posture, wellbeing, the season), with the caption expanding on it. Always use `style: "statement"`. The headline is the quote, sentence case, up to about 8 words. The detail is a short uppercase-friendly line such as "Reformer · Mat · Stretch". | `motiv` |
| Wednesday | Teach something: one practical Pilates or posture tip tied to the season (for example, desk posture in dark winter weeks, or mobility for spring runners) | `cls` or `motiv` |
| Friday | Monthly theme, key date or current offer from the calendar | `offer`, `news` or `cls` |
| Saturday | Weekend and local: Rest and reset or Local Clitheroe from the calendar's weekly rhythm. Use a weekend stretch or self-care tip, a nod to the Ribble Valley in this season, or a "plan next week's classes" nudge. Keep it gentle and low pressure. | `motiv` or `cls` |

Tuesday always uses `statement`. On other days, rotate `style` through `arch`, `overlay` and `frame`, so it differs from the previous non-Tuesday post.

## 2. Facts you may use

- The studio is POWR Studio, 9 York Street, Clitheroe (Ribble Valley, Lancashire), Instagram @powrstudioclitheroe.
- Classes to mention are Reformer Pilates, Mat Pilates, Stretch, and PT / 1-2-1s. Booking is through the link in the bio (ClassFit).
- Barre is on hold: never mention Barre (in captions, headlines or hashtags), even where the calendar suggests it. Swap in another class. Jake will say when it is back.
- Known prices (from the studio's ClassFit price list): a single Reformer class is £18, and the Reformer Foundations intro of 3 classes is £45. These undercut other local studios (£20 to £25), but never name a competitor. Use them when a post is about trying Reformer or about value.
- Never invent any other prices, class times, dates, member names, testimonials or offers that aren't written in the calendar. If a calendar offer has no details, say "details in our Stories" or "link in bio".
- Don't write member spotlights or anything that needs a real person's consent.
- Don't name or recommend other local businesses unless the calendar does.

## 3. Write `posts/YYYY-MM-DD/post.json`

Use today's date in the folder name:

```json
{
  "date": "2026-10-19",
  "title": "Short name shown on the Ready to post page",
  "day": "Monday",
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

## 5. Email the reminder

Reminder emails: **OFF** (waiting for Jake to approve the test email; switch to ON once he does)

When this is ON, wait for the Pages workflow to finish so the images are live. Then build the email:

```bash
node scripts/email.mjs posts/YYYY-MM-DD
```

This prints `{subject, html, text}`. Send it with the Gmail connector from Jake's Gmail to `caroline@powrstudio.co.uk`: `htmlBody` = html, `body` = text, `subject` = subject. Send it once per post, and never to anyone else. If sending fails, say so in the thread reply; the post itself is still fine.
