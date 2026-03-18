/* ─────────────────────────────────────────────
   Shadow Portfolio v2 — main.js
───────────────────────────────────────────── */

// ══════════ SCROLL REVEAL ══════════
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ══════════ SKILL BAR ANIMATION ══════════
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.skill-bar-fill').forEach((fill, i) => {
        setTimeout(() => { fill.style.width = `${fill.dataset.width}%`; }, i * 150);
      });
      skillObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.3 }
);
document.querySelectorAll('.skill-category').forEach((el) => skillObserver.observe(el));

// ══════════ ACTIVE NAV ══════════
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  },
  { threshold: 0.5 }
);
sections.forEach((s) => navObserver.observe(s));

// ══════════ SMOOTH SCROLL (fixed header offset) ══════════
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

// ══════════ RANDOM NIGHTMARE FLICKER ══════════
// Occasionally adds a brief corruption flicker to the body
const flicker = () => {
  document.body.style.filter = 'brightness(0.92) hue-rotate(5deg)';
  setTimeout(() => { document.body.style.filter = ''; }, 60);
  setTimeout(() => {
    document.body.style.filter = 'brightness(1.04)';
    setTimeout(() => { document.body.style.filter = ''; }, 40);
  }, 80);
};

const scheduleFlicker = () => {
  const delay = 8000 + Math.random() * 15000;
  setTimeout(() => { flicker(); scheduleFlicker(); }, delay);
};

scheduleFlicker();