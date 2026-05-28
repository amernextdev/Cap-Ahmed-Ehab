/**
 * results.js
 * Manages: transforms carousel (mobile) · dots · touch swipe · feedback inject
 * Desktop (≥900px): grid layout — arrows/dots hidden via CSS, no JS needed.
 *
 * AmerDev · Ahmed Ehab Online Coaching
 */

const DESKTOP_BREAKPOINT = 900;

// ─── Feedback Data ────────────────────────────────────────────────────────────

const FEEDBACKS = [
  { folder: 'mustafa',   id: 1  },
  { folder: 'shahd',     id: 2  },
  { folder: 'maryam',   id: 3  },
  { folder: 'joumana',  id: 4  },
  { folder: 'joumana-2', id: 5  },
  { folder: 'nada',      id: 6  },
  { folder: 'aisha',     id: 7  },
  { folder: 'verbena',   id: 8  },
  { folder: 'aya',       id: 9  },
  { folder: 'fatma',     id: 10 },
  { folder: 'dina',      id: 11 },
];

// ─── Feedback Inject ──────────────────────────────────────────────────────────

// أسماء احتياطية — الـ i18n هيعملها override لما يشتغل
const FEEDBACK_NAMES = {
  ar: ['مصطفى','شهد','مريم','جومانا','جومانا','نادا','عائشة','فيربينا','آية','فاطمة','دينا'],
  en: ['Mostafa','Shahd','Maryam','Joumana','Joumana','Nada','Aisha','Verbena','Aya','Fatma','Dina'],
};

function buildFeedbackCard({ folder, id }, idx) {
  const base = `/feedbacks/${folder}/feedback`;
  const lang  = document.documentElement.lang?.startsWith('ar') ? 'ar' : 'en';
  const name  = FEEDBACK_NAMES[lang][idx] ?? '';

  // جومانا-2 (idx=4) تبدأ صف جديد على الديسكتوب
  const breakBefore = idx === 4
    ? '<div class="feedback__row-break" aria-hidden="true"></div>'
    : '';

  return `${breakBefore}
    <div class="feedback__card">
      <div class="feedback__screenshot">
        <picture>
          <source srcset="${base}.avif" type="image/avif">
          <source srcset="${base}.webp" type="image/webp">
          <img src="${base}.jpg" alt="" loading="lazy" data-i18n-alt="results.feedback${id}.alt">
        </picture>
      </div>
      <div class="feedback__name" data-i18n-text="results.feedback${id}.name">${name}</div>
    </div>`;
}

function injectFeedbacks() {
  const row = document.querySelector('.feedback-row');
  if (!row) { console.error('[results] .feedback-row not found'); return; }
  row.innerHTML = FEEDBACKS.map((fb, i) => buildFeedbackCard(fb, i)).join('');
  document.dispatchEvent(new CustomEvent('i18n:refresh', { detail: { root: row } }));
}

// ─── Feedback Dots (mobile only) ─────────────────────────────────────────────

function initFeedbackDots() {
  if (window.innerWidth >= DESKTOP_BREAKPOINT) return;

  // اتأكد مفيش dots موجودة بالفعل
  const existing = document.querySelector('.feedback__dots');
  if (existing) existing.remove();

  const row = document.querySelector('.feedback-row');
  if (!row) return;

  const cards = Array.from(row.querySelectorAll('.feedback__card'));
  const total = cards.length;

  // بنحقن الـ dots wrapper بعد الـ feedback-row
  const dotsEl = document.createElement('div');
  dotsEl.className = 'feedback__dots';
  dotsEl.innerHTML = cards.map((_, i) =>
    `<span class="feedback__dot${i === 0 ? ' feedback__dot--active' : ''}"></span>`
  ).join('');
  row.insertAdjacentElement('afterend', dotsEl);

  const dots = Array.from(dotsEl.querySelectorAll('.feedback__dot'));

  // RTL: scrollLeft بيبقى سالب
  function normalizedScroll() {
    return Math.abs(row.scrollLeft);
  }

  function getActiveDotIndex() {
    const cardW = cards[0]?.getBoundingClientRect().width || 1;
    const gap   = parseFloat(window.getComputedStyle(row).gap) || 0;
    const step  = cardW + gap;
    // بنحسب الكارت اللي اتعدى منتصفه — مش اللي وقف عنده
    const idx   = Math.round(normalizedScroll() / step);
    return Math.max(0, Math.min(idx, total - 1));
  }

  row.addEventListener('scroll', () => {
    const active = getActiveDotIndex();
    dots.forEach((d, i) => d.classList.toggle('feedback__dot--active', i === active));
  }, { passive: true });

  // click على dot → scroll للكارت
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const cardW = cards[0]?.getBoundingClientRect().width || 1;
      const gap   = parseFloat(window.getComputedStyle(row).gap) || 0;
      const isRTL = document.documentElement.dir === 'rtl';
      const pos   = i * (cardW + gap);
      row.scrollTo({ left: isRTL ? -pos : pos, behavior: 'smooth' });
    });
  });
}

// ─── Feedback Show-More (desktop only) ───────────────────────────────────────

const FEEDBACK_VISIBLE_DEFAULT = 4;

function initFeedbackDesktop() {
  if (window.innerWidth < DESKTOP_BREAKPOINT) return;

  const row     = document.querySelector('.feedback-row');
  const btnShow = document.querySelector('.feedback__more-btn--show');
  const btnHide = document.querySelector('.feedback__more-btn--hide');

  if (!row) return;

  const cards = Array.from(row.querySelectorAll('.feedback__card'));
  if (cards.length <= FEEDBACK_VISIBLE_DEFAULT) {
    // نخبي الزرين لو الكروت أقل من أو تساوي الحد
    if (btnShow) btnShow.hidden = true;
    if (btnHide) btnHide.hidden = true;
    return;
  }

  // الحالة الابتدائية: نخبي الكروت الزيادة، نُظهر "عرض المزيد"، نخبي "عرض أقل"
  cards.forEach((c, i) => {
    if (i >= FEEDBACK_VISIBLE_DEFAULT) c.classList.add('feedback__card--hidden');
  });
  if (btnShow) btnShow.hidden = false;
  if (btnHide) btnHide.hidden = true;

  let scrollYBeforeExpand = 0;

  btnShow?.addEventListener('click', () => {
    scrollYBeforeExpand = window.scrollY;

    cards.forEach((c, i) => {
      if (i < FEEDBACK_VISIBLE_DEFAULT) return;
      c.classList.remove('feedback__card--hidden');
      c.style.animationDelay = `${(i - FEEDBACK_VISIBLE_DEFAULT) * 60}ms`;
      c.classList.add('feedback__card--visible');
    });

    btnShow.hidden = true;
    if (btnHide) btnHide.hidden = false;
  });

  btnHide?.addEventListener('click', () => {
    cards.forEach((c, i) => {
      if (i < FEEDBACK_VISIBLE_DEFAULT) return;
      c.classList.add('feedback__card--hidden');
      c.classList.remove('feedback__card--visible');
      c.style.animationDelay = '';
    });

    btnHide.hidden = true;
    if (btnShow) btnShow.hidden = false;

    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollYBeforeExpand, behavior: 'smooth' });
    });
  });
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function initLightbox() {
  const lightbox = document.createElement('div');
  lightbox.className = 'fb-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.innerHTML = `
    <div class="fb-lightbox__inner">
      <button class="fb-lightbox__close" aria-label="إغلاق">✕</button>
      <img class="fb-lightbox__img" src="" alt="">
    </div>`;
  document.body.appendChild(lightbox);

  const imgEl    = lightbox.querySelector('.fb-lightbox__img');
  const closeBtn = lightbox.querySelector('.fb-lightbox__close');

  function openLightbox(src, alt) {
    imgEl.src = src;
    imgEl.alt = alt || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // تفويض الأحداث على feedback-row — يشتغل على كل الكروت الحالية والمستقبلية
  document.querySelector('.feedback-row')?.addEventListener('click', e => {
    const wrap = e.target.closest('.feedback__screenshot');
    if (!wrap) return;
    const img = wrap.querySelector('img');
    if (!img) return;
    openLightbox(img.currentSrc || img.src, img.alt);
  });

  closeBtn.addEventListener('click', closeLightbox);

  // إغلاق بالضغط على الخلفية
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // إغلاق بـ Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
}

export function initResults() {
  injectFeedbacks();
  initLightbox();
  initFeedbackDots();
  initFeedbackDesktop();
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
      const dotsEl = document.querySelector('.feedback__dots');
      if (dotsEl) dotsEl.remove();
      initFeedbackDesktop();
    } else {
      goTo(current);
      initFeedbackDots();
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