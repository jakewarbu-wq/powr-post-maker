# POWR Post Maker

A one-page tool for POWR Studio, Clitheroe. Add a photo and a few words, and it makes a branded Instagram feed image (1080×1350) and Story image (1080×1920), writes the caption and hashtags, and walks you through posting both.

Everything runs in the browser. Nothing is uploaded anywhere.

Open it at the GitHub Pages address for this repository (Settings → Pages).

## Automatic posts

Every Monday, Wednesday, Friday and Saturday morning a scheduled Claude session makes a new post from the content calendar (see `AUTOPOST.md`). It saves the post in `posts/`, and the post then appears on `ready.html`.

To make one by hand, write `posts/YYYY-MM-DD/post.json` and run `node scripts/render.mjs posts/YYYY-MM-DD`.
