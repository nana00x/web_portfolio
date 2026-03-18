/**
 * testimonials.js
 * Drag-to-scroll behaviour for the testimonials carousel.
 */

export function initTestimonials() {
  const slider = document.getElementById('testiScroll');
  if (!slider) return;

  let isDown   = false;
  let startX   = 0;
  let scrollLeft = 0;

  slider.addEventListener('mousedown', (e) => {
    isDown  = true;
    startX  = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    slider.style.cursor = 'grabbing';
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x   = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.2;
    slider.scrollLeft = scrollLeft - walk;
  });
}
