/**
 * sheet.js
 * Konfigurasi URL spreadsheet — diisi SATU KALI, dipakai semua halaman iklan.
 *
 * ─── CARA MENGISI ───────────────────────────────────────────
 * 1. Google Sheets → File → Publikasikan ke web → CSV → Salin URL
 * 2. Buka browser console (F12), ketik:
 *      btoa('URL_CSV_ANDA')
 * 3. Salin hasilnya, bagi dua bagian, tempel di _a dan _b di bawah
 * ────────────────────────────────────────────────────────────
 */

const _a = 'aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRz';   // ← hasil btoa bagian 1
const _b = 'L2QvMUJyamVzWXZWdUhoWXhKQnZIY1A0ZzJHRms3dno0NE04QjdlVHlTMklUZncvZWRpdD91c3A9c2hhcmluZw==';     // ← hasil btoa bagian 2

/** URL CSV aktif (sudah di-decode) */
export const SHEET_SRC = (() => {
  try { return atob(_a + _b); } catch { return ''; }
})();

/** Ubah URL Sheets apa pun → URL export CSV */
export function toCsvUrl(raw) {
  if (!raw || !raw.startsWith('http')) return null;
  if (raw.includes('docs.google.com/spreadsheets')) {
    const id  = (raw.match(/\/d\/([a-zA-Z0-9_-]+)/) || [])[1];
    const gid = (raw.match(/[#&?]gid=(\d+)/) || [])[1];
    if (id) return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? '&gid=' + gid : ''}`;
  }
  return raw;
}

/** Nama kolom → semua alias yang dikenali */
export const COL_MAP = {
  title:    ['judul','title','nama produk','produk','name'],
  category: ['kategori','category','tipe','jenis'],
  desc:     ['deskripsi','desc','description','keterangan','detail','isi'],
  badge:    ['badge','label','tag','status'],
  price:    ['harga','price','harga produk','harga jual'],
  ctaText:  ['teks tombol','ctatext','tombol','button','teks cta'],
  ctaLink:  ['link tombol','ctalink','link','url','tautan','link cta'],
  imageUrl: ['url gambar','imageurl','gambar','image','foto','img','link foto','link gambar'],
};

/** Parse CSV teks → array of arrays */
export function parseCSV(raw) {
  const rows = [];
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let cur = '', inQ = false, row = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQ && text[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) { row.push(cur.trim()); cur = ''; }
    else if (c === '\n' && !inQ)  { row.push(cur.trim()); rows.push(row); row = []; cur = ''; }
    else                           { cur += c; }
  }
  if (cur || row.length) { row.push(cur.trim()); rows.push(row); }
  return rows.filter(r => r.some(c => c));
}

/** Array of arrays → array of ad objects */
export function rowsToAds(rows) {
  if (rows.length < 2) return [];
  const map = {};
  rows[0].forEach((h, i) => {
    const k = h.toLowerCase().trim();
    for (const [field, aliases] of Object.entries(COL_MAP)) {
      if (aliases.includes(k)) { map[field] = i; break; }
    }
  });
  const g = (r, f) => { const i = map[f]; return (i !== undefined && r[i]) ? r[i] : ''; };
  return rows.slice(1)
    .filter(r => r.some(c => c))
    .map((r, i) => ({
      id: i,
      title:    g(r, 'title'),    category: g(r, 'category'),
      desc:     g(r, 'desc'),     badge:    g(r, 'badge'),
      price:    g(r, 'price'),    ctaText:  g(r, 'ctaText'),
      ctaLink:  g(r, 'ctaLink'),  imageUrl: g(r, 'imageUrl'),
    }))
    .filter(a => a.title);
}

/** Fetch semua iklan dari spreadsheet */
export async function fetchAds() {
  const csvUrl = toCsvUrl(SHEET_SRC);
  if (!csvUrl) throw new Error('URL belum dikonfigurasi');
  const res = await fetch(csvUrl, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return rowsToAds(parseCSV(await res.text()));
}
