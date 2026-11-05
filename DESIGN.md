# DESIGN.md · Layer by layer

## Brief
- **Subject:** Joshua, a Computer Engineering student at Singapore Polytechnic who builds web tools, maps and 3D prints.
- **Audience:** recruiters, lecturers and admissions readers (an assumption, flagged in PRODUCT.md).
- **Job:** show the projects, how he works, and how much he grew between September and November 2026.
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
| Anchor | He 3D-prints, and he writes the spec before he builds | Computer Engineering, power-grid projects | Computer Engineering lab gear |
| Scores (orig/fit/build/port) | 4 / 4 / 3 / 2 | 3 / 4 / 4 / 4 | 3 / 3 / 4 / 4 |

**Picked A (by Joshua).** It is the only one built on something he actually does: he prints, and he specs before building. A slicer does the same thing, walls before infill.

## Concept card
```
Idea:        The portfolio prints itself: every page is laid down layer by layer, outline first, then infill.
Metaphor:    an FDM 3D printer and its slicer (build plate, layers, perimeters, infill, nozzle, layer counter)
Signature:   the hero prints "Joshua" in 3D; scroll finishes the print (Three.js clip height + perimeter line + infill cap)
Emotion:     a machine quietly making something, right now, in a dark room
Motion verb: lay down (bottom up, in thin stepped layers; outlines draw before fills)
Screenshot:  the name half-printed, a hot orange top layer, the readout "LAYER 112 / 240"
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
- **Rhythm:** tall, short, tall. The hero is 190svh (90svh of print), the intro is short, the work list is tall, the timeline is medium, and the footer is a full screen.

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
- **Reduced motion:** no GL, no smooth scroll, no scrub, no loader. The hero shows the name as a finished print, using a CSS layer-line texture.

## Composition plan (home)
```
1 HERO (four-corner frame, full-bleed GL)        2 INTRO (statement + margin note)
┌───────────────────────────────────────────┐    ┌───────────────────────────────────────────┐
│ Joshua                     Work Journey …  │    │ ████████████████████████████    spec ──┐  │
│                                           │    │ big serif statement, 8 cols     note    │  │
│      ▓▓ J o s h u a ▓▓  (3D, printing)     │    │ ████████████████████            mono    │  │
│      ━━━━━━━━━━━━━━━━━━●  hot layer         │    │                                ────────┘  │
│ intro line (2 lines)        LAYER 112/240 │    └───────────────────────────────────────────┘
└───────────────────────────────────────────┘
3 WORK (index list + sticky preview)             4 JOURNEY (cross-section: stacked layer bands)
┌───────────────────────────────────────────┐    ┌───────────────────────────────────────────┐
│ SG Linkies ........................ ↗ │▓▓▓│    │ NOV ██████████████████████  milestones    │
│ Singapore Gov Tree ................ ↗ │▓▓▓│    │ OCT ███████████████         milestones    │
│ Hawker Finder ..................... ↗ │▓▓▓│    │ SEP ████████                milestones    │
│ … 7 rows; preview prints in layers    │   │    │ (bottom = first layer, read upward)        │
└───────────────────────────────────────────┘    └───────────────────────────────────────────┘
5 MAKING (asymmetric image + caption)            6 FOOTER (final print, full screen)
┌───────────────────────────────────────────┐    ┌───────────────────────────────────────────┐
│ ┌──────────────┐   Things you can hold     │    │ PRINT COMPLETE · 240/240                  │
│ │ 3D render    │   text, 4 cols            │    │ J O S H U A  (mega serif, full width)     │
│ └──────────────┘   link to Making          │    │ contact [TODO]          nav · back to top │
└───────────────────────────────────────────┘    └───────────────────────────────────────────┘
```

## Inner pages
- **Projects:** filter bar (All, Web apps, Design, Plans, 3D prints, Before AI) over a mixed index. Rows with thumbnails print in.
- **Project page:**
  - Mega title, then a meta strip (group, live-link status).
  - "What it is" and "Why I built it" in two columns.
  - A full-bleed screenshot printing in, then the link.
  - The next project as a large link.
- **Journey:** three month chapters as stacked bands. The thickest is at the top (November), and you read from the first layer up. Milestones are listed.
- **Chapter 0 and Making:**
  - Spec-sheet rows for the school projects.
  - A board wall for the design work.
  - A brief excerpt.
  - The 3D prints, each with its render.
- **About:** a short personal statement, then how I work.
- **404:** "This page came out as spaghetti", a failed-print joke, with a way home.

## Genericness test
- **What a generic model would land on:** a dark hero with a glowing blob and a centred serif, three project cards, and a fade-up on every section.
- **What this site does instead:**
  - The hero is a working print simulation tied to scroll.
  - Work is an index list, not cards.
  - Reveals are stepped layers, not fades.
  - The timeline is a print cross-section.
  - The 404 is a failed print.
  - Mono is used only where a printer would show a readout.
