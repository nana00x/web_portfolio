/**
 * main.js
 * Application entry point.
 * Imports and initialises all feature modules.
 */

import { initCursor }       from './modules/cursor.js';
import { initNav }          from './modules/nav.js';
import { initMobileMenu }   from './modules/mobileMenu.js';
import { initParticles }    from './modules/particles.js';
import { initReveal, initMetricBars, initCounters } from './modules/animations.js';
import { initTestimonials } from './modules/testimonials.js';
import { initForm }         from './modules/form.js';

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initMobileMenu();
  initParticles();
  initReveal();
  initMetricBars();
  initCounters();
  initTestimonials();
  initForm();
});
