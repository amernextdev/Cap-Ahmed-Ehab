/**
 * header.js
 * Manages: scroll state · mobile nav · active nav links · language toggle
 */

import I18n from '/src/services/js/i18n.js';

// ─── Element refs ──────────────────────────────────────────────────────────

const header         = document.getElementById('site-header');
const mobileNav      = document.getElementById('mobile-nav');
const backdrop       = document.getElementById('mobileNavBackdrop');
const burgerBtn      = document.querySelector('.site-header__mobile-toggle-btn');
const closeBtn       = document.querySelector('.mobile-nav__close-btn');
const desktopLangBtn = document.querySelector('.site-header__lang-toggle');
const mobileLangBtn  = document.getElementById('mobile-lang-toggle');
const langBadgeAr    = document.getElementById('mobile-lang-badge-ar');
const langBadgeEn    = document.getElementById('mobile-lang-badge-en');

// All nav links — desktop and mobile together
const allNavLinks = document.querySelectorAll(
  '.site-header__nav-link, .mobile-nav__nav-link'
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCROLL — IntersectionObserver on a sentinel div
//    Zero scroll listeners, zero layout thrashing.
// ─────────────────────────────────────────────────────────────────────────────

function initScrollState() {
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
  document.body.style.position = 'relative';
  document.body.prepend(sentinel);

  new IntersectionObserver(
    ([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting),
    { threshold: 0 }
  ).observe(sentinel);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MOBILE NAV
// ─────────────────────────────────────────────────────────────────────────────

let navOpen = false;

function openNav() {
  navOpen = true;
  mobileNav.classList.add('open');
  backdrop.classList.add('visible');
  burgerBtn.classList.add('active');
  backdrop.setAttribute('aria-hidden', 'false');
  mobileNav.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  mobileNav.querySelector('.mobile-nav__close-btn')?.focus();
    mobileNav.inert = false;
}
function closeNav() {
  navOpen = false;
  
  // Clear any focus inside mobile nav before hiding
  if (mobileNav && document.activeElement && mobileNav.contains(document.activeElement)) {
    document.activeElement.blur();
  }
  
  mobileNav.classList.remove('open');
  backdrop.classList.remove('visible');
  burgerBtn.classList.remove('active');
  backdrop.setAttribute('aria-hidden', 'true');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  mobileNav.inert = true;
  
  // Move focus back to the burger button
  burgerBtn?.focus();
}
function initMobileNav() {
  burgerBtn?.addEventListener('click', () => navOpen ? closeNav() : openNav());
  closeBtn?.addEventListener('click', closeNav);
  backdrop?.addEventListener('click', closeNav);


  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navOpen) closeNav();
  });

  // Duration matches --duration-slide (0.45s) in variables.css
  const NAV_SLIDE_MS = 450;

  mobileNav?.querySelectorAll('.mobile-nav__nav-link, .mobile-nav__cta-link')
    .forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        const isAnchor = href?.startsWith('#') && href.length > 1;
        if (isAnchor) {
          e.preventDefault();
          closeNav();
          setTimeout(() => {
            document.getElementById(href.slice(1))
              ?.scrollIntoView({ behavior: 'smooth' });
          }, NAV_SLIDE_MS);
        } else {
          closeNav();
        }
      });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ACTIVE NAV LINKS
//    Click → set active immediately + lock Observer so it doesn't override
//    the class while smooth scroll is still in progress.
// ─────────────────────────────────────────────────────────────────────────────

const ACTIVE_LINK  = 'site-header__nav-link--active';
const ACTIVE_MLINK = 'mobile-nav__nav-link--active';

let scrollLocked    = false;
let scrollLockTimer = null;
// Lock = mobile slide (450ms) + smooth scroll budget (800ms)
const SCROLL_LOCK_MS = 1300;

function setActiveLink(sectionId) {
  if (!sectionId) return;
  
  allNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    
    const target = href.slice(1);
    const isMatch = target === sectionId;
    const activeClass = link.classList.contains('mobile-nav__nav-link')
      ? ACTIVE_MLINK : ACTIVE_LINK;
    link.classList.toggle(activeClass, isMatch);
    link.setAttribute('aria-current', isMatch ? 'page' : 'false');
  });
}

function lockScrollAndActivate(sectionId) {
  setActiveLink(sectionId);
  if (scrollLockTimer) clearTimeout(scrollLockTimer);
  scrollLocked = true;
  scrollLockTimer = setTimeout(() => { 
    scrollLocked = false;
    scrollLockTimer = null;
  }, SCROLL_LOCK_MS);
}

function initActiveLinks() {
  // Collect sections that have a matching nav link
  const seen = new Set();
  const linkedSections = [];

  allNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#') || href.length === 1) return;
    
    const id = href.slice(1);
    if (!id || seen.has(id)) return;
    
    const section = document.getElementById(id);
    if (section) { seen.add(id); linkedSections.push(section); }
  });

  if (!linkedSections.length) return;

  // Click handler on ALL nav links (desktop + mobile)
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (!href?.startsWith('#') || href.length === 1) return;
      const targetId = href.slice(1);
      if (document.getElementById(targetId)) lockScrollAndActivate(targetId);
    });
  });

  // Observer — paused while a click scroll is in progress
  const visibilityMap = new Map(linkedSections.map(s => [s.id, 0]));

  const observer = new IntersectionObserver(
    entries => {
      if (scrollLocked) return;

      entries.forEach(e => visibilityMap.set(e.target.id, e.intersectionRatio));

      let topId = null, topRatio = 0;
      visibilityMap.forEach((ratio, id) => {
        if (ratio > topRatio) { topRatio = ratio; topId = id; }
      });

      if (topId && topRatio > 0) setActiveLink(topId);
    },
    {
      rootMargin: '-10% 0px -60% 0px',
      threshold: Array.from({ length: 21 }, (_, i) => i * 0.05),
    }
  );

  linkedSections.forEach(s => observer.observe(s));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LANGUAGE TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

function syncLangBadges(lang) {
  langBadgeAr?.classList.toggle('active-lang', lang === 'ar');
  langBadgeEn?.classList.toggle('active-lang', lang === 'en');
}

async function switchLang() {
  const next = I18n.getCurrentLang() === 'ar' ? 'en' : 'ar';
  await I18n.setLang(next);
  syncLangBadges(next);
}

function initLangToggle() {
  syncLangBadges(document.documentElement.lang || 'ar');
  desktopLangBtn?.addEventListener('click', switchLang);
  mobileLangBtn?.addEventListener('click', switchLang);
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

export function initHeader() {
  initScrollState();
  initMobileNav();
  initActiveLinks();
  initLangToggle();
}