import './styles/main.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
window.__booted = true;

const html = document.documentElement;
const motion = html.classList.contains('motion');
const BASE = import.meta.env.BASE_URL; // '/claudy2.0/'
const page = document.body.dataset.page;

// ---------------------------------------------------------------- smooth scroll (desktop, motion only)
let lenis = null;
if (motion && matchMedia('(pointer: fine)').matches) {
  lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ---------------------------------------------------------------- frame: scrim + steps aside on scroll down
let lastY = 0;
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: (self) => {
    const y = self.scroll();
    html.classList.toggle('scrolled', y > 40);
    if (motion && Math.abs(y - lastY) > 4) {
      html.classList.toggle('frame-away', y > 160 && y > lastY && !document.activeElement?.closest('.frame'));
      lastY = y;
    }
  },
});
document.querySelector('.frame')?.addEventListener('focusin', () => html.classList.remove('frame-away'));

// ---------------------------------------------------------------- reveals
function reveals() {
  if (!motion) return;
  // text lines rise out of a mask, like layers stacking
  document.querySelectorAll('[data-split="lines"]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 105, duration: 1.0, ease: 'expo.out', stagger: 0.06,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      },
    });
  });
  // blocks print in from the bottom, in visible layers
  document.querySelectorAll('[data-reveal="layers"]').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'steps(12)',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });
}

function intro() {
  if (!motion) return;
  const items = document.querySelectorAll('[data-intro]');
  if (items.length) gsap.to(items, { opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.1 });
}

// ---------------------------------------------------------------- page transition: layers print up the screen
const curtain = document.getElementById('curtain');
const LAYERS = 9;
if (curtain && !curtain.children.length) {
  curtain.innerHTML = Array.from({ length: LAYERS }, () => '<div class="layer"></div>').join('');
}
const layers = curtain ? [...curtain.children] : [];

function arrive() {
  if (!html.classList.contains('arriving')) return;
  try { sessionStorage.removeItem('nav-curtain'); } catch (e) {}
  if (!motion) { html.classList.remove('arriving'); return; }
  gsap.set(curtain, { visibility: 'visible' });
  gsap.set(layers, { scaleY: 1, transformOrigin: '50% 0%' });
  gsap.to(layers, {
    scaleY: 0, duration: 0.55, ease: 'expo.inOut', stagger: { each: 0.035, from: 'end' }, delay: 0.05,
    onComplete: () => { html.classList.remove('arriving'); gsap.set(curtain, { visibility: 'hidden' }); },
  });
}

function leave(url) {
  try { sessionStorage.setItem('nav-curtain', '1'); } catch (e) {}
  gsap.set(curtain, { visibility: 'visible' });
  gsap.set(layers, { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.to(layers, {
    scaleY: 1, duration: 0.5, ease: 'steps(6)', stagger: { each: 0.03, from: 'start' },
    onComplete: () => { location.href = url; },
  });
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  if (a.hasAttribute('data-placeholder-link')) {
    e.preventDefault();
    flag(a, 'Link coming soon');
    return;
  }
  if (!motion || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.target && a.target !== '_self') return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith(BASE)) return;
  if (url.pathname === location.pathname && url.hash) return; // in-page anchor
  if (url.pathname === location.pathname && !url.hash) { e.preventDefault(); lenis ? lenis.scrollTo(0) : scrollTo(0, 0); return; }
  e.preventDefault();
  leave(url.href);
});
window.addEventListener('pageshow', (e) => { if (e.persisted) { gsap.set(layers, { scaleY: 0 }); gsap.set(curtain, { visibility: 'hidden' }); } });

// "#" links are placeholders until Joshua adds the public URLs
const status = document.createElement('p');
status.className = 'sr-only'; status.setAttribute('aria-live', 'polite');
document.body.append(status);
function flag(el, msg) {
  status.textContent = msg;
  const tip = document.createElement('span');
  tip.className = 'tip readout'; tip.textContent = msg;
  el.append(tip);
  gsap.fromTo(tip, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: 'expo.out' });
  gsap.to(tip, { opacity: 0, delay: 1.8, duration: 0.3, onComplete: () => tip.remove() });
}

// in-page anchor links scroll smoothly with Lenis
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const t = id ? document.getElementById(id) : null;
    if (!t) return;
    if (lenis) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
    if (id === 'main') t.focus({ preventScroll: true });
  });
});

// ---------------------------------------------------------------- page modules
async function boot() {
  arrive();
  if (page === 'home') {
    const { initHome } = await import('./pages/home.js');
    await initHome({ motion, lenis });
  } else {
    intro();
  }
  if (page === 'projects') {
    const { initFilters } = await import('./pages/projects.js');
    initFilters();
  }
  reveals();
  if (page === 'home') intro();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
boot().catch(() => html.classList.add('revealed-fallback'));
