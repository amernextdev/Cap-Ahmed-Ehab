/**
 * results.js
 * Manages: transforms carousel (mobile) · dots · touch swipe
 * Desktop (≥900px): grid layout — arrows/dots hidden via CSS, no JS needed.
 *
 * AmerDev · Ahmed Ehab Online Coaching
 */

const DESKTOP_BREAKPOINT = 900;

export function initResults() {
  const track    = document.getElementById('transformsTrack');
  const cards    = track ? Array.from(track.querySelectorAll('.tr-card')) : [];
  const dots     = Array.from(document.querySelectorAll('.transforms__dot'));
  const btnPrev  = document.querySelector('.transforms__arrow--prev');
  const btnNext  = document.querySelector('.transforms__arrow--next');

  if (!track || !cards.length) return;

  let current = 0;
  const total = cards.length;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function isDesktop() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  /** حساب عرض الكارت + الـ gap */
  function getCardWidth() {
    const style = window.getComputedStyle(track);
    const gap   = parseFloat(style.gap) || 12;
    return cards[0].getBoundingClientRect().width + gap;
  }

  // ─── Core: goTo ───────────────────────────────────────────────────────────

  function goTo(index) {
    current = ((index % total) + total) % total;

    const outer  = track.closest('.transforms__track-outer');
    const outerW = outer.getBoundingClientRect().width;
    const style  = window.getComputedStyle(track);
    const gap    = parseFloat(style.gap) || 12;
    const cardW  = cards[0].getBoundingClientRect().width;
    const step   = cardW + gap;

    // توسيط الكارت الحالي في منتصف الـ outer
    const offset = current * step - (outerW / 2 - cardW / 2);

    // RTL: الـ track بيتمشى بـ positive translateX
    const isRTL = document.documentElement.dir === 'rtl';
    track.style.transform = `translateX(${isRTL ? offset : -offset}px)`;

    cards.forEach((c, i) => c.classList.toggle('active-card', i === current));
    dots.forEach((d, i)  => d.classList.toggle('transforms__dot--active', i === current));
  }

  // ─── Desktop reset ────────────────────────────────────────────────────────

  function resetForDesktop() {
    track.style.transform = '';
    cards.forEach(c => c.classList.add('active-card'));
    dots.forEach(d => d.classList.remove('transforms__dot--active'));
  }

  // ─── Responsive handler ───────────────────────────────────────────────────

  function handleResize() {
    if (isDesktop()) {
      resetForDesktop();
    } else {
      goTo(current);
    }
  }

  // ─── Touch / Swipe ────────────────────────────────────────────────────────

  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging  = false;

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging  = false;
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > dy && dx > 5) isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      // RTL: سحب لليسار (diff موجب) = السابق، لليمين = التالي
      const isRTL = document.documentElement.dir === 'rtl';
      goTo(diff > 0 ? (isRTL ? current - 1 : current + 1) : (isRTL ? current + 1 : current - 1));
    }
  }, { passive: true });

  // ─── Buttons ──────────────────────────────────────────────────────────────

  btnPrev?.addEventListener('click', () => goTo(current - 1));
  btnNext?.addEventListener('click', () => goTo(current + 1));

  // ─── Dots ─────────────────────────────────────────────────────────────────

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // ─── Resize ───────────────────────────────────────────────────────────────

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 120);
  });

  // ─── Init ─────────────────────────────────────────────────────────────────

  if (isDesktop()) {
    resetForDesktop();
  } else {
    // ننتظر الـ layout يتحسب الأول
    requestAnimationFrame(() => requestAnimationFrame(() => goTo(0)));
  }
}