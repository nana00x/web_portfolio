/**
 * iklan-detail.js
 * Halaman detail iklan — baca ?id= dari URL, tampilkan info lengkap.
 */

import { fetchAds } from './sheet.js';

function badgeClass(b) {
  return { Promo:'badge-promo', Baru:'badge-baru', Unggulan:'badge-unggulan', Limited:'badge-limited' }[b] || 'badge-default';
}

// ── Skeleton ────────────────────────────────────────────
function renderSkeleton() {
  document.getElementById('detailContent').innerHTML = `
    <div class="detail-hero-wrap">
      <div class="skel detail-skel-img"></div>
    </div>
    <div class="detail-body">
      <div class="skel skel-line" style="width:22%;margin-bottom:12px"></div>
      <div class="skel skel-line" style="width:70%;height:36px;margin-bottom:20px"></div>
      <div class="skel skel-line" style="width:95%;margin-bottom:8px"></div>
      <div class="skel skel-line" style="width:88%;margin-bottom:8px"></div>
      <div class="skel skel-line" style="width:75%;margin-bottom:32px"></div>
      <div class="skel skel-line" style="width:28%;height:48px;border-radius:40px"></div>
    </div>`;
}

// ── Not found ───────────────────────────────────────────
function renderNotFound() {
  document.getElementById('detailContent').innerHTML = `
    <div class="detail-notfound">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <div class="detail-notfound-title">Iklan tidak ditemukan</div>
      <div class="detail-notfound-sub">Iklan ini mungkin sudah tidak tersedia atau ID tidak valid.</div>
      <a href="iklan.html" class="btn-back-big">← Kembali ke Daftar Iklan</a>
    </div>`;
}

// ── Render detail ───────────────────────────────────────
function renderDetail(ad) {
  // Update page title
  document.title = `${ad.title} — Agriva Indonesia`;

  // Update breadcrumb
  const bc = document.getElementById('breadcrumbTitle');
  if (bc) bc.textContent = ad.title;

  document.getElementById('detailContent').innerHTML = `
    <!-- Hero image -->
    <div class="detail-hero-wrap">
      ${ad.imageUrl
        ? `<img class="detail-hero-img" src="${ad.imageUrl}" alt="${ad.title}"
               onerror="this.parentElement.innerHTML='<div class=\\'detail-hero-placeholder\\'><svg width=\\'64\\' height=\\'64\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'white\\' stroke-width=\\'1\\' stroke-linecap=\\'round\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21,15 16,10 5,21\\'/></svg></div>'">`
        : `<div class="detail-hero-placeholder">
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1" stroke-linecap="round">
               <rect x="3" y="3" width="18" height="18" rx="2"/>
               <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
             </svg>
           </div>`}
      ${ad.badge ? `<span class="detail-badge ${badgeClass(ad.badge)}">${ad.badge}</span>` : ''}
    </div>

    <!-- Content -->
    <div class="detail-body">

      <!-- Category + title -->
      ${ad.category ? `<div class="detail-category">${ad.category}</div>` : ''}
      <h1 class="detail-title">${ad.title}</h1>

      <!-- Price chip -->
      ${ad.price ? `
        <div class="detail-price-row">
          <div class="detail-price">${ad.price}</div>
        </div>` : ''}

      <!-- Divider -->
      <div class="detail-divider"></div>

      <!-- Description -->
      ${ad.desc ? `
        <div class="detail-section-label">Tentang Produk</div>
        <div class="detail-desc">${ad.desc.replace(/\n/g, '<br>')}</div>
      ` : ''}

      <!-- Info table -->
      <div class="detail-info-grid">
        ${ad.category ? `
          <div class="detail-info-item">
            <div class="detail-info-label">Kategori</div>
            <div class="detail-info-value">${ad.category}</div>
          </div>` : ''}
        ${ad.price ? `
          <div class="detail-info-item">
            <div class="detail-info-label">Harga</div>
            <div class="detail-info-value" style="color:var(--mist);font-weight:800">${ad.price}</div>
          </div>` : ''}
        ${ad.badge ? `
          <div class="detail-info-item">
            <div class="detail-info-label">Status</div>
            <div class="detail-info-value">
              <span class="detail-badge-inline ${badgeClass(ad.badge)}">${ad.badge}</span>
            </div>
          </div>` : ''}
      </div>

      <!-- CTA -->
      <div class="detail-actions">
        ${ad.ctaLink
          ? `<a class="btn-detail-cta" href="${ad.ctaLink}" target="_blank" rel="noopener">
               ${ad.ctaText || 'Hubungi Penjual'}
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                 <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
               </svg>
             </a>`
          : ''}
        <a class="btn-detail-back" href="iklan.html">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali
        </a>
      </div>

    </div>`;
}

// ── Init ────────────────────────────────────────────────
export async function initIklanDetail() {
  const id = Number(new URLSearchParams(window.location.search).get('id'));

  renderSkeleton();

  try {
    const ads = await fetchAds();
    const ad  = ads.find(a => a.id === id);
    if (!ad) { renderNotFound(); return; }
    renderDetail(ad);
  } catch (err) {
    console.warn('[iklan-detail]', err.message);
    renderNotFound();
  }
}
