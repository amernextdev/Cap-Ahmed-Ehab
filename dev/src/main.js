import '/src/style.css';
import I18n from './services/js/i18n.js';
import { initHeader } from './components/header/header.js';


await I18n.init();
initHeader();