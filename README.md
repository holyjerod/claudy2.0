# claudy2.0

Enginerd: a platform for my products. The site prints itself, layer by layer.

- **Concept and design system:** DESIGN.md
- **Audience, tone and content rules:** PRODUCT.md
- **Short rule sheet for Claude:** CLAUDE.md

## Run it

```bash
npm install
npm run dev          # http://localhost:5173/claudy2.0/
npm run build        # writes dist/ for GitHub Pages
npm run preview      # serves dist/ at http://localhost:4400/claudy2.0/
```

All copy lives in `src/data/site.js`. Each page is generated from it by `scripts/pages.mjs`, which `dev` and `build` run for you. Edit the data file, not the generated HTML.

## Add a product

1. Save a screenshot as WebP in `public/img/`, at 1440×900, plus a 720×450 copy with `-720` on the end of the name.
   For example `my-app.webp` and `my-app-720.webp`.
2. Open `src/data/site.js`.
   - **With its own page:** copy one block in `FEATURED` and change the `slug`, `kind`, `name`, `what`, `short`, `why`, `shots` and `link`.
     The page appears at `/products/<slug>/`, and the product shows on the home page and the Products page.
     It's filed under Web apps unless you add `group` with another id from `GROUPS`.
   - **As a row on the Products page only:** copy one line in `OTHER`. `group` is one of the ids in `GROUPS`, and `page` is where the row links to.
3. Run `npm run build` and check it with `npm run preview`.

Leave `link: '#'` until the product has a public link. The page then says "Live link coming soon".

## Fill in before you publish

Search the site for **"To fill in"** and **"Draft"**.

| Where | What |
|---|---|
| `src/data/site.js` → `FEATURED[].why` | Why you built each featured product |
| `src/data/site.js` → `FEATURED[].link` | Public links (now `#`) |
| `src/data/site.js` → `SCHOOL` | One line per school project. Drafts come from your own notes |
| `src/data/site.js` → `BRIEFS.example.link` | A cleaned-up copy of the SG Linkies build brief |

## Deploy to GitHub Pages (only when you're ready)

1. Merge this branch into `main` with **Squash and merge**, so the branch's working history doesn't land on `main`.
2. On GitHub, open **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open **Actions → Deploy to GitHub Pages → Run workflow**.
4. After about a minute the site is live at https://holyjerod.github.io/claudy2.0/.

The workflow only runs when you start it. Merging alone doesn't deploy.

## Local QA build

```bash
SITE_BASE=/ SITE_URL=http://127.0.0.1:4401/ npm run build
node .claude/skills/awwwards/scripts/serve.mjs dist-qa --port 4401
```

This builds a copy served from `/`, so the `awwwards` and `jury` scripts can crawl it.

## Change the name in the hero

The 3D name only carries the glyphs it needs. After changing `SITE.name` (and `ROWS` in `scripts/pages.mjs`), regenerate them from the Gloock TTF:

```bash
npm run typeface -- path/to/Gloock-Regular.ttf "NewName" src/hero/gloock-hero.json
```
