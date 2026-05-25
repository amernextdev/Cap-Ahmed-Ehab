const header    = document.getElementById('site-header');
const mobileNav = document.getElementById('mobile-nav');
const backdrop  = document.getElementById('mobileNavBackdrop');
const toggleBtn = document.querySelector('.site-header__mobile-toggle');
const closeBtn  = document.querySelector('.mobile-nav__close');

/* ─── Sticky scroll ────────────────────── */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 40);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

/* ─── Mobile Nav open/close ────────────── */
function openMobileNav() {
  mobileNav.classList.add('open');
  backdrop.classList.add('visible');
  toggleBtn.classList.add('active');
  toggleBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  mobileNav.classList.remove('open');
  backdrop.classList.remove('visible');
  toggleBtn.classList.remove('active');
  toggleBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

toggleBtn.addEventListener('click', () => {
  mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
});

closeBtn.addEventListener('click', closeMobileNav);
backdrop.addEventListener('click', closeMobileNav);

/* Close on nav link click */
mobileNav.querySelectorAll('.mobile-nav__nav-link').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

/* Keyboard: close on Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMobileNav();
});

/* ─── Lang Toggle ──────────── */
let currentLang = 'ar';

function toggleLang() {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  const html = document.documentElement;
  const isEn = currentLang === 'en';

  html.setAttribute('lang', currentLang);
  html.setAttribute('dir', isEn ? 'ltr' : 'rtl');

  document.querySelector('.site-header__lang-label').textContent = isEn ? 'AR' : 'EN';
  document.getElementById('mobile-lang-sub').textContent = isEn ? 'English' : 'Arabic / العربية';

  document.getElementById('mobile-lang-badge-ar').classList.toggle('active-lang', !isEn);
  document.getElementById('mobile-lang-badge-en').classList.toggle('active-lang',  isEn);
}

document.querySelector('.site-header__lang-toggle').addEventListener('click', toggleLang);
document.getElementById('mobile-lang-toggle').addEventListener('click', toggleLang);