/**
 * iklan.js
 * Ad manager — CRUD via localStorage.
 * Handles: render, add, edit, delete, filter, toast, confirm modal.
 */

const STORAGE_KEY = 'agriva_iklan_v1';

// ─── Default seed data ────────────────────────────────────
const DEFAULT_ADS = [
  {
    id: 'ad-1',
    title: 'Pupuk Organik GreenBoost',
    category: 'Pupuk & Nutrisi',
    desc: 'Formula organik terbukti meningkatkan hasil panen hingga 40%. Cocok untuk padi, jagung, dan hortikultura. Ramah lingkungan dan bersertifikat SNI.',
    badge: 'Unggulan',
    price: 'Rp 85.000 / 25kg',
    ctaText: 'Pesan Sekarang',
    ctaLink: '#',
    imageUrl: '',
    createdAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'ad-2',
    title: 'Sensor Tanah SmartSoil Pro',
    category: 'Teknologi Pertanian',
    desc: 'Pantau kelembaban, pH, dan suhu tanah secara real-time dari smartphone. Baterai tahan 6 bulan. Koneksi LoRa jangkauan 5km.',
    badge: 'Baru',
    price: 'Rp 1.250.000',
    ctaText: 'Lihat Detail',
    ctaLink: '#',
    imageUrl: '',
    createdAt: Date.now() - 1000 * 60 * 3,
  },
  {
    id: 'ad-3',
    title: 'Bibit Padi Unggul IR-64',
    category: 'Benih & Bibit',
    desc: 'Varietas unggul dengan ketahanan tinggi terhadap hama wereng dan blast. Potensi hasil 7–8 ton/ha. Cocok untuk musim kemarau dan penghujan.',
    badge: 'Promo',
    price: 'Rp 42.000 / 5kg',
    ctaText: 'Beli Sekarang',
    ctaLink: '#',
    imageUrl: '',
    createdAt: Date.now() - 1000 * 60 * 1,
  },
];

// ─── State ────────────────────────────────────────────────
let ads         = [];
let editingId   = null;
let deleteTarget = null;
let activeFilter = 'Semua';

// ─── Storage ──────────────────────────────────────────────
function loadAds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    ads = raw ? JSON.parse(raw) : [...DEFAULT_ADS];
  } catch {
    ads = [...DEFAULT_ADS];
  }
}

function saveAds() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
}

// ─── Helpers ──────────────────────────────────────────────
function uid() {
  return 'ad-' + Math.random().toString(36).slice(2, 9);
}

function badgeClass(badge) {
  const map = {
    'Promo': 'ad-badge-promo',
    'Baru': 'ad-badge-baru',
    'Unggulan': 'ad-badge-unggulan',
    'Limited': 'ad-badge-limited',
  };
  return map[badge] || 'ad-badge-default';
}

function getCategories() {
  const cats = ads.map(a => a.category).filter(Boolean);
  return ['Semua', ...new Set(cats)];
}

function filteredAds() {
  if (activeFilter === 'Semua') return ads;
  return ads.filter(a => a.category === activeFilter);
}

// ─── Toast ────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ─── Render filters ───────────────────────────────────────
function renderFilters() {
  const el = document.getElementById('iklanFilters');
  el.innerHTML = getCategories().map(cat => `
    <button class="filter-chip${cat === activeFilter ? ' active' : ''}"
            data-cat="${cat}">${cat}</button>
  `).join('');
  el.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.cat;
      renderFilters();
      renderGrid();
    });
  });
}

// ─── Render grid ─────────────────────────────────────────
function renderGrid() {
  const grid     = document.getElementById('iklanGrid');
  const countEl  = document.getElementById('iklanCount');
  const isAdmin  = document.getElementById('adminPanel').classList.contains('open');
  const list     = filteredAds();

  countEl.innerHTML = `Menampilkan <span>${list.length}</span> iklan`;

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="iklan-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        <div class="iklan-empty-title">Belum ada iklan</div>
        <div class="iklan-empty-sub">Klik "Kelola Iklan" lalu "+ Tambah Iklan Baru"<br/>untuk mulai menambahkan iklan produk.</div>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(ad => `
    <div class="ad-card reveal" data-id="${ad.id}">
      ${ad.imageUrl
        ? `<img class="ad-image" src="${ad.imageUrl}" alt="${ad.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="ad-image-placeholder" ${ad.imageUrl ? 'style="display:none"' : ''}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
      </div>

      ${ad.badge ? `<span class="ad-badge ${badgeClass(ad.badge)}">${ad.badge}</span>` : ''}

      ${isAdmin ? `
        <div class="ad-actions always-show">
          <button class="btn-card-action btn-edit" data-id="${ad.id}" title="Edit iklan">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-card-action btn-delete" data-id="${ad.id}" title="Hapus iklan">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round">
              <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
              <path d="M10,11v6M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/>
            </svg>
          </button>
        </div>
      ` : ''}

      <div class="ad-body">
        ${ad.category ? `<div class="ad-category">${ad.category}</div>` : ''}
        <div class="ad-title">${ad.title}</div>
        <div class="ad-desc">${ad.desc}</div>
        <div class="ad-footer">
          ${ad.price ? `<div class="ad-price">${ad.price}</div>` : '<div></div>'}
          ${ad.ctaLink ? `<a class="ad-cta" href="${ad.ctaLink}" target="_blank" rel="noopener">${ad.ctaText || 'Selengkapnya'}</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  // Bind action buttons
  grid.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openEdit(btn.dataset.id); });
  });
  grid.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openDeleteModal(btn.dataset.id); });
  });

  // Trigger reveal animation
  requestAnimationFrame(() => {
    grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  });
}

// ─── Form helpers ────────────────────────────────────────
function getFormData() {
  return {
    title:    document.getElementById('fTitle').value.trim(),
    category: document.getElementById('fCategory').value.trim(),
    desc:     document.getElementById('fDesc').value.trim(),
    badge:    document.getElementById('fBadge').value,
    price:    document.getElementById('fPrice').value.trim(),
    ctaText:  document.getElementById('fCtaText').value.trim(),
    ctaLink:  document.getElementById('fCtaLink').value.trim(),
    imageUrl: document.getElementById('fImageUrl').value.trim(),
  };
}

function fillForm(ad) {
  document.getElementById('fTitle').value    = ad.title    || '';
  document.getElementById('fCategory').value = ad.category || '';
  document.getElementById('fDesc').value     = ad.desc     || '';
  document.getElementById('fBadge').value    = ad.badge    || '';
  document.getElementById('fPrice').value    = ad.price    || '';
  document.getElementById('fCtaText').value  = ad.ctaText  || '';
  document.getElementById('fCtaLink').value  = ad.ctaLink  || '';
  document.getElementById('fImageUrl').value = ad.imageUrl || '';
}

function clearForm() {
  ['fTitle','fCategory','fDesc','fPrice','fCtaText','fCtaLink','fImageUrl']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('fBadge').value = '';
  editingId = null;
  document.getElementById('formTitle').textContent = '+ Tambah Iklan Baru';
  document.getElementById('btnSave').textContent   = 'Simpan Iklan';
}

// ─── Open edit mode ───────────────────────────────────────
function openEdit(id) {
  const ad = ads.find(a => a.id === id);
  if (!ad) return;
  editingId = id;
  fillForm(ad);
  document.getElementById('formTitle').textContent = '✎ Edit Iklan';
  document.getElementById('btnSave').textContent   = 'Perbarui Iklan';
  // ensure panel is open
  document.getElementById('adminPanel').classList.add('open');
  document.getElementById('btnAdminToggle').classList.add('active');
  document.getElementById('adminPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── Save (add or update) ────────────────────────────────
function saveAd() {
  const data = getFormData();
  if (!data.title) { showToast('⚠ Judul iklan wajib diisi'); return; }

  if (editingId) {
    const idx = ads.findIndex(a => a.id === editingId);
    if (idx !== -1) ads[idx] = { ...ads[idx], ...data };
    showToast('✓ Iklan berhasil diperbarui');
  } else {
    ads.unshift({ id: uid(), ...data, createdAt: Date.now() });
    showToast('✓ Iklan baru ditambahkan');
  }

  saveAds();
  clearForm();
  renderFilters();
  renderGrid();
}

// ─── Delete modal ────────────────────────────────────────
function openDeleteModal(id) {
  deleteTarget = id;
  const ad = ads.find(a => a.id === id);
  document.getElementById('modalAdName').textContent = ad?.title || 'iklan ini';
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  deleteTarget = null;
  document.getElementById('deleteModal').classList.remove('open');
}

function confirmDelete() {
  if (!deleteTarget) return;
  ads = ads.filter(a => a.id !== deleteTarget);
  saveAds();
  closeDeleteModal();
  renderFilters();
  renderGrid();
  showToast('🗑 Iklan berhasil dihapus');
}

// ─── Init ─────────────────────────────────────────────────
export function initIklan() {
  loadAds();

  const btnToggle  = document.getElementById('btnAdminToggle');
  const adminPanel = document.getElementById('adminPanel');
  const btnSave    = document.getElementById('btnSave');
  const btnCancel  = document.getElementById('btnCancel');

  // Toggle admin panel
  btnToggle.addEventListener('click', () => {
    const open = adminPanel.classList.toggle('open');
    btnToggle.classList.toggle('active', open);
    btnToggle.querySelector('span').textContent = open ? 'Selesai' : 'Kelola Iklan';
    if (!open) clearForm();
    renderGrid(); // re-render to show/hide action buttons
  });

  // Save button
  btnSave.addEventListener('click', saveAd);

  // Cancel / clear form
  btnCancel.addEventListener('click', clearForm);

  // Delete modal buttons
  document.getElementById('btnModalCancel').addEventListener('click', closeDeleteModal);
  document.getElementById('btnModalDelete').addEventListener('click', confirmDelete);
  document.getElementById('deleteModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });

  // Render initial state
  renderFilters();
  renderGrid();
}
