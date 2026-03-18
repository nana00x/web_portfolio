/**
 * auth.js
 * Admin authentication via SHA-256 hashed password.
 * - Default password: "agriva2025"
 * - Custom password stored as hash in localStorage (never plaintext)
 * - Session stored in sessionStorage (cleared on tab close)
 */

const SESSION_KEY  = 'agriva_admin_session';
const PW_STORE_KEY = 'agriva_admin_pw_hash';

// Fallback hash for default password "agriva2025"
const DEFAULT_HASH = '1319411269981c0b0a3e8a9fcd304f37354750f123a7245551e0b6ba29c5e614';

// Hash a plaintext password
export async function hashPassword(plain) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(plain));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Get the currently active hash (custom or default)
function getStoredHash() {
  return localStorage.getItem(PW_STORE_KEY) || DEFAULT_HASH;
}

// Session helpers
export function isAdmin() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}
function setAdmin(val) {
  if (val) sessionStorage.setItem(SESSION_KEY, '1');
  else     sessionStorage.removeItem(SESSION_KEY);
}

// Login
export async function attemptLogin(password) {
  const hash = await hashPassword(password);
  if (hash === getStoredHash()) { setAdmin(true); return true; }
  return false;
}

// Change password
export async function changePassword(currentPw, newPw) {
  const currentHash = await hashPassword(currentPw);
  if (currentHash !== getStoredHash()) {
    return { ok: false, message: 'Password saat ini salah.' };
  }
  if (!newPw || newPw.length < 6) {
    return { ok: false, message: 'Password baru minimal 6 karakter.' };
  }
  localStorage.setItem(PW_STORE_KEY, await hashPassword(newPw));
  return { ok: true, message: 'Password berhasil diubah.' };
}

// Logout
export function logout() { setAdmin(false); }
