# DESIGN.md · Layer by layer

## Brief
- **Subject:** Enginerd, who builds web tools, maps and 3D prints. The owner's real name never appears.
- **Audience:** people who might use the products, plus recruiters and lecturers (an assumption, flagged in PRODUCT.md).
- **Job:** a platform for the products: each one gets a page with what it is, why it was built, screenshots and a link. No bio, no personal journey, no contact details.
- **Language:** English.
- **Constraints:**
  - Vite with vanilla JS. Three.js for the hero, GSAP for scroll.
  - GitHub Pages, no backend.
  - Dark by default, one accent.
  - Copy comes only from PRODUCT.md.
  - The network blocks Fontshare and CDNs, so everything is self-hosted.

## Concepts considered (awwwards Phase 1)
| | A. Layer by layer (process + material) | B. Live wire (formal system) | C. Signal (material) |
|---|---|---|---|
| Idea | The site 3D-prints itself: outline first, then infill | One current runs hero to footer and powers each project | Growth as an oscilloscope trace that gains detail |
| Anchor | The maker 3D-prints and writes the spec before building | Computer Engineering, power-grid projects | Computer Engineering lab gear |
| Scores (orig/fit/build/port) | 4 / 4 / 3 / 2 | 3 / 4 / 4 / 4 | 3 / 3 / 4 / 4 |

**Picked A (by the owner).** It is the only one built on something the maker actually does: printing, and writing the spec before building. A slicer does the same thing, walls before infill.

**Rebrand (5 Nov 2026):** the name became Enginerd, and the site changed from a growth portfolio into a platform for products. The Journey page, the growth timeline, About and contact were removed.

## Concept card
```
Idea:        The site prints itself: every page is laid down layer by layer, outline first, then infill.
Metaphor:    an FDM 3D printer and its slicer (build plate, layers, perimeters, infill, nozzle, layer counter)
Signature:   the hero prints "Enginerd" in 3D on a base bar, like a name sign; scroll finishes the print
             (Three.js clip height + perimeter path + infill). Tall screens print two rows, "Engi" behind "nerd".
Emotion:     a machine quietly making something, right now, in a dark room
Motion verb: lay down (bottom up, in thin stepped layers; outlines draw before fills)
Screenshot:  the name half-printed, a hot orange top layer, the readout "LAYER 066 / 120"
```

## Palette (named after the printer)
| Role | Name | Hex | Notes |
|---|---|---|---|
| ground | build plate | `#0D0C0B` | warm near-black, like a textured PEI sheet |
| ink | natural PLA | `#EEEAE3` | text and the printed object |
| muted | cooled layer | `#A39E95` | 7.3:1 on ground |
| line | layer line | `rgba(238,234,227,.14)` | hairlines, used in thin stacks |
| accent | hot filament | `#FF6A1F` | 6.8:1 on ground. Only for what is hot: the fresh layer, the nozzle, focus, active states |
| curtain | plate shadow | `#161412` | page-transition layers, with a hot top edge |

Why near-black plus one orange (an art-direction "default to avoid"): the concept demands it. The plate is dark, and only hot plastic glows. The identity comes from the layered geometry and the readout, not from the colour pair.

## Type
| Role | Font | Source | Setting |
|---|---|---|---|
| Display | Gloock 400 | Google (self-hosted), also extruded in 3D | heavy, high contrast; tracking −0.03 to −0.045em; leading 0.88 |
| Text and UI | Instrument Sans (variable) | Google (self-hosted) | body 17 to 18 px / 1.55; UI 13 to 14 px |
| Readouts only | Martian Mono (variable, narrow) | Google (self-hosted) | the printer counter, layer numbers and coordinates; tabular figures |

Fluid scale:
- `--t-mega: clamp(4.5rem, 1rem + 16vw, 17rem)`
- `--t-xl: clamp(2.6rem, 1.3rem + 5vw, 6.5rem)`
- `--t-l: clamp(1.8rem, 1.3rem + 2vw, 3.2rem)`
- `--t-m: clamp(1.25rem, 1.1rem + .6vw, 1.6rem)`
- `--t-body: clamp(1.0625rem, 1rem + .2vw, 1.125rem)`

## Grid and rhythm
- **Columns:** 12 at 1024 px and up, 6 on tablet, 4 on phone.
- **Spacing:** margin `clamp(20px, 3.5vw, 64px)`, gutter `clamp(12px, 1.6vw, 24px)`.
- **Alignment rule:** everything starts on a column line. Display type hangs 0.06em into the margin, an optical indent.
- **Rhythm:** tall, short, tall. The hero is 190svh (90svh of print), the intro is short, the product list is tall, the making teaser is medium, and the footer is a full screen.

## Shape
- **Radius 0** everywhere: a print has crisp perimeters.
- **Circles** only for the nozzle and the status lamp.

## Motion language
- **Ease:** one family, `expo.out` (`cubic-bezier(.16,1,.3,1)`).
- **Layer variant:** the same timing with GSAP `steps(n)` for stepped "layer" reveals.
- **Durations:** micro 0.25 s, UI 0.45 s, reveal 0.9 s, hero 1.4 s. Stagger 40 ms.
- **Reveals:** `clip-path: inset(100% 0 0 0)` opening to `inset(0)` in 8 to 14 steps, so blocks rise in layers. Text lines rise out of a mask.
- **Primary hover:** "perimeter, then infill". A 1 px outline draws round the target first, then the fill floods up from the bottom in steps.
- **Nav hover:** the label rolls up one layer.
- **Utility links:** colour only.
- **Page transition:**
  - Leaving: dark curtain layers print up the screen in steps, led by a hot orange edge.
  - Arriving: the layers lift away.
  - At most 0.7 s each way.
- **Idle:** the nozzle keeps tracing the current layer's perimeter and the hot edge breathes. All on the GSAP ticker, paused off screen.
- **Reduced motion:** no GL, no smooth scroll, no scrub, no loader. The hero shows the name as a finished print, using a CSS layer-line texture (stacked in two rows on tall screens, like the 3D version).

## Composition plan (home)
```
1 HERO (four-corner frame, full-bleed GL)        2 INTRO (statement + margin note)
┌───────────────────────────────────────────┐    ┌───────────────────────────────────────────┐
│ Enginerd                  Products Making │    │ ████████████████████████████    spec ──┐  │
│                                           │    │ big serif statement, 8 cols     note    │  │
│     ▓▓ E n g i n e r d ▓▓ (3D, printing)   │    │ ████████████████████            mono    │  │
│     ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ base bar ●       │    │                                ────────┘  │
│ intro line (2 lines)        LAYER 066/120 │    └───────────────────────────────────────────┘
└───────────────────────────────────────────┘
   phone: two rows, "Engi" behind "nerd"
3 FEATURED PRODUCTS (index list + sticky preview) 4 MAKING (asymmetric image + caption)
┌───────────────────────────────────────────┐    ┌───────────────────────────────────────────┐
│ SG Linkies ........................ ↗ │▓▓▓│    │ ┌──────────────┐   Things you can hold     │
│ Singapore Gov Tree ................ ↗ │▓▓▓│    │ │ 3D render    │   text, 4 cols            │
│ Hawker Finder ..................... ↗ │▓▓▓│    │ └──────────────┘   link to Making          │
│ … 7 rows; preview prints in layers    │   │    └───────────────────────────────────────────┘
└───────────────────────────────────────────┘
5 FOOTER (final print, full screen)
┌───────────────────────────────────────────┐
│ PRINT COMPLETE · 120/120                  │
│ E N G I N E R D  (mega serif, full width) │
│ nav                         back to top   │
└───────────────────────────────────────────┘
```

## Inner pages
- **Products:** filter bar (All, Web apps, Design, Plans, 3D prints, School projects) over a mixed index. One title size; rows with an image show a thumbnail, rows without one stay text only.
- **Product page:**
  - Mega title, then a meta strip (breadcrumb, kind).
  - "What it is" and "Why I built it" in two columns.
  - A full-bleed screenshot printing in, then the link (or "Live link coming soon").
  - The next product as a large link.
- **Making:**
  - The 3D prints, each with its render.
  - A board wall for the design work, with title-only boards in a compact list.
  - Energy Learning Journey screenshots, no link.
  - A brief excerpt.
  - Spec-sheet rows for the school projects.
- **404:** "This page came out as spaghetti", a failed-print joke, with a way home.

## Genericness test
- **What a generic model would land on:** a dark hero with a glowing blob and a centred serif, three project cards, and a fade-up on every section.
- **What this site does instead:**
  - The hero is a working print simulation tied to scroll.
  - Work is an index list, not cards.
  - Reveals are stepped layers, not fades.
  - The 404 is a failed print.
  - Mono is used only where a printer would show a readout.
