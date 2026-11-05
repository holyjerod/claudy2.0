# claudy2.0: Joshua's portfolio

Static portfolio site, hosted on GitHub Pages at https://holyjerod.github.io/claudy2.0/ (the repo name has no hyphen).
Read PRODUCT.md for audience, tone, pages and content. DESIGN.md, once written, holds the concept and the design system.

## Stack
- Vite (vanilla JS, multi-page) and plain CSS with design tokens.
- Three.js for the hero only. GSAP and ScrollTrigger for scroll motion.
- No backend, no UI framework, no trackers.
- Set `base: '/claudy2.0/'` in vite.config.js. Build with `npm run build`, which writes to `dist/`.
- Deploy to Pages only when Joshua says so.

## Design rules
- Dark by default, one accent colour, oversized serif headline, full-bleed WebGL hero, scroll-driven reveals.
- No purple gradients, no generic three-card grids, no reuse of Joshua's old app interfaces.
- Respect prefers-reduced-motion: show a static hero frame and don't take over scrolling. Design for a phone first.
- Don't copy another site's code or design. Inspiration only.

## Content rules
- Every claim comes from PRODUCT.md or from Joshua. Unknowns stay as visible placeholders: `[TODO Joshua: …]`.
- No invented features, numbers, awards or quotes. Live project links stay `#` until Joshua fills them in.
- Copy sounds like a student, not a brochure. Run unslop on all copy.

## Never publish
- SP Group substation names, coordinates or map points, or any internship data: not in pages, screenshots, map files or code.
- localhost links, the FusionSolar login, the SP EEE Telegram invite, or any private invite.
- Admin numbers, passwords or tokens.
- Energy Learning Journey appears as screenshots or a recording only, with no link.

## Skills (.claude/skills)
- **Build and score:** awwwards (build), jury (score).
- **Polish:** better-interface, better-ui, better-typography, better-colors, better-layout, better-accessibility, better-writing.
- **Review and stress-test:** interface-review, break, variant.
- **Copy:** unslop.
- If a skill won't load, read its SKILL.md and follow it directly.
