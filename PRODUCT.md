# PRODUCT.md

## What the site is
- **Name on the site:** Enginerd. Never the owner's real name, anywhere.
- **Job of the site:** a platform for my products. Each featured product gets its own page: what it is, why I built it, screenshots and a link to try it.
- **Not on the site:** a bio, a personal journey or timeline, contact details.
- **Audience:** [TODO: confirm. Assumed: people who might use the products, plus recruiters and lecturers who want to see what I've built.]
- **Bar:** award-level, unlike a template.

## Tone
- First person, plain and specific. It should sound like a student, not a brochure.
- Short sentences. Name the real thing (the tool, the data, the problem), never a buzzword.
- Honest: say what's rough or unfinished. No invented numbers, features, awards or quotes.
- Every claim comes from this file or from me. Unknowns stay as visible placeholders.

## Pages
- **Home:** the hero print, one line on what I make, the featured products, a teaser for Making.
- **Products:** every product, filterable by group.
- **Product pages:** one per featured product. What it is, why I built it, screenshots, a link.
- **Making:** 3D-printed models, design boards and art, Energy Learning Journey screenshots, build briefs and plans, school projects.
- **404:** a failed print, with a way home.

## Featured products (full pages)
Live links are `#` until I fill them in. The artifacts are private for now.

| Product | What it is | Why I built it |
|---|---|---|
| SG Linkies | A link hub of every link I use in Singapore: 8 tabs, search, pins, a Marina Bay Sands night photo background with moving water, and a Skills tab for GitHub skill repos | [TODO] |
| Singapore Gov Tree | An explorer of how Singapore government bodies and agencies connect | [TODO] |
| Hawker Finder | A map for finding hawker centres, in a signboard and porcelain style | [TODO] |
| JB Bus Map | A map of bus routes and stops in Johor Bahru, plus a JB Bus Stops view | [TODO] |
| Events SG | Where to find events around Singapore | [TODO] |
| Bored Go Where | Free or cheap places to explore in Singapore that are not tourist traps | [TODO] |
| SP Student Guide | A search-first guide to Singapore Polytechnic for new students | [TODO] |

## Also show
- **3D-printed models:** the cable-tunnel hinge and the solar farm, with renders.
- **Design boards and art:** Grid Exhibit (58 boards), Ringgit style boards and plates, Mural Malaysia, and the Sumi Current and JB Mural design systems.
- **Briefs and plans:** my build briefs and plan docs, to show I write a spec before I build.
  - Link one cleaned-up example, such as the SG Linkies build brief.
- **School projects:** one short line each. DRAFT lines from my own notes, to confirm or rewrite.
  - CampusMart (Flutter): a marketplace app for students to buy and sell.
  - Fruit-scanner CNN: a self-checkout model that sorts banana, kiwi, mango or unknown.
  - Raspberry Pi lift controller: a 10-floor lift prototype written in C.
  - STM32 flood system: detects road flooding, sends alerts and raises a barricade.

## Adding a product
Follow "Add a product" in README.md. Products go in `src/data/site.js`; nothing else needs editing.

## Sensitive material
- **SP Grid Atlas and anything from the SP Group internship:** not on the site. Nothing goes public until I confirm it's allowed.
  - If it is ever added: no real SP Group substation names or coordinates anywhere, including screenshots, map files and code.
  - Only a short write-up of what I built, no map points, and a line saying the real data is withheld.
- **Energy Learning Journey (desktop and mobile):**
  - Never link to it or reproduce its localhost or FusionSolar links.
  - Use screenshots or a short recording of the finished pages only.
- **SG Linkies:** the public version must not include the private SP EEE Telegram invite.
- **Never include:** an admin number, a password, a token, or any private invite.
