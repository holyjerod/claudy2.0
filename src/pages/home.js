// Home: loader -> intro print -> scroll finishes the print. One driver (print fraction) feeds
// the GL clip height, the hot layer, the nozzle path and the readout in the corner.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const html = document.documentElement;
const BASE = import.meta.env.BASE_URL;
const pad3 = (n) => String(n).padStart(3, '0');

function readout(layer, total, done) {
  const l = document.querySelector('[data-layer]');
  const s = document.querySelector('[data-status]');
  const lamp = document.querySelector('[data-lamp]');
  if (l) l.textContent = `Layer ${pad3(layer)} / ${total}`;
  if (s) s.textContent = done ? 'Print complete' : layer === 0 ? 'Heating' : 'Printing';
  lamp?.classList.toggle('lamp--done', done);
  html.classList.toggle('print-done', done);
}

function workPreview() {
  const fig = document.querySelector('[data-work-preview]');
  const img = fig?.querySelector('img');
  if (!fig || !img || !matchMedia('(hover: hover) and (min-width: 1024px)').matches) return;
  const motion = html.classList.contains('motion');
  let current = img.getAttribute('src');
  const show = (name) => {
    const src = `${BASE}img/${name}-720.webp`;
    if (src === current) return;
    current = src;
    const next = new Image(); next.src = src;
    const swap = () => {
      img.src = src;
      if (motion) gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.42, ease: 'steps(8)', overwrite: true });
    };
    next.decode ? next.decode().then(swap, swap) : swap();
  };
  document.querySelectorAll('[data-preview]').forEach((row) => {
    const name = row.dataset.preview;
    row.addEventListener('pointerenter', () => show(name));
    row.addEventListener('focus', () => show(name));
  });
}

export async function initHome({ motion }) {
  workPreview();
  const L = 120;
  const hero = document.querySelector('[data-hero]');
  const host = document.getElementById('gl');
  const canGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
  if (!motion || !canGL || !hero || !host || navigator.connection?.saveData) { readout(L, L, true); return; }

  // ---- loader: first visit in this tab only, shows real progress, never longer than 2.4 s
  // The loader only runs on a first desktop visit. On touch screens the static name and text show at
  // once (fast LCP) and the print fades in when the GL module is ready.
  let first = matchMedia('(pointer: fine)').matches;
  try { first = first && !sessionStorage.getItem('printed'); } catch (e) {}
  const loader = document.getElementById('loader');
  const count = loader?.querySelector('[data-loader-count]');
  const bar = loader?.querySelector('[data-loader-bar]');
  const lstat = loader?.querySelector('[data-loader-status]');
  const prog = { v: 0 };
  const to = (v, label) => {
    if (!first || !loader) return;
    if (label && lstat) lstat.textContent = label;
    gsap.to(prog, { v, duration: 0.35, ease: 'none', onUpdate: () => { count.textContent = pad3(Math.round(prog.v)); gsap.set(bar, { scaleX: prog.v / 100 }); } });
  };
  if (first) { html.classList.add('loading'); to(18, 'Heating the nozzle'); }
  const t0 = performance.now();

  let print;
  try {
    const { createPrint } = await import('../hero/print.js');
    to(64, 'Homing the axes');
    print = createPrint(host, { layers: L, onLayer: (l, done) => readout(l, L, done) });
    print.setProgress(0);
    print.render();
    to(100, 'Printing');
  } catch (err) {
    console.warn('print hero unavailable', err);
    html.classList.remove('loading'); readout(L, L, true); return;
  }
  gsap.fromTo(host, { opacity: 0 }, { opacity: 1, duration: first ? 0.01 : 0.6, ease: 'expo.out' });
  html.classList.add('gl-on');
  ScrollTrigger.refresh();

  const state = { intro: 0, scroll: 0, visible: true };
  const exit = () => {
    if (!first || !loader) return Promise.resolve();
    const wait = Math.max(0, 900 - (performance.now() - t0)) / 1000;
    return new Promise((res) => gsap.to(loader, { opacity: 0, duration: 0.45, ease: 'expo.out', delay: wait, onComplete: () => { html.classList.remove('loading'); gsap.set(loader, { clearProps: 'opacity' }); res(); } }));
  };
  await exit();
  try { sessionStorage.setItem('printed', '1'); } catch (e) {}

  // ---- pause control (WCAG 2.2.2): stops the nozzle, the glow and the idle drift. Scrolling still prints.
  const pauseBtn = document.querySelector('[data-pause]');
  const pauseLabel = pauseBtn?.querySelector('[data-pause-label]');
  let paused = false;
  try { paused = localStorage.getItem('print-paused') === '1'; } catch (e) {}
  const setPaused = (v) => {
    paused = v;
    pauseBtn?.setAttribute('aria-pressed', String(v));
    if (pauseLabel) pauseLabel.textContent = v ? 'Resume the print' : 'Pause the print';
    html.classList.toggle('print-paused', v);
    try { localStorage.setItem('print-paused', v ? '1' : '0'); } catch (e) {}
  };
  setPaused(paused);
  pauseBtn?.addEventListener('click', () => setPaused(!paused));

  // ---- intro prints the first 55%, scroll finishes it
  if (paused) state.intro = 0.55;
  else gsap.to(state, { intro: 0.55, duration: first ? 2.0 : 1.2, ease: 'power1.inOut' });
  ScrollTrigger.create({
    trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (s) => { state.scroll = s.progress; },
  });
  new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; }).observe(hero);

  addEventListener('pointermove', (e) => {
    print.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  }, { passive: true });

  let doneAt = 0, clock = 0, lastF = -1, lastScroll = -1, lastSize = '';
  gsap.ticker.add((time, deltaMs) => {
    if (!state.visible || document.hidden) return;
    const f = Math.min(1, state.intro + (1 - state.intro) * state.scroll);
    const size = innerWidth + 'x' + innerHeight;
    // paused and nothing changed: skip the frame entirely
    if (paused && f === lastF && state.scroll === lastScroll && size === lastSize) return;
    lastF = f; lastScroll = state.scroll; lastSize = size;
    const dt = paused ? 0 : Math.min(deltaMs, 50) / 1000;
    clock += dt;
    print.setProgress(f);
    print.setScroll(state.scroll);
    // the finished print cools down over a second
    const u = print.uniforms.uDone;
    if (f >= 1) { doneAt ||= clock; u.value = paused ? 1 : Math.min(1, (clock - doneAt) / 1.2); } else { doneAt = 0; u.value = 0; }
    print.tick(clock, dt);
  });
}
