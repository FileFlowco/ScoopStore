/* ──────────────────────────────────────────────────
   XSUPPLY — Cart & UI Logic
   ────────────────────────────────────────────────── */

// ── CART STATE ──
const XCart = {
  items: [],

  load() {
    try {
      this.items = JSON.parse(localStorage.getItem('xsupply_cart') || '[]');
    } catch { this.items = []; }
  },

  save() {
    localStorage.setItem('xsupply_cart', JSON.stringify(this.items));
  },

  add(product) {
    const key = `${product.id}__${product.variant}__${product.color}`;
    const existing = this.items.find(i => i._key === key);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      this.items.push({ ...product, _key: key, qty: product.qty || 1 });
    }
    this.save();
    this.render();
    showToast(`✓ ${product.name} added to cart`);
  },

  remove(key) {
    this.items = this.items.filter(i => i._key !== key);
    this.save();
    this.render();
  },

  updateQty(key, delta) {
    const item = this.items.find(i => i._key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.remove(key);
    else { this.save(); this.render(); }
  },

  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  render() {
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = this.count();
    });

    const itemsEl = document.getElementById('cartItems');
    const emptyEl = document.getElementById('cartEmpty');
    const subtotalEl = document.getElementById('cartSubtotal');
    const footerEl = document.getElementById('cartFooter');

    if (!itemsEl) return;

    if (this.items.length === 0) {
      itemsEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'flex';
      if (footerEl) footerEl.style.display = 'none';
    } else {
      if (emptyEl) emptyEl.style.display = 'none';
      if (footerEl) footerEl.style.display = 'block';

      itemsEl.innerHTML = this.items.map(item => `
        <div class="cart-item">
          <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://xsupply.pro/assets/4.jpg'">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-variant">${item.variant}${item.color ? ' · ' + item.color : ''}</div>
            <div class="cart-item-bottom">
              <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
              <div class="qty-ctrl">
                <button onclick="XCart.updateQty('${item._key}', -1)">−</button>
                <span>${item.qty}</span>
                <button onclick="XCart.updateQty('${item._key}', 1)">+</button>
              </div>
              <button class="cart-remove" onclick="XCart.remove('${item._key}')" title="Remove">×</button>
            </div>
          </div>
        </div>
      `).join('');

      if (subtotalEl) subtotalEl.textContent = `$${this.total().toFixed(2)}`;
    }
  }
};

// ── AUTH STATE ──
const XAuth = {
  user: null,

  load() {
    try {
      this.user = JSON.parse(localStorage.getItem('xsupply_user') || 'null');
    } catch { this.user = null; }
  },

  save() {
    localStorage.setItem('xsupply_user', JSON.stringify(this.user));
  },

  login(email, name) {
    this.user = { email, name, avatar: name.charAt(0).toUpperCase(), createdAt: Date.now() };
    this.save();
    this.renderNav();
    showToast(`✓ Welcome back, ${name.split(' ')[0]}!`);
  },

  logout() {
    this.user = null;
    this.save();
    this.renderNav();
    showToast('Signed out successfully');
  },

  renderNav() {
    const btns = document.querySelectorAll('.auth-nav-btn-wrap');
    btns.forEach(wrap => {
      if (this.user) {
        wrap.innerHTML = `
          <div style="position:relative;display:inline-block;">
            <button class="auth-user-btn" onclick="toggleUserMenu(this)">
              <span class="avatar">${this.user.avatar}</span>
              ${this.user.name.split(' ')[0]}
            </button>
            <div class="user-dropdown" style="display:none;position:absolute;right:0;top:calc(100% + 8px);background:var(--gray-1);border:1px solid var(--gray-3);border-radius:8px;min-width:180px;z-index:500;overflow:hidden;">
              <div style="padding:12px 16px;border-bottom:1px solid var(--gray-3);font-size:12px;color:var(--text-muted);">${this.user.email}</div>
              <button onclick="XAuth.logout();closeUserMenu();" style="width:100%;text-align:left;padding:12px 16px;background:none;border:none;color:var(--white);font-size:13px;font-weight:600;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='var(--gray-2)'" onmouseout="this.style.background='none'">Sign Out</button>
            </div>
          </div>`;
      } else {
        wrap.innerHTML = `<button class="auth-user-btn" onclick="openAuth()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Sign In
        </button>`;
      }
    });
  }
};

function toggleUserMenu(btn) {
  const dropdown = btn.nextElementSibling;
  const isOpen = dropdown.style.display !== 'none';
  document.querySelectorAll('.user-dropdown').forEach(d => d.style.display = 'none');
  if (!isOpen) dropdown.style.display = 'block';
}

function closeUserMenu() {
  document.querySelectorAll('.user-dropdown').forEach(d => d.style.display = 'none');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.auth-user-btn') && !e.target.closest('.user-dropdown')) {
    closeUserMenu();
  }
});

// ── AUTH MODAL ──
function openAuth(tab = 'login') {
  let overlay = document.getElementById('authOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'authOverlay';
    overlay.className = 'auth-overlay';
    overlay.innerHTML = `
      <div class="auth-modal">
        <button class="auth-close" onclick="closeAuth()">×</button>
        <div class="auth-logo">X<span>SUPPLY</span></div>
        <div class="auth-tabs">
          <button class="auth-tab-btn active" id="authTabLogin" onclick="switchAuthTab('login')">Sign In</button>
          <button class="auth-tab-btn" id="authTabSignup" onclick="switchAuthTab('signup')">Create Account</button>
        </div>

        <div id="authPanelLogin" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="authLoginEmail" placeholder="you@example.com" autocomplete="email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="authLoginPass" placeholder="••••••••" autocomplete="current-password">
          </div>
          <button class="auth-submit-btn" onclick="handleLogin()">Sign In</button>
          <div class="auth-divider">or</div>
          <button class="auth-google-btn" onclick="handleGoogleAuth()">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>
          <p style="font-size:11px;color:var(--text-muted);text-align:center;">Don't have an account? <a href="#" onclick="switchAuthTab('signup');return false;" style="color:var(--accent);">Sign up</a></p>
        </div>

        <div id="authPanelSignup" class="auth-form" style="display:none;">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="authSignupName" placeholder="John Doe" autocomplete="name">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="authSignupEmail" placeholder="you@example.com" autocomplete="email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="authSignupPass" placeholder="Min. 8 characters" autocomplete="new-password">
          </div>
          <button class="auth-submit-btn" onclick="handleSignup()">Create Account</button>
          <div class="auth-divider">or</div>
          <button class="auth-google-btn" onclick="handleGoogleAuth()">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>
          <p style="font-size:11px;color:var(--text-muted);text-align:center;">Already have an account? <a href="#" onclick="switchAuthTab('login');return false;" style="color:var(--accent);">Sign in</a></p>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAuth(); });
  }
  switchAuthTab(tab);
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeAuth() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) { overlay.classList.remove('show'); document.body.style.overflow = ''; }
}

function switchAuthTab(tab) {
  document.getElementById('authTabLogin')?.classList.toggle('active', tab === 'login');
  document.getElementById('authTabSignup')?.classList.toggle('active', tab === 'signup');
  const loginPanel = document.getElementById('authPanelLogin');
  const signupPanel = document.getElementById('authPanelSignup');
  if (loginPanel) loginPanel.style.display = tab === 'login' ? 'flex' : 'none';
  if (signupPanel) signupPanel.style.display = tab === 'signup' ? 'flex' : 'none';
}

function handleLogin() {
  const email = document.getElementById('authLoginEmail')?.value.trim();
  const pass = document.getElementById('authLoginPass')?.value;
  if (!email || !pass) { showToast('Please fill in all fields'); return; }
  if (!email.includes('@')) { showToast('Enter a valid email'); return; }
  const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  XAuth.login(email, name);
  closeAuth();
}

function handleSignup() {
  const name = document.getElementById('authSignupName')?.value.trim();
  const email = document.getElementById('authSignupEmail')?.value.trim();
  const pass = document.getElementById('authSignupPass')?.value;
  if (!name || !email || !pass) { showToast('Please fill in all fields'); return; }
  if (!email.includes('@')) { showToast('Enter a valid email'); return; }
  if (pass.length < 8) { showToast('Password must be at least 8 characters'); return; }
  XAuth.login(email, name);
  closeAuth();
}

function handleGoogleAuth() {
  showToast('Google sign-in coming soon! Use email for now.');
}

// ── CART DRAWER ──
function openCart() {
  document.getElementById('cartOverlay')?.classList.add('open');
  document.getElementById('cartDrawer')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── TOAST ──
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('.toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── NAV HAMBURGER ──
function initNav() {
  const ham = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!ham || !menu) return;
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      ham.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── CHECKOUT REDIRECT ──
function goToCheckout() {
  if (XCart.items.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  window.location.href = 'checkout.html';
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  XCart.load();
  XCart.render();
  XAuth.load();
  XAuth.renderNav();
  initNav();

  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
