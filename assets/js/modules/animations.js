/**
 * animations.js
 * Scroll-triggered animations:
 *   - Reveal elements as they enter the viewport
 *   - Animate metric bar fills
 *   - Count-up numbers
 */

// ── Scroll Reveal ──────────────────────────────────────────
export function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

// ── Metric Bar Animate ────────────────────────────────────
export function initMetricBars() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.metric-card').forEach((el) => observer.observe(el));
}

// ── Count-up Numbers ─────────────────────────────────────
function animateCount(el) {
  const target   = Number(el.dataset.target);
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export function initCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.count').forEach((el) => observer.observe(el));
}
