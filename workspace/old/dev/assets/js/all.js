/* ================================================================
   all.js — Ahmed Ehab | Online Coaching
   الإصدار: 20260412.8
   المطوّر: AmerDev (https://amerdev.pages.dev)
   ================================================================ */


/* ────────────────────────────────────────────────────────────────
   1. NAV — إضافة كلاس "scrolled" على الـ Navbar عند التمرير
   ──────────────────────────────────────────────────────────────── */
const nav = document.getElementById('topNav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});


/* ────────────────────────────────────────────────────────────────
   2. REVEAL — تأثير الظهور عند الـ Scroll (Intersection Observer)
      يشتغل على كل عنصر فيه class="reveal"
   ──────────────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('vis');
      revealObserver.unobserve(entry.target); // بعد الظهور مش محتاج نراقبه تاني
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ────────────────────────────────────────────────────────────────
   3. PARALLAX — تأثير الـ Parallax على بانر الاقتباس
   ──────────────────────────────────────────────────────────────── */
window.addEventListener('scroll', function () {
  const parallaxBg = document.querySelector('.parallax-bg');
  if (parallaxBg) {
    parallaxBg.style.transform = `translateY(${window.pageYOffset * 0.2}px)`;
  }
});


/* ────────────────────────────────────────────────────────────────
   4. TRANSFORMS CAROUSEL — كاروسيل صور "قبل / بعد"
      يدعم: أزرار السابق/التالي، النقاط (Dots)، السحب باللمس (Touch)
   ──────────────────────────────────────────────────────────────── */
(function () {

  const track   = document.getElementById('transformsTrack');
  const cards   = Array.from(track.querySelectorAll('.tr-card'));
  const dots    = Array.from(document.querySelectorAll('.tr-dot'));
  const btnPrev = document.querySelector('.tr-prev');
  const btnNext = document.querySelector('.tr-next');

  let currentIndex = 0;
  const totalCards = cards.length;

  /* حساب عرض الكارت الواحد + الـ gap */
  function getCardWidth() {
    return cards[0].getBoundingClientRect().width + 12;
  }

  /* الانتقال لكارت بعينه */
  function goTo(index) {
    currentIndex = (index + totalCards) % totalCards;

    const outerWidth = document.querySelector('.transforms-track-outer').getBoundingClientRect().width;
    const cardWidth  = getCardWidth();
    const offset     = (currentIndex * cardWidth) - (outerWidth / 2 - cardWidth / 2);

    track.style.transform = `translateX(${offset}px)`;

    // تحديث الكارت النشط
    cards.forEach((card, i) => card.classList.toggle('active-card', i === currentIndex));

    // تحديث النقاط
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  }

  /* على الشاشات الكبيرة: تعطيل الكاروسيل وعرض كل الكروت */
  function checkDesktop() {
    if (window.innerWidth >= 900) {
      track.style.transform = '';
      cards.forEach(card => card.classList.add('active-card'));
    } else {
      goTo(currentIndex);
    }
  }

  /* ── أحداث الأزرار والنقاط ── */
  btnPrev.addEventListener('click', () => goTo(currentIndex - 1));
  btnNext.addEventListener('click', () => goTo(currentIndex + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  /* ── دعم السحب باللمس (Swipe) ── */
  let touchStartX = 0;

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  });

  /* ── مراقبة تغيير حجم النافذة ── */
  window.addEventListener('resize', checkDesktop);

  // تشغيل أولي
  checkDesktop();

})();


/* ────────────────────────────────────────────────────────────────
   5. FAQ TOGGLE — فتح/إغلاق أسئلة الـ FAQ
      يُستدعى inline من الـ HTML: onclick="tog(this)"
   ──────────────────────────────────────────────────────────────── */
function tog(btn) {
  const answer  = btn.nextElementSibling;
  const isOpen  = btn.classList.contains('open');

  // إغلاق كل الأسئلة المفتوحة أولًا
  document.querySelectorAll('.faq-btn').forEach(b => {
    b.classList.remove('open');
    b.nextElementSibling.classList.remove('open');
  });

  // إذا كان مغلقًا — افتحه
  if (!isOpen) {
    btn.classList.add('open');
    answer.classList.add('open');
  }
}


/* ────────────────────────────────────────────────────────────────
   6. DYNAMIC DATA — تحميل البيانات من data.json وتحديث الصفحة
      يشمل: روابط واتساب، عدد المتدربين، طرق الدفع، باقات الأسعار، FAQ
   ──────────────────────────────────────────────────────────────── */
(async function () {

  let config;

  /* ── تحميل ملف البيانات ── */
  try {
    const response = await fetch('assets/data/data.json', { cache: 'no-cache' });
    if (!response.ok) return;
    config = await response.json();
  } catch {
    return; // لو فشل التحميل، نكمل بالبيانات الثابتة في الـ HTML
  }

  /* ── مساعد: بناء رابط واتساب ── */
  const buildWhatsAppLink = (text) =>
    `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(text)}`;

  /* ── تحديث روابط واتساب الموجودة في الصفحة ── */
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    const url  = new URL(link.getAttribute('href'));
    const text = url.searchParams.get('text') ?? '';
    link.href  = buildWhatsAppLink(text);
  });

  /* ── تحديث عدد المتدربين في قسم الـ Hero ── */
  const proofEl = document.querySelector('.proof-text strong');
  if (proofEl) {
    proofEl.textContent = `${config.social_proof.students_count}متدرب`;
  }

  /* ── بناء كروت طرق الدفع ── */
  const paymentCardsContainer = document.querySelector('.payment-cards');

  if (paymentCardsContainer && config.payment_methods?.length) {

    // خريطة الأيقونات والكلاسات لكل طريقة دفع
    const iconMap = {
      instapay      : 'fa-bolt',
      orange        : 'fa-mobile-screen',
      bank          : 'fa-building-columns',
      western_union : 'fa-globe',
    };
    const classMap = {
      instapay      : 'instapay',
      orange        : 'orange',
      bank          : 'bank',
      western_union : 'western-union',
    };

    paymentCardsContainer.innerHTML = config.payment_methods.map(method => `
      <div class="payment-card"${method.type === 'western_union' ? ' dir="ltr"' : ''}>
        <div class="payment-icon ${classMap[method.type] ?? ''}">
          <i class="fa-solid ${iconMap[method.type] ?? 'fa-credit-card'}"></i>
        </div>
        <div class="payment-info">
          <h4>${method.label}${method.note ? ` (${method.note})` : ''}</h4>
          ${method.type === 'western_union'
            ? `<p>Receiver name: ${method.account_name}</p>
               <p>Country: ${method.branch}</p>
               <p>Transfer method: ${method.number}</p>
               ${method.mtcn ? `<p>${method.mtcn}</p>` : ''}`
            : `<p>${method.account_name}${method.note ? ' · ' + method.note : ''}${method.branch ? ' · ' + method.branch : ''}</p>
               <span class="payment-num">${method.number}</span>`
          }
        </div>
      </div>
    `).join('');
  }

  /* ── بناء كروت الأسعار ── */

  // خريطة أيقونات الـ Badge
  const badgeIconMap = {
    'الأكثر طلبًا' : 'fa-star',
    'أفضل استثمار' : 'fa-trophy',
    'أعلى قيمة'    : 'fa-crown',
  };

  function buildPriceCards(packages, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !packages?.length) return;

    container.innerHTML = packages.map(pkg => `
      <div class="price-card ${pkg.featured ? 'featured' : ''} reveal">
        ${pkg.badge ? `
          <div class="price-badge">
            <i class="fa-solid ${badgeIconMap[pkg.badge] ?? 'fa-award'}"></i>
            ${pkg.badge}
          </div>` : ''}
        <div class="price-plan">
          ${pkg.plan}
          ${pkg.plan.includes('هدية') ? '<i class="fa-solid fa-gift"></i>' : ''}
        </div>
        <div class="price-amount">
          ${pkg.price}<span class="price-cur">جنيه</span>
          ${pkg.price_usd ? `<span class="price-usd">${pkg.price_usd} USD</span>` : ''}
        </div>
        <div class="price-original">${pkg.original_price ?? ''}</div>
        <ul class="price-feats">
          ${pkg.features.map(f => `<li><i class="fa-solid fa-check"></i>${f}</li>`).join('')}
        </ul>
        <a href="${buildWhatsAppLink(pkg.whatsapp_text)}"
           class="price-btn" target="_blank" rel="noopener noreferrer">ابدأ دلوقتي</a>
      </div>
    `).join('');

    // تفعيل reveal للكروت الجديدة فورًا
    container.querySelectorAll('.reveal').forEach(el => el.classList.add('vis'));
  }

  buildPriceCards(config.pricing?.packages, 'tab-weekly');

  /* ── بناء قائمة الـ FAQ ── */
  const faqList = document.querySelector('.faq-list');

  if (faqList && config.faq?.length) {
    faqList.innerHTML = config.faq.map(item => `
      <div class="faq-item">
        <button class="faq-btn" onclick="tog(this)">
          ${item.q}
          <span class="ico"><i class="fa-solid fa-chevron-down"></i></span>
        </button>
        <div class="faq-ans">${item.a}</div>
      </div>
    `).join('');
  }

})();
