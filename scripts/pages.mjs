// Generates every page as static HTML from src/data/site.js.
// Output: index.html, 404.html and the page folders at the repo root (gitignored; Vite builds them).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, SITE, NAV, CONTACT, FEATURED, GROUPS, OTHER, JOURNEY, CHAPTER0, DESIGN_WORK, BRIEFS, PRINTS } from '../src/data/site.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const L = SITE.layers;
const pad3 = (n) => String(n).padStart(3, '0');

// Text that may be a placeholder or a draft
function rich(v) {
  if (v == null) return '';
  if (typeof v === 'string') return esc(v);
  if (v.todo) return `<span class="ph"><span class="ph__tag">To fill in</span> ${esc(v.todo)}</span>`;
  if (v.draft) return `<span class="draft"><span class="draft__tag">Draft</span> ${esc(v.draft)}</span>`;
  return '';
}
const plain = (v) => (typeof v === 'string' ? v : v?.todo || v?.draft || '');

function img(src, alt, { w = 1440, h = 900, sizes = '(min-width: 1024px) 66vw, 100vw', lazy = true, thumb = 720, cls = '', small = false } = {}) {
  const set = thumb ? `srcset="${BASE}img/${src}-${thumb}.webp ${thumb}w, ${BASE}img/${src}.webp ${w}w" sizes="${sizes}"` : '';
  const file = small && thumb ? `${src}-${thumb}` : src;   // small: the fallback src is the thumbnail
  return `<img class="${cls}" src="${BASE}img/${file}.webp" ${set} width="${w}" height="${h}" alt="${esc(alt)}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`;
}

function head({ title, description, pathName, page, jsonld }) {
  const url = SITE.url + pathName;
  return `<!doctype html>
<html lang="en-SG">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0d0c0b">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="${page === 'project' ? 'article' : 'website'}">
<meta property="og:site_name" content="Joshua">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.url}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The name Joshua half printed, with a glowing orange top layer.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE.url}og.png">
<link rel="icon" href="${BASE}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${BASE}favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${BASE}apple-touch-icon.png">
<link rel="preload" href="${BASE}fonts/gloock-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${BASE}fonts/instrument-sans-400_700-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>(function(d){var h=d.documentElement;h.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)h.classList.add('motion');try{if(sessionStorage.getItem('nav-curtain'))h.classList.add('arriving')}catch(e){}setTimeout(function(){if(!window.__booted){h.classList.add('revealed-fallback');h.classList.remove('arriving','loading')}},3500)})(document)</script>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<script type="module" src="/src/main.js"></script>
</head>`;
}

const person = { '@type': 'Person', name: 'Joshua', description: SITE.role, url: SITE.url, affiliation: { '@type': 'CollegeOrUniversity', name: 'Singapore Polytechnic' } };

function header(page) {
  const links = NAV.map((n) => {
    const cur = n.page === page || (page === 'project' && n.page === 'projects');
    return `<li><a class="nav__link" href="${BASE}${n.href}"${cur ? ' aria-current="page"' : ''}><span class="roll"><span class="roll__a">${n.label}</span><span class="roll__b" aria-hidden="true">${n.label}</span></span></a></li>`;
  }).join('');
  return `<a class="skip-link" href="#main">Skip to content</a>
<div id="curtain" aria-hidden="true"></div>
<header class="frame" data-frame>
  <a class="brand" href="${BASE}"${page === 'home' ? ' aria-current="page"' : ''}><span class="brand__name">Joshua</span><span class="brand__lamp" aria-hidden="true"></span></a>
  <nav class="nav" aria-label="Main"><ul class="nav__list">${links}</ul></nav>
</header>`;
}

function footer() {
  const links = NAV.map((n) => `<li><a class="foot__link" href="${BASE}${n.href}">${n.label}</a></li>`).join('');
  return `<footer class="foot">
  <p class="readout foot__readout"><span class="lamp lamp--done" aria-hidden="true"></span>Print complete · layer ${L} / ${L}</p>
  <p class="foot__name" aria-hidden="true">Joshua</p>
  <div class="foot__grid">
    <div class="foot__contact"><h2 class="foot__h">Contact</h2><p>${rich(CONTACT)}</p></div>
    <nav class="foot__nav" aria-label="Footer"><ul>${links}</ul></nav>
    <div class="foot__meta">
      <p>Set in Gloock, Instrument Sans and Martian Mono. Built with Vite, Three.js and GSAP.</p>
      <p><a class="foot__link foot__top" href="#main">Back to top</a></p>
    </div>
  </div>
</footer>`;
}

function page({ file, title, description, pathName, pageId, body, jsonld, extraBody = '' }) {
  const html = `${head({ title, description, pathName, page: pageId, jsonld: jsonld || { '@context': 'https://schema.org', ...person } })}
<body data-page="${pageId}">
${header(pageId)}
${extraBody}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
</body>
</html>
`;
  const out = path.join(root, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  return pathName;
}

// ---------- shared blocks ----------
const workRows = FEATURED.map((p, i) => `
    <li class="work__item">
      <a class="work-row" href="${BASE}projects/${p.slug}/" data-preview="${p.shots[0].src}">
        <span class="work-row__name">${esc(p.name)}</span>
        <span class="work-row__line">${esc(p.short)}</span>
        <span class="work-row__layer readout">${esc(p.kind)}</span>
        <span class="work-row__go" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span>
        ${img(p.shots[0].src, '', { cls: 'work-row__thumb', sizes: '100vw', small: true })}
      </a>
    </li>`).join('');

function journeyBands(heading = 'h3') {
  return [...JOURNEY].reverse().map((m) => `
    <li class="band band--${m.id}" data-reveal="layers">
      <div class="band__head">
        <p class="readout band__layers">Layers ${m.layers[0]} to ${m.layers[1]}</p>
        <${heading} class="band__month">${m.month}</${heading}>
      </div>
      <ul class="band__items">${m.items.map((it) => `<li>${rich(it)}</li>`).join('')}<li>${rich({ todo: m.todo })}</li></ul>
      <div class="band__slab" aria-hidden="true" style="--from:${m.layers[0]};--to:${m.layers[1]}"></div>
    </li>`).join('');
}

const written = [];

// ---------- home ----------
written.push(page({
  file: 'index.html', pathName: '', pageId: 'home',
  title: 'Joshua · Computer Engineering student, Singapore Polytechnic',
  description: SITE.description,
  jsonld: { '@context': 'https://schema.org', '@graph': [{ ...person }, { '@type': 'WebSite', name: 'Joshua', url: SITE.url }] },
  extraBody: `<div id="loader" role="status" aria-label="Loading">
  <p class="loader__line readout"><span data-loader-status>Heating the nozzle</span> <span data-loader-count>000</span></p>
  <div class="loader__bar" data-loader-bar></div>
</div>`,
  body: `
<section class="hero" data-hero aria-labelledby="hero-title">
  <div class="hero__stage">
    <div id="gl" class="hero__gl" aria-hidden="true"></div>
    <div class="hero__plate" aria-hidden="true"></div>
    <h1 class="hero__name" id="hero-title" data-hero-name><span class="hero__name-text">Joshua</span></h1>
    <p class="hero__intro">${esc(SITE.role)}. I build web tools and maps, and I 3D-print things.</p>
    <div class="hero__readout">
      <p class="readout" aria-hidden="true"><span class="lamp" data-lamp></span><span data-layer>Layer ${pad3(L)} / ${L}</span></p>
      <p class="readout readout--dim" aria-hidden="true" data-status>Print complete</p>
      <button class="pause" type="button" data-pause aria-pressed="false"><span class="pause__icon" aria-hidden="true"></span><span data-pause-label>Pause the print</span></button>
    </div>
    <p class="hero__hint" data-hint aria-hidden="true">Keep scrolling to finish the print</p>
  </div>
</section>

<section class="intro" aria-labelledby="intro-title">
  <div class="intro__statement">
    <h2 id="intro-title" class="intro__title" data-split="lines">This site shows what I made, how I work, and how much I grew from September to November 2026.</h2>
  </div>
  <aside class="intro__note" data-reveal="layers">
    <p class="readout">How I work</p>
    <p>I write the spec before I build. A slicer works the same way: walls first, then infill.</p>
  </aside>
</section>

<section class="work" aria-labelledby="work-title">
  <div class="work__head">
    <h2 id="work-title" class="section-title" data-split="lines">Selected work</h2>
    <p class="work__count readout">${FEATURED.length} projects</p>
  </div>
  <div class="work__body">
    <ol class="work__list" data-work-list>${workRows}
    </ol>
    <figure class="work-preview" aria-hidden="true" data-work-preview>
      <img class="work-preview__img" src="${BASE}img/${FEATURED[0].shots[0].src}-720.webp" width="720" height="450" alt="" loading="lazy" decoding="async">
    </figure>
  </div>
  <p class="work__all"><a class="btn" href="${BASE}projects/"><span class="btn__label">See every project</span></a></p>
</section>

<section class="growth" aria-labelledby="growth-title">
  <div class="growth__head">
    <h2 id="growth-title" class="section-title" data-split="lines">Three months, one layer at a time</h2>
    <p class="growth__lead">September is the first layer. Each month sits on the one before it.</p>
  </div>
  <ol class="bands">${journeyBands('h3')}
  </ol>
  <p class="growth__more"><a class="btn" href="${BASE}journey/"><span class="btn__label">Read the journey</span></a></p>
</section>

<section class="making" aria-labelledby="making-title">
  <figure class="making__media" data-reveal="layers">
    ${img('tunnel-open', 'Render of my cable-tunnel model opened on its screw hinge.', { w: 1600, h: 1000, thumb: 800, sizes: '(min-width: 1024px) 55vw, 100vw' })}
  </figure>
  <div class="making__text">
    <h2 id="making-title" class="section-title" data-split="lines">Things you can hold</h2>
    <p>${esc(PRINTS[0].line)} ${esc(PRINTS[1].line)}</p>
    <p>That page also has my school projects from before I used AI, my design boards and my build briefs.</p>
    <p><a class="btn" href="${BASE}making/"><span class="btn__label">Chapter 0 and making</span></a></p>
  </div>
</section>`,
}));

// ---------- projects index ----------
const allItems = [
  ...FEATURED.map((p) => ({ group: 'web', name: p.name, line: p.short, thumb: p.shots[0].src, alt: p.shots[0].alt, href: `projects/${p.slug}/`, featured: true })),
  ...OTHER.map((o) => ({ group: o.group, name: o.name, line: o.line, thumb: o.thumb, alt: o.alt, href: o.page })),
];
const groupLabel = Object.fromEntries(GROUPS.map((g) => [g.id, g.label]));
written.push(page({
  file: 'projects/index.html', pathName: 'projects/', pageId: 'projects',
  title: 'Projects · Joshua',
  description: 'Every project Joshua can show from September to November 2026: web apps, design boards, plans, 3D prints and school projects from before AI.',
  body: `
<section class="page-head">
  <p class="readout page-head__readout">Print queue</p>
  <h1 class="page-title" data-split="lines">Projects</h1>
  <p class="page-lead">Everything I can show from September to November 2026, plus a few school projects from before. Pick a group to filter the list.</p>
</section>
<section class="queue" aria-label="Project list">
  <div class="filters" role="group" aria-label="Filter projects by group" data-filters>
    ${GROUPS.map((g, i) => `<button type="button" class="chip" data-filter="${g.id}" aria-pressed="${i === 0}">${g.label} <span class="chip__count readout">${g.id === 'all' ? allItems.length : allItems.filter((x) => x.group === g.id).length}</span></button>`).join('')}
  </div>
  <p class="sr-only" aria-live="polite" data-filter-status></p>
  <ul class="queue__list" data-queue>
    ${allItems.map((it) => `
    <li class="q-item${it.featured ? ' q-item--featured' : ''}" data-group="${it.group}">
      <a class="q-item__link" href="${BASE}${it.href}">
        <span class="q-item__media">${it.thumb ? img(it.thumb, it.alt || '', { sizes: '(min-width: 1024px) 18vw, 120px', small: true, w: it.thumb.startsWith('tunnel') || it.thumb.startsWith('solar') ? 1600 : 1440, h: it.thumb.startsWith('tunnel') || it.thumb.startsWith('solar') ? 1000 : 900, thumb: it.thumb.startsWith('tunnel') || it.thumb.startsWith('solar') ? 800 : 720 }) : `<span class="q-item__blank" aria-hidden="true"></span>`}</span>
        <span class="q-item__group readout">${groupLabel[it.group]}</span>
        <span class="q-item__name">${esc(it.name)}</span>
        <span class="q-item__line">${esc(it.line)}</span>
      </a>
    </li>`).join('')}
  </ul>
</section>`,
}));

// ---------- project pages ----------
FEATURED.forEach((p, i) => {
  const next = FEATURED[(i + 1) % FEATURED.length];
  const shots = p.shots.map((s, k) => `
    <figure class="shot${k ? ' shot--second' : ''}" data-reveal="layers">
      ${img(s.src, s.alt, { lazy: k > 0, sizes: '(min-width: 1440px) 1300px, 100vw' })}
    </figure>`).join('');
  written.push(page({
    file: `projects/${p.slug}/index.html`, pathName: `projects/${p.slug}/`, pageId: 'project',
    title: `${p.name} · Joshua`,
    description: `${p.short} A project by Joshua, a Computer Engineering student at Singapore Polytechnic.`,
    jsonld: { '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.name, description: p.what, author: person, url: `${SITE.url}projects/${p.slug}/` },
    body: `
<article class="case">
  <header class="case__head">
    <p class="readout case__meta"><a class="crumb" href="${BASE}projects/">Projects</a> <span aria-hidden="true">/</span> ${esc(p.kind)} · ${i + 1} of ${FEATURED.length}</p>
    <h1 class="case__title" data-split="lines">${esc(p.name)}</h1>
  </header>
  <div class="case__cols">
    <section class="case__block" aria-labelledby="what">
      <h2 id="what" class="case__h">What it is</h2>
      <p>${esc(p.what)}</p>
    </section>
    <section class="case__block" aria-labelledby="why">
      <h2 id="why" class="case__h">Why I built it</h2>
      <p>${rich(p.why)}</p>
    </section>
  </div>
  <div class="case__shots">${shots}
  </div>
  <section class="case__live" aria-labelledby="live">
    <h2 id="live" class="case__h">Try it</h2>
    ${p.link && p.link !== '#'
      ? `<p><a class="btn btn--hot" href="${esc(p.link)}"><span class="btn__label">Open ${esc(p.name)}</span></a></p>`
      : `<p class="soon readout"><span class="lamp" aria-hidden="true"></span>Live link coming soon</p>
    <p class="case__note">${rich({ todo: 'Paste the public link into src/data/site.js. My artifacts are private for now.' })}</p>`}
  </section>
</article>
<nav class="next" aria-label="Next project">
  <a class="next__link" href="${BASE}projects/${next.slug}/">
    <span class="readout next__label">Next in the queue</span>
    <span class="next__name">${esc(next.name)}</span>
  </a>
</nav>`,
  }));
});

// ---------- journey ----------
written.push(page({
  file: 'journey/index.html', pathName: 'journey/', pageId: 'journey',
  title: 'Journey · Joshua',
  description: 'What Joshua built and learned each month from September to November 2026, from the first project to this site.',
  body: `
<section class="page-head">
  <p class="readout page-head__readout">Layers 1 to ${L}</p>
  <h1 class="page-title" data-split="lines">Journey</h1>
  <p class="page-lead">What I built and learned each month, from my first project to this site. One month per band of layers, starting at the bottom of the print.</p>
</section>
<section class="journey" aria-label="September to November 2026">
  <ol class="bands bands--page">${journeyBands('h2')}
  </ol>
</section>`,
}));

// ---------- making ----------
written.push(page({
  file: 'making/index.html', pathName: 'making/', pageId: 'making',
  title: 'Chapter 0 and making · Joshua',
  description: 'School projects from before AI, design boards and art, the build briefs Joshua writes first, and his 3D-printed models.',
  body: `
<section class="page-head">
  <p class="readout page-head__readout">Before the first layer</p>
  <h1 class="page-title" data-split="lines">Chapter 0 and making</h1>
  <p class="page-lead">School projects from before I used AI, the design work behind my apps, my build briefs, and the models I print.</p>
</section>

<section class="mk" id="before" aria-labelledby="before-title">
  <h2 id="before-title" class="mk__title" data-split="lines">Chapter 0: before AI</h2>
  <ul class="specs">
    ${CHAPTER0.map((c) => `<li class="spec" data-reveal="layers"><p class="spec__tag readout">${esc(c.tag)}</p><h3 class="spec__name">${esc(c.name)}</h3><p class="spec__line">${rich(c.line)}</p></li>`).join('')}
  </ul>
</section>

<section class="mk" id="design" aria-labelledby="design-title">
  <h2 id="design-title" class="mk__title" data-split="lines">Design boards and art</h2>
  <ul class="boards">
    ${DESIGN_WORK.map((d) => `<li class="board${d.img ? ' board--img' : ''}" data-reveal="layers">${d.img ? `<figure class="board__media">${img(d.img, d.alt, { sizes: '(min-width: 1024px) 45vw, 100vw' })}</figure>` : ''}<h3 class="board__name">${esc(d.name)}</h3><p class="board__line">${esc(d.line)}</p></li>`).join('')}
  </ul>
</section>

<section class="mk mk--split" id="plans" aria-labelledby="plans-title">
  <div>
    <h2 id="plans-title" class="mk__title" data-split="lines">Briefs and plans</h2>
    <p class="mk__lead">I write the spec before I build. Here is one brief, cleaned up for sharing.</p>
  </div>
  <div class="brief" data-reveal="layers">
    <p class="readout">Example</p>
    <p class="brief__name">${BRIEFS.example.link && BRIEFS.example.link !== '#'
      ? `<a class="btn" href="${esc(BRIEFS.example.link)}"><span class="btn__label">Read the ${esc(BRIEFS.example.name)}</span></a>`
      : esc(BRIEFS.example.name)}</p>
    <p>${rich({ todo: BRIEFS.example.todo })}</p>
    <p class="readout brief__others-h">Other briefs and plans</p>
    <ul class="brief__others">${BRIEFS.others.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
  </div>
</section>

<section class="mk" id="prints" aria-labelledby="prints-title">
  <h2 id="prints-title" class="mk__title" data-split="lines">3D-printed models</h2>
  <div class="prints">
    ${PRINTS.map((p) => `<article class="print" id="${p.id}">
      <h3 class="print__name">${esc(p.name)}</h3>
      <p class="print__line">${esc(p.line)}</p>
      <div class="print__imgs">${p.imgs.map((im) => `<figure class="print__media" data-reveal="layers">${img(im.src, im.alt, { w: 1600, h: 1000, thumb: 800, sizes: '(min-width: 1024px) 50vw, 100vw' })}</figure>`).join('')}</div>
    </article>`).join('')}
  </div>
</section>

<section class="mk mk--split" id="energy-learning-journey" aria-labelledby="elj-title">
  <div>
    <h2 id="elj-title" class="mk__title" data-split="lines">Energy Learning Journey</h2>
    <p class="mk__lead">Screenshots only. The live version stays private.</p>
  </div>
  <div class="elj">
    <figure class="elj__wide" data-reveal="layers">${img('energy-learning-journey', 'Energy Learning Journey on a desktop: a 3D island grid with a welcome card and four numbered segments.', { sizes: '(min-width: 1024px) 50vw, 100vw' })}</figure>
    <figure class="elj__phone" data-reveal="layers">${img('energy-learning-journey-phone', 'Energy Learning Journey on a phone: the island grid above a welcome card.', { w: 780, h: 1688, thumb: 0, sizes: '(min-width: 1024px) 16vw, 45vw' })}</figure>
  </div>
</section>

<section class="mk" id="internship" aria-label="Internship write-up">
  <p class="placeholder-block">${rich({ todo: 'Internship write-up goes here once you confirm it can be public. No real data or map points. Delete this block if not.' })}</p>
</section>`,
}));

// ---------- about ----------
written.push(page({
  file: 'about/index.html', pathName: 'about/', pageId: 'about',
  title: 'About · Joshua',
  description: 'Joshua is a Computer Engineering student at Singapore Polytechnic who writes the spec before he builds.',
  body: `
<section class="page-head">
  <p class="readout page-head__readout">Operator</p>
  <h1 class="page-title" data-split="lines">About</h1>
</section>
<section class="about">
  <p class="about__lead" data-split="lines">I’m Joshua. I study Computer Engineering at Singapore Polytechnic.</p>
  <div class="about__cols">
    <div class="about__block" data-reveal="layers">
      <h2 class="case__h">A bit about me</h2>
      <p>${rich({ todo: 'Two or three lines about you, in your own words.' })}</p>
    </div>
    <div class="about__block" data-reveal="layers">
      <h2 class="case__h">How I work</h2>
      <p>I write the spec before I build. ${rich({ draft: 'Then I build the smallest version that works and add to it, one layer at a time.' })}</p>
    </div>
    <div class="about__block" data-reveal="layers">
      <h2 class="case__h">What I make</h2>
      <ul class="about__list"><li>Web tools and maps</li><li>Design boards and design systems</li><li>3D-printed models</li></ul>
    </div>
  </div>
</section>`,
}));

// ---------- 404 ----------
page({
  file: '404.html', pathName: '404.html', pageId: 'notfound',
  title: 'Print failed · Joshua',
  description: 'This page came loose from the build plate.',
  body: `
<section class="lost">
  <p class="readout lost__readout"><span class="lamp lamp--error" aria-hidden="true"></span>Error · layer shift at layer 404</p>
  <h1 class="lost__title" data-split="lines">This page came out as spaghetti.</h1>
  <p class="page-lead">The print came loose from the bed. The page you wanted isn’t here.</p>
  <div class="lost__spaghetti" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<span style="--i:${i}"></span>`).join('')}</div>
  <p class="lost__links"><a class="btn btn--hot" href="${BASE}"><span class="btn__label">Start again from the home page</span></a> <a class="btn" href="${BASE}projects/"><span class="btn__label">See the projects</span></a></p>
</section>`,
});

// ---------- sitemap + robots ----------
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(root, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${written.map((p) => `  <url><loc>${SITE.url}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(root, 'public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}sitemap.xml\n`);
console.log(`pages: ${written.length + 1} written (incl. 404)`);
