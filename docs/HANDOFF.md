# Handoff: what has been built so far

For any chat or session picking up this work. Last updated 6 Nov 2026.
Work lives on the `claude/portfolio-site` branch. **The site is not deployed yet.**

## Links
- **Branch:** https://github.com/holyjerod/claudy2.0/tree/claude/portfolio-site
- **Every change compared with main:** https://github.com/holyjerod/claudy2.0/compare/main...claude/portfolio-site
- **Live address once deployed:** https://holyjerod.github.io/claudy2.0/
- **The Claude Code session that built it:** https://claude.ai/code/session_01UVXd3VXVLSsUmYTE7F5Zra (id `session_01UVXd3VXVLSsUmYTE7F5Zra`)

To continue in another session: attach `holyjerod/claudy2.0`, check out `claude/portfolio-site`, then read CLAUDE.md, PRODUCT.md and this file.

## What the site is
- **Enginerd:** a platform for the owner's products. It has no real name, bio, personal journey or contact details (see CLAUDE.md).
- **Concept, "Layer by layer":** the site prints itself like an FDM printer. The home hero prints "Enginerd" in 3D on a base bar, and scrolling finishes the print. Tall screens print two rows, "Engi" behind "nerd".
- **Pages:**
  - Home: the hero, an intro, the 7 featured products and a Making teaser.
  - Products: every product, with filters.
  - A page for each featured product.
  - Making: 3D prints, design boards, Energy Learning Journey screenshots, briefs and school projects.
  - 404: a failed print.
- **Stack:** Vite (multi-page, vanilla JS), Three.js for the hero, GSAP and ScrollTrigger, and Lenis on desktop. All copy is in `src/data/site.js`, and `scripts/pages.mjs` generates the HTML.

## Key files
| File | What it holds |
|---|---|
| [CLAUDE.md](../CLAUDE.md) | Rules for Claude: identity, stack, design, content, never-publish list |
| [PRODUCT.md](../PRODUCT.md) | Audience, tone, pages, product list, sensitive material |
| [DESIGN.md](../DESIGN.md) | Concept card, palette, type, grid, motion, page compositions |
| [README.md](../README.md) | Run, build, add a product, fill-ins, deploy steps |
| [src/data/site.js](../src/data/site.js) | All copy and the product list |
| [scripts/pages.mjs](../scripts/pages.mjs) | Generates every page from site.js |
| [src/hero/print.js](../src/hero/print.js) | The 3D print hero (Three.js) |
| [src/styles/main.css](../src/styles/main.css) | Tokens and all styles |
| [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) | Pages deploy, manual trigger only |
| [.claude/skills/](../.claude/skills/) | Installed skills: awwwards, jury, better-*, interface-review, break, variant, unslop |

## History (commits on the branch)
1. `467bab3` Add design skills as repo skills
2. `8cec606` Add PRODUCT.md and CLAUDE.md
3. `57e326a` Build the Layer by layer site
4. `5cb327e` Polish pass: accessibility, layout, writing, type, colour, motion, copy (better-* skills and unslop)
5. `1cd7214` and `3022d8f` Housekeeping: ignore Python caches, keep QA builds from rewriting the sitemap
6. `13d0057` Hover treatments for the home link, the pause control and the breadcrumb
7. `2136f82` Rebrand to Enginerd: a platform for products

## Jury score (independent critic, scored before the rebrand)
Estimate, not affiliated with Awwwards. Critic overall **7.0**, jury estimate **about 8.1** (critic + 1.1, a gap measured on two Sites of the Day).

| Design | Usability | Creativity | Content | Sem/SEO | Motion | A11y | WPO | Responsive | Markup |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 7 | 7.5 | 6 | 8 | 6.5 | 8 | 7 | 7 | 6.5 |

Fixed since then:
- Clipped descenders.
- The header overlapping content.
- The small, blocky phone hero.
- The share image.
- Empty thumbnails.
- Naming and count mismatches.
- Hovers.
- The Making grid gap.
- Meta description length.

Still open, because it needs the owner's words: the placeholders and deeper product pages.

## Last measured (5 page types, 5 Nov 2026)
- Phone LCP 1.12–1.21 s on a throttled phone, CLS ≤ 0.003.
- 0 errors, no horizontal overflow, 0 small targets, 0 serious axe violations, skip link first, visible focus.
- Reduced motion: nothing hidden, nothing moving.
- Hero frame rate can't be judged in the cloud container (software GPU). The hero never renders below 1× so it stays sharp.

## Open items
- [ ] Fill in `src/data/site.js`:
  - `why` for the 7 products.
  - The 7 live links (`#` until public).
  - The SG Linkies brief link.
  - Confirm the 4 school-project lines marked Draft.
- [ ] Confirm the audience line in PRODUCT.md.
- [ ] Remove the private SP EEE Telegram invite from the live SG Linkies before linking it.
- [ ] Merge with **Squash and merge**, so older commits on this branch stay off `main`.
- [ ] Deploy only when the owner says so (steps in README.md).

## Also made in the same session (not in this repo)
- **Cable-tunnel model (3D print):**
  - Two halves joined by a hinge held with an M3×16 screw and an M3 nut.
  - Both halves lie flat on the bed, with no overhangs or supports.
  - The knuckle gap was widened to 0.6 mm so the top half fits.
- **Solar farm model (3D print):** 1:417 scale on a 0.5 mm base, built from a design canvas artifact.
- These STL files and scripts were sent to the owner as files and are not in any repository. The site shows only their renders.
