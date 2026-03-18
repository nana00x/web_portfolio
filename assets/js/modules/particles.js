/**
 * particles.js
 * Generates floating particle elements inside the hero section.
 */

const PARTICLE_COUNT = 22;

export function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p    = document.createElement('div');
    const size = Math.random() * 4 + 2;

    p.className  = 'particle';
    p.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `left:${Math.random() * 100}%`,
      `bottom:-10px`,
      `animation-duration:${Math.random() * 12 + 10}s`,
      `animation-delay:${Math.random() * 10}s`,
    ].join(';');

    container.appendChild(p);
  }
}
