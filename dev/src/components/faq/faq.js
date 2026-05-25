/* ============================================================
   FAQ — منطق الأسئلة الشائعة
   يشتغل مباشرة على الـ HTML بدون JSON
   ============================================================

   Classes المستخدمة (متوافقة مع الـ CSS):
   .faq__btn        — زر السؤال
   .faq__btn.open   — حالة الفتح
   .faq__answer     — الإجابة
   .faq__answer.open — حالة الظهور
   .faq__item:has(.faq__btn.open) — border highlight (CSS only)
   ============================================================ */


/* ============================================================
   initFAQ() — نقطة التهيئة الوحيدة
   استدعيها مرة واحدة بعد تحميل الصفحة
   ============================================================ */

function initFAQ() {
  document.querySelectorAll('.faq__btn').forEach(btn => {
    btn.addEventListener('click', () => toggleFAQ(btn));
  });
}


/* ============================================================
   toggleFAQ() — فتح/إغلاق السؤال
   ============================================================ */

function toggleFAQ(btn) {
  const answer  = btn.nextElementSibling;
  const isOpen  = btn.classList.contains('open');

  // أغلق كل الأسئلة المفتوحة
  document.querySelectorAll('.faq__btn').forEach(b => {
    b.classList.remove('open');
    b.nextElementSibling?.classList.remove('open');
  });

  // افتح المضغوط لو كان مغلقًا
  if (!isOpen) {
    btn.classList.add('open');
    answer?.classList.add('open');
  }
}


// ← شغّل بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', initFAQ);