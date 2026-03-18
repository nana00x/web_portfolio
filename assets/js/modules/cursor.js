/**
 * cursor.js
 * Custom animated cursor — auto-disabled on touch devices.
 */

export function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');

  if (!cursor || !ring) return;

  // Disable on touch devices
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (isTouch) {
    cursor.style.display = 'none';
    ring.style.display   = 'none';
    return;
  }

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = `${mx}px`;
    cursor.style.top  = `${my}px`;
  });

  // Smooth ring follow
  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = `${rx}px`;
    ring.style.top  = `${ry}px`;
    requestAnimationFrame(animRing);
  })();

  // Hover expand on interactive elements
  const targets = 'a, button, .service-card, .team-card, .testi-card';
  document.querySelectorAll(targets).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '18px';
      cursor.style.height = '18px';
      ring.style.width    = '54px';
      ring.style.height   = '54px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '10px';
      cursor.style.height = '10px';
      ring.style.width    = '36px';
      ring.style.height   = '36px';
    });
  });
}
