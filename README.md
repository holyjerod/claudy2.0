# claudy2.0

Joshua's portfolio. The site prints itself, layer by layer.

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

## Fill in before you publish

Search the site for **"To fill in"** and **"Draft"**.

| Where | What |
|---|---|
| `src/data/site.js` → `FEATURED[].why` | Why you built each featured project |
| `src/data/site.js` → `FEATURED[].link` | Public links (now `#`) |
| `src/data/site.js` → `JOURNEY` | Three or four milestones per month. Drafts come from your artifact dates |
| `src/data/site.js` → `CHAPTER0` | One line per school project. Drafts come from your own notes |
| `src/data/site.js` → `CONTACT` | Contact links, or delete the line |
| `src/data/site.js` → `BRIEFS.example.link` | A cleaned-up copy of the SG Linkies build brief |
| `scripts/pages.mjs` → About page | Two or three lines about you |
| `scripts/pages.mjs` → `#internship` block on Making | Delete it, or replace it once SP says the write-up can be public |

## Deploy to GitHub Pages (only when you're ready)

1. Merge this branch into `main`.
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
