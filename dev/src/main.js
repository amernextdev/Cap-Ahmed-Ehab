import '/src/style.css';
import I18n from '/src/services/js/i18n.js';
import { initHeader } from '/src/components/header/header.js';
import { initResults } from '/src/components/results/results.js';
import '/src/components/faq/faq.js';

/**
 * Initialise the app.
 * All top-level awaits are wrapped so a single failure can't silently
 * break the rest of the boot sequence.
 */
async function bootstrap() {
  // ── 1. Translations (everything else depends on this) ───────────────────
  try {
    await I18n.init();
  } catch (err) {
    console.error('[i18n] Failed to initialise translations:', err);
    // Continue with whatever strings are already baked into the HTML.
  }

  // ── 2. Components ────────────────────────────────────────────────────────
  try {
    initHeader();
  } catch (err) {
    console.error('[header] Initialisation failed:', err);
  }

  try {
    initResults();
  } catch (err) {
    console.error('[results] Initialisation failed:', err);
  }

  // ── 3. Scroll-reveal ─────────────────────────────────────────────────────
  initScrollReveal();
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  // Respect the user's motion preference.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.08 }
  );

  revealEls.forEach(el => observer.observe(el));
}

bootstrap();