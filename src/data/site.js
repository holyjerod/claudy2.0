// All site copy lives here. Every claim comes from PRODUCT.md or from the owner (Enginerd).
// { todo: '…' } renders as a visible "To fill in" marker. { draft: '…' } renders with a "Draft" marker.
// Edit this file, then run `npm run dev` or `npm run build`.
// Adding a product: see "Add a product" in README.md.

// SITE_BASE=/ builds a copy served from the root (used for local QA). GitHub Pages uses /claudy2.0/.
export const BASE = (typeof process !== 'undefined' && process.env.SITE_BASE) || '/claudy2.0/';
export const SITE = {
  url: (typeof process !== 'undefined' && process.env.SITE_URL) || 'https://holyjerod.github.io/claudy2.0/',
  name: 'Enginerd',
  description: 'Products by Enginerd: web tools and maps, design boards, build briefs and 3D-printed models.',
  layers: 120,
};

export const NAV = [
  { href: 'products/', label: 'Products', page: 'products' },
  { href: 'making/', label: 'Making', page: 'making' },
];

// Featured products: one full page each. Live links stay '#' until the public links are ready.
export const FEATURED = [
  {
    slug: 'sg-linkies',
    kind: 'Link hub',
    name: 'SG Linkies',
    what: 'A link hub of every link I use in Singapore. It has 8 tabs, search, pins, a Marina Bay Sands night photo in the background with moving water, and a Skills tab for GitHub skill repos.',
    short: 'Every link I use in Singapore, in 8 tabs with search and pins.',
    why: { todo: 'One or two lines on why you built SG Linkies.' },
    shots: [{ src: 'sg-linkies', alt: 'SG Linkies: a search bar and eight tabs over a night photo of Marina Bay Sands.' }],
    link: '#',
  },
  {
    slug: 'singapore-gov-tree',
    kind: 'Explorer',
    name: 'Singapore Gov Tree',
    what: 'An explorer of how Singapore government bodies and agencies connect.',
    short: 'How Singapore government bodies and agencies connect.',
    why: { todo: 'One or two lines on why you built Singapore Gov Tree.' },
    shots: [
      { src: 'gov-tree', alt: 'Singapore Gov Tree opening screen with the headline “How Singapore is run.”' },
      { src: 'gov-tree-branches', alt: 'The whole tree: one trunk splitting into a fan of labelled branches.' },
    ],
    link: '#',
  },
  {
    slug: 'hawker-finder',
    kind: 'Map',
    name: 'Hawker Finder',
    what: 'A map for finding hawker centres, in a signboard and porcelain style.',
    short: 'A map for finding hawker centres.',
    why: { todo: 'One or two lines on why you built Hawker Finder.' },
    shots: [{ src: 'hawker-finder', alt: 'Hawker Finder: a list of hawker centres beside a map of Singapore with green pins.' }],
    link: '#',
  },
  {
    slug: 'jb-bus-map',
    kind: 'Map',
    name: 'JB Bus Map',
    what: 'A map of bus routes and stops in Johor Bahru, plus a JB Bus Stops view.',
    short: 'Bus routes and stops in Johor Bahru.',
    why: { todo: 'One or two lines on why you built JB Bus Map.' },
    shots: [
      { src: 'jb-bus-map', alt: 'JB Bus Map: coloured bus routes across Johor Bahru with a list of regions on the right.' },
      { src: 'jb-bus-stops', alt: 'The JB Bus Stops view: routes from JB Sentral drawn on a soft map, with stops listed by region.' },
    ],
    link: '#',
  },
  {
    slug: 'events-sg',
    kind: 'Guide',
    name: 'Events SG',
    what: 'Where to find events around Singapore.',
    short: 'Where to find events around Singapore.',
    why: { todo: 'One or two lines on why you built Events SG.' },
    shots: [{ src: 'events-sg', alt: 'Events SG: event cards over a night view of Marina Bay, with month filters along the bottom.' }],
    link: '#',
  },
  {
    slug: 'bored-go-where',
    kind: 'Guide',
    name: 'Bored Go Where',
    what: 'Free or cheap places to explore in Singapore that are not tourist traps.',
    short: 'Free or cheap places in Singapore that are not tourist traps.',
    why: { todo: 'One or two lines on why you built Bored Go Where.' },
    shots: [{ src: 'bored-go-where', alt: 'Bored Go Where: the headline “Bored? Go somewhere.” above a map of places with photo pins.' }],
    link: '#',
  },
  {
    slug: 'sp-student-guide',
    kind: 'Guide',
    name: 'SP Student Guide',
    what: 'A search-first guide to Singapore Polytechnic for new students.',
    short: 'A search-first guide to Singapore Polytechnic for new students.',
    why: { todo: 'One or two lines on why you built SP Student Guide.' },
    shots: [{ src: 'sp-student-guide', alt: 'SP Student Guide: a search box under the headline “Find SP modules by what they teach,” with topic tiles below.' }],
    link: '#',
  },
];

// Everything else on the Products page. `page` points to where the item lives.
export const GROUPS = [
  { id: 'all', label: 'All' },
  { id: 'web', label: 'Web apps' },
  { id: 'design', label: 'Design' },
  { id: 'plans', label: 'Plans' },
  { id: 'prints', label: '3D prints' },
  { id: 'school', label: 'School projects' },
];

export const OTHER = [
  {
    id: 'energy-learning-journey', group: 'web', name: 'Energy Learning Journey',
    line: 'Screenshots only. The live version stays private.', thumb: 'energy-learning-journey', page: 'making/#energy-learning-journey',
    alt: 'Energy Learning Journey: a 3D model of an island grid with a welcome card.',
  },
  { id: 'grid-exhibit', group: 'design', name: 'Grid Exhibit', line: '58 design boards.', page: 'making/#design' },
  { id: 'ringgit', group: 'design', name: 'Ringgit style boards and plates', line: 'Style boards and art plates.', thumb: 'ringgit-art', page: 'making/#design', alt: 'An engraved-style art plate of a tiger with fine rosette patterns.' },
  { id: 'mural-malaysia', group: 'design', name: 'Mural Malaysia', line: 'Street murals in one painted style.', thumb: 'mural-malaysia', page: 'making/#design', alt: 'A flat painted mural of a mosque with blue domes under a yellow sun.' },
  { id: 'sumi-current', group: 'design', name: 'Sumi Current', line: 'A design system.', page: 'making/#design' },
  { id: 'jb-mural', group: 'design', name: 'JB Mural', line: 'A design system.', page: 'making/#design' },
  { id: 'briefs', group: 'plans', name: 'Build briefs and plans', line: 'I write the spec before I build.', page: 'making/#plans' },
  { id: 'tunnel', group: 'prints', name: 'Cable-tunnel hinge', line: 'A tunnel model that opens on an M3 screw hinge.', thumb: 'tunnel-open', page: 'making/#prints', alt: 'Render of a cable-tunnel model opened on its hinge, showing walkways and cable trays inside.' },
  { id: 'solar-farm', group: 'prints', name: 'Solar farm', line: 'A 1:417 model on a 0.5 mm base.', thumb: 'solar-farm', page: 'making/#prints', alt: 'Render of a solar farm model: rows of panel tables, a road, a substation and a fence.' },
  { id: 'campusmart', group: 'school', name: 'CampusMart', line: 'A Flutter app.', page: 'making/#school' },
  { id: 'fruit-cnn', group: 'school', name: 'Fruit-scanner CNN', line: 'A CNN that scans fruit.', page: 'making/#school' },
  { id: 'lift', group: 'school', name: 'Raspberry Pi lift controller', line: 'A lift controller on a Raspberry Pi.', page: 'making/#school' },
  { id: 'flood', group: 'school', name: 'STM32 flood system', line: 'A flood system on an STM32.', page: 'making/#school' },
];

// School projects. The lines are drafts from the owner's own notes, to confirm or rewrite.
export const SCHOOL = [
  { name: 'CampusMart', tag: 'Flutter', line: { draft: 'A marketplace app for students to buy and sell.' } },
  { name: 'Fruit-scanner CNN', tag: 'CNN', line: { draft: 'A self-checkout model that sorts banana, kiwi, mango or unknown.' } },
  { name: 'Raspberry Pi lift controller', tag: 'Raspberry Pi', line: { draft: 'A 10-floor lift prototype written in C.' } },
  { name: 'STM32 flood system', tag: 'STM32', line: { draft: 'Detects road flooding, sends alerts and raises a barricade.' } },
];

export const DESIGN_WORK = [
  { name: 'Grid Exhibit', line: '58 design boards.' },
  { name: 'Ringgit style boards and plates', line: 'Style boards and art plates.', img: 'ringgit-style-boards', alt: 'Ringgit style board: a palette of note inks, a type sample and a bus-stop card.' },
  { name: 'Mural Malaysia', line: 'Street murals in one painted style.', img: 'mural-malaysia', alt: 'Mural Malaysia: the title “Walls of Malaysia” over a flat painted mosque scene.' },
  { name: 'Sumi Current', line: 'A design system.' },
  { name: 'JB Mural', line: 'A design system.' },
];

export const BRIEFS = {
  example: { name: 'SG Linkies build brief', link: '#', todo: 'Link a cleaned-up copy of the SG Linkies build brief.' },
  others: ['SP Student Guide build brief', 'JB Bus Map plan', 'Singapore Gov and Company Tree plan', 'Hawker Centre Finder plan'],
};

export const PRINTS = [
  {
    id: 'tunnel', name: 'Cable-tunnel hinge',
    line: 'A cable-tunnel model in two halves. It opens on a hinge held by an M3 screw and nut.',
    imgs: [
      { src: 'tunnel-open', alt: 'The tunnel model opened on its hinge, showing the walkway, cable trays and pipes inside.' },
      { src: 'tunnel-closed', alt: 'The tunnel model closed, with the screw hinge on its side.' },
    ],
  },
  {
    id: 'solar-farm', name: 'Solar farm',
    line: 'A solar farm model at 1:417 on a 0.5 mm base.',
    imgs: [{ src: 'solar-farm', alt: 'The solar farm model from above: rows of panel tables, a road, a substation and a fence.' }],
  },
];
