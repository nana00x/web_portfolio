/**
 * form.js
 * Contact form submission feedback.
 */

export function initForm() {
  const btn = document.querySelector('.form-submit');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const original = btn.textContent;
    btn.textContent = 'Pesan Terkirim ✓';
    btn.style.background = '#16A34A';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  });
}
