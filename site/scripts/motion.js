// Only the reel and fracture have scroll runways. The shop details stay in normal flow.
const sections = [...document.querySelectorAll('[data-chapter]')];
const crack = document.querySelector('.crack');
const pageBar = document.querySelector('[data-page-progress]');
const crackLabel = document.querySelector('[data-crack-percent]');
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
let queued = false;
const clamp = value => Math.min(1, Math.max(0, value));

function update() {
  queued = false;
  const maxScroll = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
  if (pageBar) pageBar.style.transform = `scaleX(${clamp(scrollY / maxScroll)})`;
  const rect = crack?.getBoundingClientRect();
  const progress = reducedQuery.matches ? 0 : clamp(-rect.top / Math.max(crack.offsetHeight - innerHeight, 1));
  if (crackLabel) crackLabel.textContent = String(Math.round(Math.sin(progress * Math.PI) * 100)).padStart(2, '0');
  window.dispatchEvent(new CustomEvent('icehub:crack', { detail: { progress } }));
  const current = sections.find(section => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= innerHeight * .42 && bounds.bottom >= innerHeight * .42;
  });
  document.body.dataset.chapter = current?.dataset.chapter || 'top';
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav === current?.dataset.chapter) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function queueUpdate() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}

// Anchor URLs remain a no-JS fallback. Enhance them with selection and explicit focus.
document.querySelectorAll('[data-order]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const select = document.querySelector('select[name="order"]');
    select.value = link.dataset.order;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    const email = document.querySelector('input[name="email"]');
    history.pushState(null, '', '#collection');
    window.scrollTo({ top: scrollY + email.getBoundingClientRect().top - 160, behavior: 'instant' });
    email.focus({ preventScroll: true });
  });
});
window.addEventListener('scroll', queueUpdate, { passive: true });
window.addEventListener('resize', queueUpdate, { passive: true });
reducedQuery.addEventListener('change', queueUpdate);
update();
