// Print-queue filter on the Products page: buttons with aria-pressed, the count is announced politely.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initFilters() {
  const bar = document.querySelector('[data-filters]');
  const items = [...document.querySelectorAll('[data-queue] > li')];
  const status = document.querySelector('[data-filter-status]');
  if (!bar) return;
  const motion = document.documentElement.classList.contains('motion');
  const plural = new Intl.PluralRules('en-SG');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    const g = btn.dataset.filter;
    bar.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const shown = [];
    items.forEach((li) => {
      const on = g === 'all' || li.dataset.group === g;
      li.hidden = !on;
      if (on) shown.push(li);
    });
    const noun = { one: 'product', other: 'products' }[plural.select(shown.length)] || 'products';
    status.textContent = `Showing ${shown.length} ${noun}${g === 'all' ? '' : ' in ' + btn.firstChild.textContent.trim()}.`;
    if (motion) gsap.fromTo(shown, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'steps(6)', stagger: 0.03 });
    ScrollTrigger.refresh();
  });
}
