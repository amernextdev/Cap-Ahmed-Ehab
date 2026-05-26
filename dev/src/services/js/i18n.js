/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  i18n.js — Internationalization Engine  (pure, UI-agnostic)
 *  Ahmed Ehab Online Coaching · AmerDev
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  مسؤوليات هذا الملف فقط:
 *    ✦ تحميل ملفات اللغة وتخزينها مؤقتاً
 *    ✦ تطبيق الترجمة على العناصر القابلة للترجمة
 *    ✦ تحديث <html lang dir>
 *    ✦ حفظ / قراءة التفضيل من localStorage
 *
 *  ما ليس من مسؤوليته:
 *    ✗ ربط أي event listeners
 *    ✗ تغيير أي UI (badges, labels, icons …)
 *    ← هذه مسؤولية كل component على حدة
 *
 *  ─── الـ API العام ───────────────────────────────────────────────────────────
 *
 *  init()                   → يحدد اللغة المفضلة ويطبقها (استدعاء واحد عند البوت)
 *  setLang(lang)            → يبدل اللغة ويحفظها  |  returns Promise<void>
 *  getCurrentLang()         → يرجع اللغة الحالية من <html lang>
 *  getSupportedLangs()      → يرجع مصفوفة ['ar', 'en']
 *
 *  ─── العناصر القابلة للترجمة ─────────────────────────────────────────────────
 *
 *    [data-i18n-text]  → element.textContent
 *    [data-i18n-html]  → element.innerHTML
 *    [data-i18n-aria]  → aria-label attribute
 *    [data-i18n-alt]   → img alt attribute
 *    page_title        → document.title
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

const I18n = (() => {

  // ── Config ─────────────────────────────────────────────────────────────────

  const STORAGE_KEY  = 'preferred_lang';
  const DEFAULT_LANG = 'ar';
  const SUPPORTED    = ['ar', 'en'];

  /** In-memory cache — each locale loaded once per session */
  const cache = {};

  // ── Locale Loader ──────────────────────────────────────────────────────────

  /**
   * Fetches and caches /locales/{lang}.json
   * @param {string} lang
   * @returns {Promise<object|null>}
   */
  async function loadLocale(lang) {
    if (cache[lang]) return cache[lang];

    try {
      // 1. تعريف المتغير داخل الدالة مباشرة لضمان رؤيته 100%
      const locales = import.meta.glob('/src/locales/*.json');
      
      const filePath = `/src/locales/${lang}.json`;

      // 2. التحقق من وجود ملف اللغة في المجلد
      if (!locales[filePath]) {
        console.error(`[i18n] Failed to find locale file for "${lang}"`);
        return null;
      }

      // 3. استدعاء ملف الـ JSON ديناميكيًا كـ Module
      const module = await locales[filePath]();
      const bundle = module.default;

      // 4. حفظ الملف في الكاش وإرجاعه
      cache[lang] = bundle;
      return bundle;

    } catch (err) {
      console.error(`[i18n] Error loading locale "${lang}":`, err);
      return null;
    }

  }

  // ── DOM Applier ────────────────────────────────────────────────────────────

  /**
   * Applies all translation keys from bundle onto matching DOM elements.
   * @param {object} bundle
   */
  function applyBundle(bundle) {
    const {
      page_title,
      'i18n-text': texts,
      'i18n-html': htmls,
      'i18n-aria': arias,
      'i18n-alt':  alts,
    } = bundle;

    // 1 ── document.title
    if (page_title) {
      document.title = page_title;
    }

    // 2 ── [data-i18n-text] → textContent
    if (texts) {
      document.querySelectorAll('[data-i18n-text]').forEach(el => {
        const key   = el.getAttribute('data-i18n-text');
        const value = texts[key];
        if (value !== undefined) el.textContent = value;
        else console.warn(`[i18n] Missing text key: "${key}"`);
      });
    }

    // 3 ── [data-i18n-html] → innerHTML
    if (htmls) {
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key   = el.getAttribute('data-i18n-html');
        const value = htmls[key];
        if (value !== undefined) el.innerHTML = value;
        else console.warn(`[i18n] Missing html key: "${key}"`);
      });
    }

    // 4 ── [data-i18n-aria] → aria-label
    if (arias) {
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key   = el.getAttribute('data-i18n-aria');
        const value = arias[key];
        if (value !== undefined) el.setAttribute('aria-label', value);
        else console.warn(`[i18n] Missing aria key: "${key}"`);
      });
    }

    // 5 ── [data-i18n-alt] → alt
    if (alts) {
      document.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const key   = el.getAttribute('data-i18n-alt');
        const value = alts[key];
        if (value !== undefined) el.setAttribute('alt', value);
        else console.warn(`[i18n] Missing alt key: "${key}"`);
      });
    }
  }

  // ── <html> Attributes ──────────────────────────────────────────────────────

  function updateHtmlAttributes(bundle) {
    const { lang, dir } = bundle._meta ?? {};
    if (lang) document.documentElement.setAttribute('lang', lang);
    if (dir)  document.documentElement.setAttribute('dir',  dir);
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  function savePreference(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* silent */ }
  }

  function loadPreference() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.includes(saved) ? saved : null;
    } catch { return null; }
  }

  function detectBrowserLang() {
    const primary = (navigator.language ?? '').toLowerCase().split('-')[0];
    return SUPPORTED.includes(primary) ? primary : null;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * setLang — القلب: يحمّل اللغة، يطبقها، يحفظها.
   * هذه الدالة هي الوحيدة التي يستدعيها كل component.
   *
   * @param {string}  lang           — 'ar' | 'en'
   * @param {boolean} [persist=true] — احفظ في localStorage؟
   * @returns {Promise<void>}
   */
  async function setLang(lang, persist = true) {
    if (!SUPPORTED.includes(lang)) {
      console.error(`[i18n] Unsupported language: "${lang}"`);
      return;
    }

    const bundle = await loadLocale(lang);
    if (!bundle) return;

    updateHtmlAttributes(bundle);
    applyBundle(bundle);

    if (persist) savePreference(lang);
  }

  /**
   * init — يُستدعى مرة واحدة عند تحميل الصفحة.
   * يحدد اللغة (storage → browser → default) ويطبقها بدون حفظ جديد.
   *
   * @returns {Promise<void>}
   */
  async function init() {
    const lang = loadPreference() ?? detectBrowserLang() ?? DEFAULT_LANG;
    await setLang(lang, false);
  }

  /** @returns {string} اللغة الحالية من <html lang> */
  function getCurrentLang() {
    return document.documentElement.getAttribute('lang') ?? DEFAULT_LANG;
  }

  /** @returns {string[]} */
  function getSupportedLangs() {
    return [...SUPPORTED];
  }

  return { init, setLang, getCurrentLang, getSupportedLangs };

})();

export default I18n;