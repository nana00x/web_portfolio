/**
 * iklan.js
 * Carousel iklan — 3 kartu terlihat, scroll horizontal untuk lebih.
 * Data dari Google Sheets via sheet.js.
 */

import { fetchAds } from './sheet.js';

const PER_VIEW = 3; // kartu visible di desktop

// ── Badge class ──────────────────────────────────────────
function badgeClass(b) {
  return { Promo:'badge-promo', Baru:'badge-baru', Unggulan:'badge-unggulan', Limited:'badge-limited' }[b] || 'badge-default';
}

// ── State ────────────────────────────────────────────────
let allAds = [], activeFilter = 'Semua';

// ── Toast ────────────────────────────────────────────────
function showToast(msg, err = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (err ? ' toast-err' : '');
  void t.offsetWidth;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Carousel controls ─────────────────────────────────────
function initCarousel() {
  const track  = document.getElementById('iklanGrid');
  const nav    = document.getElementById('carouselNav');
  const btnP   = document.getElementById('btnPrev');
  const btnN   = document.getElementById('btnNext');
  const dotsEl = document.getElementById('carouselDots');

  if (!track) return;

  // Visible count based on actual card width
  function perView() {
    const card = track.querySelector('.ad-card');
    if (!card) return PER_VIEW;
    return Math.round(track.offsetWidth / (card.offsetWidth + 20)) || 1;
  }

  function totalPages() {
    const count = track.querySelectorAll('.ad-card').length;
    return Math.ceil(count / perView());
  }

  function currentPage() {
    const card = track.querySelector('.ad-card');
    if (!card) return 0;
    return Math.round(track.scrollLeft / (card.offsetWidth + 20) / perView());
  }

  function updateUI() {
    const pv   = perView();
    const total = track.querySelectorAll('.ad-card').length;
    const pages = Math.ceil(total / pv);
    const cur   = currentPage();

    btnP.disabled = cur === 0;
    btnN.disabled = cur >= pages - 1;

    // Dots
    dotsEl.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === cur ? ' active' : '');
      d.setAttribute('aria-label', `Halaman ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    }

    // Show nav only if there's more than one page
    nav.style.display = pages > 1 ? 'flex' : 'none';
  }

  function goTo(page) {
    const card = track.querySelector('.ad-card');
    if (!card) return;
    const pv       = perView();
    const cardW    = card.offsetWidth + 20;
    track.scrollTo({ left: page * pv * cardW, behavior: 'smooth' });
  }

  btnP.addEventListener('click', () => goTo(currentPage() - 1));
  btnN.addEventListener('click', () => goTo(currentPage() + 1));

  track.addEventListener('scroll', updateUI, { passive: true });
  window.addEventListener('resize', updateUI, { passive: true });

  // Drag to scroll
  let isDown = false, startX = 0, scrollLeft = 0;
  track.addEventListener('mousedown', e => {
    isDown = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });
  track.addEventListener('mouseleave', () => { isDown = false; track.style.cursor = 'grab'; });
  track.addEventListener('mouseup',    () => { isDown = false; track.style.cursor = 'grab'; });
  track.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.2;
  });

  return updateUI;
}

// ── Filters ──────────────────────────────────────────────
function renderFilters(updateCarousel) {
  const el = document.getElementById('iklanFilters');
  const cats = ['Semua', ...new Set(allAds.map(a => a.category).filter(Boolean))];
  el.innerHTML = cats.length > 1
    ? cats.map(c => `<button class="filter-chip${c === activeFilter ? ' active' : ''}" data-cat="${c}">${c}</button>`).join('')
    : '';
  el.querySelectorAll('.filter-chip').forEach(btn =>
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.cat;
      renderFilters(updateCarousel);
      renderGrid(updateCarousel);
    })
  );
}

// ── Grid ─────────────────────────────────────────────────
function renderGrid(updateCarousel) {
  const grid    = document.getElementById('iklanGrid');
  const countEl = document.getElementById('iklanCount');
  const list    = activeFilter === 'Semua' ? allAds : allAds.filter(a => a.category === activeFilter);

  countEl.innerHTML = allAds.length
    ? `Menampilkan <span>${list.length}</span>${activeFilter !== 'Semua' ? ' dari ' + allAds.length : ''} iklan`
    : '';

  if (!list.length) {
    grid.innerHTML = `
      <div class="iklan-empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>
        </svg>
        <div class="iklan-empty-title">Tidak ada iklan</div>
        <div class="iklan-empty-sub">Coba pilih kategori lain.</div>
      </div>`;
    document.getElementById('carouselNav').style.display = 'none';
    return;
  }

  grid.innerHTML = list.map(ad => `
    <div class="ad-card" role="listitem">
      ${ad.imageUrl
        ? `<img class="ad-image" src="${ad.imageUrl}" alt="${ad.title}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="ad-image-placeholder"${ad.imageUrl ? ' style="display:none"' : ''}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
        </svg>
      </div>
      ${ad.badge ? `<span class="ad-badge ${badgeClass(ad.badge)}">${ad.badge}</span>` : ''}
      <div class="ad-body">
        ${ad.category ? `<div class="ad-category">${ad.category}</div>` : ''}
        <div class="ad-title">${ad.title}</div>
        ${ad.desc ? `<div class="ad-desc">${ad.desc}</div>` : ''}
        <div class="ad-footer">
          ${ad.price ? `<div class="ad-price">${ad.price}</div>` : '<div></div>'}
          <a class="ad-cta" href="iklan-detail.html?id=${ad.id}">
            ${ad.ctaText || 'Baca Selengkapnya'}
          </a>
        </div>
      </div>
    </div>`).join('');

  // Scroll back to start & update controls
  document.getElementById('iklanGrid').scrollTo({ left: 0 });
  if (updateCarousel) requestAnimationFrame(updateCarousel);
}

// ── Skeleton ─────────────────────────────────────────────
function renderSkeleton() {
  document.getElementById('iklanGrid').innerHTML = Array(6).fill(`
    <div class="skel-card">
      <div class="skel skel-img"></div>
      <div class="skel-body">
        <div class="skel skel-line" style="width:36%"></div>
        <div class="skel skel-line" style="width:80%"></div>
        <div class="skel skel-line" style="width:60%"></div>
        <div class="skel skel-line" style="width:42%"></div>
      </div>
    </div>`).join('');
  document.getElementById('iklanCount').textContent = 'Memuat data...';
}

// ── Error ────────────────────────────────────────────────
function renderError() {
  document.getElementById('iklanGrid').innerHTML = `
    <div class="iklan-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div class="iklan-empty-title">Gagal memuat data</div>
      <div class="iklan-empty-sub">
        Periksa koneksi internet lalu tekan Refresh.<br>
        <a href="#" id="retryLink" style="color:rgba(74,222,128,.6);text-decoration:none;">Coba lagi →</a>
      </div>
    </div>`;
  document.getElementById('iklanCount').textContent = '';
  document.getElementById('retryLink')
    ?.addEventListener('click', e => { e.preventDefault(); loadAds(); });
}

// ── Load ─────────────────────────────────────────────────
let updateCarousel;

export async function loadAds() {
  const btn = document.getElementById('btnRefresh');
  btn?.classList.add('spinning');
  renderSkeleton();
  try {
    allAds = await fetchAds();
    activeFilter = 'Semua';
    renderFilters(updateCarousel);
    renderGrid(updateCarousel);
    showToast(`✓ ${allAds.length} iklan dimuat`);
  } catch (err) {
    console.warn('[iklan]', err.message);
    renderError();
    showToast('Gagal memuat data iklan', true);
  }
  btn?.classList.remove('spinning');
}

// ── Init ─────────────────────────────────────────────────
export function initIklan() {
  updateCarousel = initCarousel();
  document.getElementById('btnRefresh')?.addEventListener('click', loadAds);
  loadAds();
}
