const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sections = [...document.querySelectorAll("[data-chapter]")];
const origin = document.querySelector(".origin");
const crack = document.querySelector(".crack");
const material = document.querySelector(".material");
const range = document.querySelector(".range");
const track = document.querySelector("[data-product-track]");
const pageBar = document.querySelector("[data-page-progress]");
const crackLabel = document.querySelector("[data-crack-percent]");
const cardIndex = document.querySelector("[data-card-index]");
const cards = [...document.querySelectorAll("[data-product-card]")];
let ticking = false;
let trackTravel = 0;

function sectionProgress(section) {
  if (!section) return 0;
  const rect = section.getBoundingClientRect();
  const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
  return clamp(-rect.top / distance);
}

function measure() {
  trackTravel = track ? Math.max(0, track.scrollWidth - track.parentElement.clientWidth) : 0;
}

function updateActiveNav() {
  const probe = window.innerHeight * 0.42;
  let current = sections[0]?.dataset.chapter;
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= probe && rect.bottom >= probe) {
      current = section.dataset.chapter;
      break;
    }
  }
  document.body.dataset.chapter = current || "top";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const active = link.dataset.nav === current;
    link.toggleAttribute("aria-current", active);
  });
}

function update() {
  ticking = false;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  pageBar.style.transform = `scaleX(${clamp(window.scrollY / maxScroll)})`;

  const originP = sectionProgress(origin);
  const crackP = sectionProgress(crack);
  const materialP = sectionProgress(material);
  const rangeP = sectionProgress(range);
  origin?.style.setProperty("--section-p", originP.toFixed(4));
  crack?.style.setProperty("--section-p", crackP.toFixed(4));
  material?.style.setProperty("--section-p", materialP.toFixed(4));
  range?.style.setProperty("--section-p", rangeP.toFixed(4));

  if (crackLabel) crackLabel.textContent = String(Math.round(Math.sin(crackP * Math.PI) * 100)).padStart(2, "0");
  if (track && !reduced) track.style.transform = `translate3d(${-trackTravel * rangeP}px,0,0)`;

  if (cardIndex) {
    const index = Math.min(cards.length, Math.max(1, Math.round(1 + rangeP * (cards.length - 1))));
    cardIndex.textContent = String(index).padStart(2, "0");
  }
  updateActiveNav();
  window.dispatchEvent(new CustomEvent("icehub:crack", { detail: { progress: crackP } }));
}

function queueUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-revealed");
  });
}, { rootMargin: "0px 0px -12%", threshold: 0.12 });

document.querySelectorAll(".process li, .material__notes > div, .contact-row, .order-block").forEach((el) => revealObserver.observe(el));

if (!reduced && matchMedia("(pointer: fine)").matches) {
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -5;
      const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
      card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

window.addEventListener("scroll", queueUpdate, { passive: true });
window.addEventListener("resize", () => { measure(); queueUpdate(); }, { passive: true });
measure();
update();
