// ─── Cart State ───────────────────────────────
let cart = JSON.parse(localStorage.getItem('makanyuk_cart') || '[]');

function saveCart() {
  localStorage.setItem('makanyuk_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart();
  showToast(`${name} ditambahkan ke keranjang`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function updateQty(id, qty) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = qty;
    if (qty <= 0) removeFromCart(id);
    else saveCart();
  }
}

function cartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

// ─── Toast Notification ───────────────────────
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position:fixed; bottom:1.5rem; right:1.5rem;
      z-index:9999; display:flex; flex-direction:column; gap:0.5rem;
    `;
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.style.cssText = `
    background:${type === 'success' ? '#0F6E56' : '#991B1B'};
    color:#fff; padding:0.75rem 1.25rem;
    border-radius:10px; font-size:0.875rem; font-weight:500;
    box-shadow:0 4px 12px rgba(0,0,0,0.15);
    animation:fadeUp 0.3s ease;
    max-width:280px;
  `;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

// ─── Format currency ──────────────────────────
function formatRp(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

// ─── Auth helpers (simulasi) ──────────────────
function getUser() {
  return JSON.parse(localStorage.getItem('makanyuk_user') || 'null');
}
function setUser(user) {
  localStorage.setItem('makanyuk_user', JSON.stringify(user));
}
function logout() {
  localStorage.removeItem('makanyuk_user');
  window.location.href = 'login.html';
}

// ─── Init on load ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // Active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});
