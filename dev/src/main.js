import '/src/style.css';
import I18n from '/src/services/js/i18n.js';
import { initHeader } from '/src/components/header/header.js';
import { initResults } from '/src/components/results/results.js';
import '/src/components/faq/faq.js';

await I18n.init();
initHeader();
initResults();



const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


