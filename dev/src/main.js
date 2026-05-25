import '/src/style.css';
import I18n from './services/js/i18n.js';
import { initHeader } from './components/header/header.js';
import { initResults } from './components/results/results.js';
import './components/faq/faq.js';

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


