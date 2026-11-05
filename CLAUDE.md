# claudy2.0: Enginerd

A static site that holds Enginerd's products, hosted on GitHub Pages at https://holyjerod.github.io/claudy2.0/ (the repo name has no hyphen).
Read PRODUCT.md for audience, tone, pages and content. DESIGN.md holds the concept and the design system.

## Identity
- The maker is "Enginerd". Never use the owner's real name: not in pages, meta, images, code, docs or commits.
- It is a platform for products, not a personal portfolio: no bio, no personal journey or timeline, no contact details.

## Stack
- Vite (vanilla JS, multi-page) and plain CSS with design tokens. All copy lives in src/data/site.js.
- Three.js for the hero only. GSAP and ScrollTrigger for scroll motion.
- No backend, no UI framework, no trackers.
- `base: '/claudy2.0/'` in vite.config.js. `npm run build` writes `dist/`.
- Deploy to Pages only when the owner says so.

## Design rules
- Dark by default, one accent colour, oversized serif headline, full-bleed WebGL hero, scroll-driven reveals.
- No purple gradients, no generic three-card grids, no reuse of the owner's old app interfaces.
- Respect prefers-reduced-motion: show a static hero frame and don't take over scrolling. Design for a phone first.
- Don't copy another site's code or design. Inspiration only.

## Content rules
- Every claim comes from PRODUCT.md or from the owner. Unknowns stay as visible placeholders (`{ todo }` in site.js).
- No invented features, numbers, awards or quotes. Live product links stay `#` until the owner fills them in.
- Copy sounds like a student, not a brochure. Run unslop on all copy.

## Never publish
- SP Group substation names, coordinates or map points, or any internship data: not in pages, screenshots, map files or code.
- localhost links, the FusionSolar login, the SP EEE Telegram invite, or any private invite.
- Admin numbers, passwords or tokens.
- Energy Learning Journey appears as screenshots or a recording only, with no link.

## Skills (.claude/skills)
- **Build and score:** awwwards (build), jury (score). **Copy:** unslop.
- **Polish:** better-interface, better-ui, better-typography, better-colors, better-layout, better-accessibility, better-writing.
- **Review and stress-test:** interface-review, break, variant. If a skill won't load, read its SKILL.md and follow it.
