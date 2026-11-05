// Generates every page as static HTML from src/data/site.js.
// Output: index.html, 404.html, products/ and making/ at the repo root (gitignored; Vite builds them).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, SITE, NAV, FEATURED, GROUPS, OTHER, SCHOOL, DESIGN_WORK, BRIEFS, PRINTS } from '../src/data/site.js';

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
<meta property="og:type" content="${page === 'product' ? 'article' : 'website'}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.url}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The word ${SITE.name} printed in 3D on a base bar, on a dark build plate.">
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

// The maker goes by Enginerd: no real name and no contact details anywhere on the site.
const maker = { '@type': 'Person', name: SITE.name, url: SITE.url };

function header(page) {
  const links = NAV.map((n) => {
    const cur = n.page === page || (page === 'product' && n.page === 'products');
    return `<li><a class="nav__link" href="${BASE}${n.href}"${cur ? ' aria-current="page"' : ''}><span class="roll"><span class="roll__a">${n.label}</span><span class="roll__b" aria-hidden="true">${n.label}</span></span></a></li>`;
  }).join('');
  return `<a class="skip-link" href="#main">Skip to content</a>
<div id="curtain" aria-hidden="true"></div>
<header class="frame" data-frame>
  <a class="brand" href="${BASE}"${page === 'home' ? ' aria-current="page"' : ''}><span class="brand__name roll"><span class="roll__a">${SITE.name}</span><span class="roll__b" aria-hidden="true">${SITE.name}</span></span><span class="brand__lamp" aria-hidden="true"></span></a>
  <nav class="nav" aria-label="Main"><ul class="nav__list">${links}</ul></nav>
</header>`;
}

function footer() {
  const links = [{ href: '', label: 'Home' }, ...NAV].map((n) => `<li><a class="foot__link" href="${BASE}${n.href}">${n.label}</a></li>`).join('');
  return `<footer class="foot">
  <p class="readout foot__readout"><span class="lamp lamp--done" aria-hidden="true"></span>Print complete · layer ${L} / ${L}</p>
  <p class="foot__name" aria-hidden="true">${SITE.name}</p>
  <div class="foot__grid">
    <nav class="foot__nav" aria-label="Footer"><ul>${links}</ul></nav>
    <div class="foot__meta">
      <p>Set in Gloock, Instrument Sans and Martian Mono. Built with Vite, Three.js and GSAP.</p>
      <p><a class="foot__link foot__top" href="#main">Back to top</a></p>
    </div>
  </div>
</footer>`;
}

function page({ file, title, description, pathName, pageId, body, jsonld, extraBody = '' }) {
  const html = `${head({ title, description, pathName, page: pageId, jsonld: jsonld || { '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: SITE.url + pathName, author: maker } })}
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
const workRows = FEATURED.map((p) => `
    <li class="work__item">
      <a class="work-row" href="${BASE}products/${p.slug}/" data-preview="${p.shots[0].src}">
        <span class="work-row__name">${esc(p.name)}</span>
        <span class="work-row__line">${esc(p.short)}</span>
        <span class="work-row__layer readout">${esc(p.kind)}</span>
        <span class="work-row__go" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span>
        ${img(p.shots[0].src, '', { cls: 'work-row__thumb', sizes: '100vw', small: true })}
      </a>
    </li>`).join('');

const allItems = [
  ...FEATURED.map((p) => ({ group: p.group || 'web', name: p.name, line: p.short, thumb: p.shots[0].src, alt: p.shots[0].alt, href: `products/${p.slug}/` })),
  ...OTHER.map((o) => ({ group: o.group, name: o.name, line: o.line, thumb: o.thumb, alt: o.alt, href: o.page })),
];

// The static name doubles as the reduced-motion hero. On tall screens it stacks in two rows, like the 3D print.
const ROWS = ['Engi', 'nerd'];
if (ROWS.join('') !== SITE.name) throw new Error('ROWS in scripts/pages.mjs must spell SITE.name');

const written = [];

// ---------- home ----------
written.push(page({
  file: 'index.html', pathName: '', pageId: 'home',
  title: `${SITE.name} · Web tools, maps and 3D prints`,
  description: SITE.description,
  jsonld: { '@context': 'https://schema.org', '@graph': [{ ...maker }, { '@type': 'WebSite', name: SITE.name, url: SITE.url }] },
  extraBody: `<div id="loader" role="status" aria-label="Loading">
  <p class="loader__line readout"><span data-loader-status>Heating the nozzle</span> <span data-loader-count>000</span></p>
  <div class="loader__bar" data-loader-bar></div>
</div>`,
  body: `
<section class="hero" data-hero aria-labelledby="hero-title">
  <div class="hero__stage">
    <div id="gl" class="hero__gl" aria-hidden="true"></div>
    <div class="hero__plate" aria-hidden="true"></div>
    <h1 class="hero__name" id="hero-title" data-hero-name><span class="sr-only">${SITE.name}</span><span class="hero__name-text" aria-hidden="true">${ROWS.map((r) => `<span class="hero__row">${r}</span>`).join('')}</span></h1>
    <p class="hero__intro">I build web tools and maps, and I 3D-print things.</p>
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
    <h2 id="intro-title" class="intro__title" data-split="lines">This is where I put them. Each product gets its own page: what it is, why I built it, and a link to try it.</h2>
  </div>
  <aside class="intro__note" data-reveal="layers">
    <p class="readout">How I work</p>
    <p>I write the spec before I build. A slicer works the same way: walls first, then infill.</p>
  </aside>
</section>

<section class="work" aria-labelledby="work-title">
  <div class="work__head">
    <h2 id="work-title" class="section-title" data-split="lines">Featured products</h2>
    <p class="work__count readout">${FEATURED.length} featured · ${allItems.length} in all</p>
  </div>
  <div class="work__body">
    <ol class="work__list" data-work-list>${workRows}
    </ol>
    <figure class="work-preview" aria-hidden="true" data-work-preview>
      <img class="work-preview__img" src="${BASE}img/${FEATURED[0].shots[0].src}-720.webp" width="720" height="450" alt="" loading="lazy" decoding="async">
    </figure>
  </div>
  <p class="work__all"><a class="btn" href="${BASE}products/"><span class="btn__label">See every product</span></a></p>
</section>

<section class="making" aria-labelledby="making-title">
  <figure class="making__media" data-reveal="layers">
    ${img('tunnel-open', 'Render of my cable-tunnel model opened on its screw hinge.', { w: 1600, h: 1000, thumb: 800, sizes: '(min-width: 1024px) 55vw, 100vw' })}
  </figure>
  <div class="making__text">
    <h2 id="making-title" class="section-title" data-split="lines">Things you can hold</h2>
    <p>${esc(PRINTS[0].line)} ${esc(PRINTS[1].line)}</p>
    <p>The making page also has my design boards, build briefs and school projects.</p>
    <p><a class="btn" href="${BASE}making/"><span class="btn__label">See the making page</span></a></p>
  </div>
</section>`,
}));

// ---------- products index ----------
const groupLabel = Object.fromEntries(GROUPS.map((g) => [g.id, g.label]));
const big = (t) => t.startsWith('tunnel') || t.startsWith('solar');
written.push(page({
  file: 'products/index.html', pathName: 'products/', pageId: 'products',
  title: `Products · ${SITE.name}`,
  description: `Every product on ${SITE.name}: web apps, design boards, plans, 3D prints and school projects, filtered by group.`,
  body: `
<section class="page-head">
  <p class="readout page-head__readout">Print queue</p>
  <h1 class="page-title" data-split="lines">Products</h1>
  <p class="page-lead">Everything I can show: web apps, design boards, plans, 3D prints and school projects. Pick a group to filter the list.</p>
</section>
<section class="queue" aria-label="Product list">
  <div class="filters" role="group" aria-label="Filter products by group" data-filters>
    ${GROUPS.map((g, i) => `<button type="button" class="chip" data-filter="${g.id}" aria-pressed="${i === 0}">${g.label} <span class="chip__count readout">${g.id === 'all' ? allItems.length : allItems.filter((x) => x.group === g.id).length}</span></button>`).join('')}
  </div>
  <p class="sr-only" aria-live="polite" data-filter-status></p>
  <ul class="queue__list" data-queue>
    ${allItems.map((it) => `
    <li class="q-item${it.thumb ? '' : ' q-item--text'}" data-group="${it.group}">
      <a class="q-item__link" href="${BASE}${it.href}">
        ${it.thumb ? `<span class="q-item__media">${img(it.thumb, it.alt || '', { sizes: '(min-width: 1024px) 18vw, 120px', small: true, w: big(it.thumb) ? 1600 : 1440, h: big(it.thumb) ? 1000 : 900, thumb: big(it.thumb) ? 800 : 720 })}</span>` : ''}
        <span class="q-item__group readout">${groupLabel[it.group]}</span>
        <span class="q-item__name">${esc(it.name)}</span>
        <span class="q-item__line">${esc(it.line)}</span>
      </a>
    </li>`).join('')}
  </ul>
</section>`,
}));

// ---------- product pages ----------
FEATURED.forEach((p, i) => {
  const next = FEATURED[(i + 1) % FEATURED.length];
  const shots = p.shots.map((s, k) => `
    <figure class="shot${k ? ' shot--second' : ''}" data-reveal="layers">
      ${img(s.src, s.alt, { lazy: k > 0, sizes: '(min-width: 1440px) 1300px, 100vw' })}
    </figure>`).join('');
  written.push(page({
    file: `products/${p.slug}/index.html`, pathName: `products/${p.slug}/`, pageId: 'product',
    title: `${p.name} · ${SITE.name}`,
    description: `${p.short} A product by ${SITE.name}.`,
    jsonld: { '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.name, description: p.what, author: maker, url: `${SITE.url}products/${p.slug}/` },
    body: `
<article class="case">
  <header class="case__head">
    <p class="readout case__meta"><a class="crumb" href="${BASE}products/">Products</a> <span aria-hidden="true">/</span> ${esc(p.kind)}</p>
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
<nav class="next" aria-label="Next product">
  <a class="next__link" href="${BASE}products/${next.slug}/">
    <span class="readout next__label">Next in the queue</span>
    <span class="next__name">${esc(next.name)}</span>
  </a>
</nav>`,
  }));
});

// ---------- making ----------
const boardsWithImg = DESIGN_WORK.filter((d) => d.img);
const boardsText = DESIGN_WORK.filter((d) => !d.img);
written.push(page({
  file: 'making/index.html', pathName: 'making/', pageId: 'making',
  title: `Making · ${SITE.name}`,
  description: `3D-printed models, design boards and art, build briefs and plans, and school projects by ${SITE.name}.`,
  body: `
<section class="page-head">
  <p class="readout page-head__readout">Workbench</p>
  <h1 class="page-title" data-split="lines">Making</h1>
  <p class="page-lead">The models I print, my design boards and art, my build briefs, and my school projects.</p>
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

<section class="mk" id="design" aria-labelledby="design-title">
  <h2 id="design-title" class="mk__title" data-split="lines">Design boards and art</h2>
  <ul class="boards">
    ${boardsWithImg.map((d) => `<li class="board" data-reveal="layers"><figure class="board__media">${img(d.img, d.alt, { sizes: '(min-width: 1024px) 45vw, 100vw' })}</figure><h3 class="board__name">${esc(d.name)}</h3><p class="board__line">${esc(d.line)}</p></li>`).join('')}
  </ul>
  <ul class="board-list">
    ${boardsText.map((d) => `<li class="board-list__item"><h3 class="board__name">${esc(d.name)}</h3><p class="board__line">${esc(d.line)}</p></li>`).join('')}
  </ul>
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

<section class="mk" id="school" aria-labelledby="school-title">
  <h2 id="school-title" class="mk__title" data-split="lines">School projects</h2>
  <ul class="specs">
    ${SCHOOL.map((c) => `<li class="spec" data-reveal="layers"><p class="spec__tag readout">${esc(c.tag)}</p><h3 class="spec__name">${esc(c.name)}</h3><p class="spec__line">${rich(c.line)}</p></li>`).join('')}
  </ul>
</section>`,
}));

// ---------- 404 ----------
page({
  file: '404.html', pathName: '404.html', pageId: 'notfound',
  title: `Print failed · ${SITE.name}`,
  description: 'This page came loose from the build plate.',
  body: `
<section class="lost">
  <p class="readout lost__readout"><span class="lamp lamp--error" aria-hidden="true"></span>Error · layer shift at layer 404</p>
  <h1 class="lost__title" data-split="lines">This page came out as spaghetti.</h1>
  <p class="page-lead">The print came loose from the bed. The page you wanted isn’t here.</p>
  <div class="lost__spaghetti" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<span style="--i:${i}"></span>`).join('')}</div>
  <p class="lost__links"><a class="btn btn--hot" href="${BASE}"><span class="btn__label">Start again from the home page</span></a> <a class="btn" href="${BASE}products/"><span class="btn__label">See the products</span></a></p>
</section>`,
});

// ---------- sitemap + robots (production builds only; QA builds must not rewrite tracked files) ----------
const today = new Date().toISOString().slice(0, 10);
const production = !process.env.SITE_BASE && !process.env.SITE_URL;
if (production) fs.writeFileSync(path.join(root, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${written.map((p) => `  <url><loc>${SITE.url}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
if (production) fs.writeFileSync(path.join(root, 'public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}sitemap.xml\n`);
console.log(`pages: ${written.length + 1} written (incl. 404)`);
