import { currentUser, onUserChange, register, login, signOut, updateRole, parseError, authReady, resetPassword } from './auth.js';
import { listenAvailableRides, getMyRides, getMyBookings, getRideById, createRide, bookRide, cancelBooking, completeRide, cancelRide } from './rides.js';
import { toast, showModal, btnLoad, badgeHtml, rideCardHtml, skeletonHtml, loaderHtml, emptyHtml, formatDate } from './ui.js';

// ── State ──────────────────────────────────────

// ── Dark Mode ───────────────────────────────────
const savedTheme = localStorage.getItem('jv-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

function toggleDarkMode(on) {
  const theme = on ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('jv-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = on ? '#0a0a0a' : '#ffffff';
}

function isDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

let activeTab   = 'home';
let myRidesMode = 'driver';
let homeUnsub   = null;

// ── Boot ───────────────────────────────────────
const waitAuth = setInterval(() => {
  if (authReady) { clearInterval(waitAuth); boot(); }
}, 80);
setTimeout(() => { clearInterval(waitAuth); boot(); }, 3500);

function boot() {
  hideSplash();
  onUserChange(user => user ? mountApp() : mountAuth('login'));
  if (currentUser) mountApp();
  else if (authReady) mountAuth('login');
}

function hideSplash() {
  setTimeout(() => {
    const s = document.getElementById('splash');
    if (s) { s.classList.add('out'); setTimeout(() => s.remove(), 500); }
  }, 1200);
}

// ══════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════
function mountAuth(tab = 'login') {
  stopHomeListener();
  document.getElementById('app').innerHTML = authHTML(tab);
  bindAuth(tab);
}

function authHTML(tab) {
  const isLogin = tab === 'login';
  return `
  <div class="auth-screen">
    <div class="auth-logo">
      <svg viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="28" fill="#1DCC70"/>
        <path d="M18 30 L30 18 L42 30 L30 42 Z" fill="white" opacity="0.9"/>
        <circle cx="30" cy="30" r="5" fill="white"/>
      </svg>
      <span class="auth-logo-text">JaveCupos</span>
    </div>

    <h1 class="auth-headline">${isLogin ? 'Bienvenido de vuelta' : 'Crear cuenta'}</h1>
    <p class="auth-sub">${isLogin ? 'Inicia sesión para continuar' : 'Únete a la comunidad PUJ Cali'}</p>

    <div class="auth-toggle">
      <button class="auth-toggle-btn ${isLogin ? 'active' : ''}" id="tab-login">Iniciar sesión</button>
      <button class="auth-toggle-btn ${!isLogin ? 'active' : ''}" id="tab-register">Crear cuenta</button>
    </div>

    <!-- LOGIN -->
    <div id="panel-login" ${!isLogin ? 'class="hidden"' : ''}>
      <div class="field">
        <label class="field-label">Correo electrónico</label>
        <input id="l-email" class="field-input" type="email" placeholder="tu@correo.com" autocomplete="email"/>
      </div>
      <div class="field">
        <label class="field-label">Contraseña</label>
        <div class="field-wrap">
          <input id="l-pass" class="field-input has-icon" type="password" placeholder="••••••••" autocomplete="current-password"/>
          <button class="eye-btn" id="l-eye" type="button">👁</button>
        </div>
      </div>
      <button id="l-btn" class="btn btn-primary mt-8">Iniciar sesión</button>
      <button
  id="forgot-password"
  class="btn btn-ghost mt-8"
  type="button"
>
  ¿Olvidaste tu contraseña?
</button>
    </div>

    <!-- REGISTER -->
    <div id="panel-register" ${isLogin ? 'class="hidden"' : ''}>
      <div class="role-select">
        <button class="role-opt selected" data-role="passenger" type="button">
          <span class="role-opt-icon">🎒</span>
          <span class="role-opt-title">Pasajero</span>
          <span class="role-opt-desc">Reserva cupos en viajes</span>
          <span class="role-opt-check">✓</span>
        </button>
        <button class="role-opt" data-role="driver" type="button">
          <span class="role-opt-icon">🚗</span>
          <span class="role-opt-title">Conductor</span>
          <span class="role-opt-desc">Publica y gestiona viajes</span>
          <span class="role-opt-check">✓</span>
        </button>
      </div>
      <div class="field">
        <label class="field-label">Nombre completo</label>
        <input id="r-name" class="field-input" type="text" placeholder="Tu nombre completo" autocomplete="name"/>
      </div>
      <div class="field">
        <label class="field-label">Correo electrónico</label>
        <input id="r-email" class="field-input" type="email" placeholder="tu@correo.com" autocomplete="email"/>
      </div>
      <div class="field">
        <label class="field-label">Contraseña</label>
        <div class="field-wrap">
          <input id="r-pass" class="field-input has-icon" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password"/>
          <button class="eye-btn" id="r-eye" type="button">👁</button>
        </div>
      </div>
      <button id="r-btn" class="btn btn-primary mt-8">Crear cuenta</button>
    </div>
  </div>`;
}

function bindAuth(tab) {
  let selectedRole = 'passenger';

  document.getElementById('tab-login').onclick    = () => mountAuth('login');
  document.getElementById('tab-register').onclick = () => mountAuth('register');

  const bindEye = (eyeId, inputId) => {
    const eye = document.getElementById(eyeId);
    const inp = document.getElementById(inputId);
    if (eye && inp) eye.onclick = () => {
      inp.type = inp.type === 'password' ? 'text' : 'password';
      eye.textContent = inp.type === 'password' ? '👁' : '🙈';
    };
  };
  bindEye('l-eye', 'l-pass');
  bindEye('r-eye', 'r-pass');

  document.querySelectorAll('.role-opt[data-role]').forEach(c => {
    c.onclick = () => {
      document.querySelectorAll('.role-opt').forEach(x => x.classList.remove('selected'));
      c.classList.add('selected');
      selectedRole = c.dataset.role;
    };
  });

  const lBtn = document.getElementById('l-btn');
  const forgotBtn =
  document.getElementById('forgot-password');

if (forgotBtn) {

  forgotBtn.onclick = async () => {

    const email = document
      .getElementById('l-email')
      .value
      .trim();

    if (!email) {

      toast(
        'Escribe tu correo primero',
        'error'
      );

      return;

    }

    try {

      await resetPassword(email);

      toast(
        'Te enviamos un correo para recuperar tu contraseña 📩',
        'success'
      );

    } catch (e) {

      toast(parseError(e), 'error');

    }

  };

}
  if (lBtn) lBtn.onclick = async () => {
    const email = document.getElementById('l-email').value.trim();
    const pass  = document.getElementById('l-pass').value;
    if (!email || !pass) { toast('Completa todos los campos', 'error'); return; }
    btnLoad(lBtn, true);
    try {
      await login(email.toLowerCase(), pass);
      toast('¡Bienvenido! 👋', 'success');
      mountApp();
    } catch (e) {
      toast(parseError(e), 'error');
      btnLoad(lBtn, false);
    }
    
  };

  const rBtn = document.getElementById('r-btn');
  if (rBtn) rBtn.onclick = async () => {
    const name  = document.getElementById('r-name').value.trim();
    const email = document.getElementById('r-email').value.trim();
    const pass  = document.getElementById('r-pass').value;
    if (!name || !email || !pass) { toast('Completa todos los campos', 'error'); return; }
    if (pass.length < 6) { toast('Contraseña mínimo 6 caracteres', 'error'); return; }
    btnLoad(rBtn, true);
    try {
      await register(name, email.toLowerCase(), pass, selectedRole);
      const roleLabel = selectedRole === 'driver' ? 'Conductor 🚗' : 'Pasajero 🎒';
      showModal({
        icon: '🎉',
        title: '¡Cuenta creada!',
        subtitle: `Hola ${name}, ya eres parte de JaveCupos como ${roleLabel}.`,
        actions: [{ label: '¡Empezar!', cls: 'btn-primary', onPress: () => mountApp() }],
      });
    } catch (e) {
      toast(parseError(e), 'error');
      btnLoad(rBtn, false);
    }
  };

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (tab === 'login' && lBtn)    lBtn.click();
    if (tab === 'register' && rBtn) rBtn.click();
  }, { once: true });
}

// ══════════════════════════════════════════════
//  APP SHELL
// ══════════════════════════════════════════════
function mountApp() {
  const isDriver = ['driver', 'admin'].includes(currentUser?.role);

  document.getElementById('app').innerHTML = `
    <div class="app-shell">
      <div class="screen-area" id="screen-area"></div>
      <nav class="tab-bar">
        <button class="tab-btn" data-tab="home">
          <span class="tab-icon">🏠</span>
          <span class="tab-label">Inicio</span>
          <span class="tab-pip"></span>
        </button>
        ${isDriver ? `
        <button class="tab-btn" data-tab="publish">
          <span class="tab-icon">＋</span>
          <span class="tab-label">Publicar</span>
          <span class="tab-pip"></span>
        </button>` : ''}
        <button class="tab-btn" data-tab="myrides">
          <span class="tab-icon">${isDriver ? '🚗' : '🎒'}</span>
          <span class="tab-label">Mis viajes</span>
          <span class="tab-pip"></span>
        </button>
        <button class="tab-btn" data-tab="profile">
          <span class="tab-icon">👤</span>
          <span class="tab-label">Perfil</span>
          <span class="tab-pip"></span>
        </button>
      </nav>
    </div>`;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
  });

  switchTab('home');
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  if (tab !== 'home') stopHomeListener();
  if (tab === 'home')    renderHome();
  if (tab === 'publish') renderCreateRide();
  if (tab === 'myrides') renderMyRides();
  if (tab === 'profile') renderProfile();
}

function stopHomeListener() {
  if (homeUnsub) { homeUnsub(); homeUnsub = null; }
}

function setScreen(html) {
  const area = document.getElementById('screen-area');
  if (!area) return;
  area.innerHTML = html;
  requestAnimationFrame(() => {
    const s = area.querySelector('.screen');
    if (s) requestAnimationFrame(() => s.classList.add('active'));
  });
}

// ══════════════════════════════════════════════
//  HOME
// ══════════════════════════════════════════════
function renderHome() {
  const isDriver  = ['driver', 'admin'].includes(currentUser?.role);
  const firstName = currentUser?.name?.split(' ')[0] || 'tú';
  const roleLabel = isDriver ? '🚗 Conductor' : '🎒 Pasajero';
  const roleCls   = isDriver ? 'role-driver' : 'role-passenger';

  setScreen(`
    <div class="screen">
      <div class="home-greeting">
        <div class="home-greeting-text">
          <div class="home-greeting-hello">Hola de nuevo,</div>
          <div class="home-greeting-name">${firstName}</div>
          <div class="home-greeting-role ${roleCls}">${roleLabel}</div>
        </div>
        ${isDriver ? `<button class="home-publish-btn" id="quick-publish" title="Publicar viaje">+</button>` : ''}
      </div>
      <div class="scroll">
        <div class="scroll-pad" id="home-content">
          <div class="quick-actions">
            <div class="quick-action" id="qa-find">
              <div class="quick-action-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="#4da6ff" stroke-width="2.2"/>
                  <path d="M16.5 16.5L21 21" stroke="#4da6ff" stroke-width="2.2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="quick-action-label">Buscar</div>
            </div>
            <div class="quick-action" id="qa-map">
              <div class="quick-action-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M9 4L3 7v13l6-3 6 3 6-3V4l-6 3-6-3z" stroke="#4ecdc4" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M9 4v13M15 7v13" stroke="#4ecdc4" stroke-width="2"/>
                </svg>
              </div>
              <div class="quick-action-label">Mapa</div>
            </div>
            <div class="quick-action" id="qa-reserve">
              <div class="quick-action-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="#a78bfa" stroke-width="2"/>
                  <path d="M3 10h18M8 3v4M16 3v4" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/>
                  <path d="M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2" stroke="#a78bfa" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="quick-action-label">Reservar</div>
            </div>
            <div class="quick-action" id="qa-history">
              <div class="quick-action-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2" width="14" height="20" rx="2" stroke="#fb923c" stroke-width="2"/>
                  <path d="M9 7h6M9 11h6M9 15h4" stroke="#fb923c" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M8 2v3M16 2v3" stroke="#fb923c" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="quick-action-label">Historial</div>
            </div>
          </div>
          <div class="section-header">
            <div class="section-title">Viajes disponibles</div>
          </div>
          <div id="home-list">${skeletonHtml(3)}</div>
        </div>
      </div>
    </div>`);

  document.querySelector('.quick-actions')?.addEventListener('click', e => {
    const action = e.target.closest('.quick-action');
    if (!action) return;
    const id = action.id;
    if (id === 'qa-find')    renderSearch();
    if (id === 'qa-map')     renderMap();
    if (id === 'qa-reserve') switchTab('myrides');
    if (id === 'qa-history') switchTab('myrides');
  });

  if (isDriver) {
    document.getElementById('quick-publish')?.addEventListener('click', () => {
      stopHomeListener();
      renderCreateRide(true);
    });
  }

  document.getElementById('home-list')?.addEventListener('click', e => {
    const card = e.target.closest('.ride-card');
    if (!card) return;
    stopHomeListener();
    renderDetail(card.dataset.id);
  });

  stopHomeListener();
  homeUnsub = listenAvailableRides(
    rides => {
      const list = document.getElementById('home-list');
      if (!list) { stopHomeListener(); return; }
      list.innerHTML = rides.length
        ? rides.map(r => rideCardHtml(r)).join('')
        : emptyHtml('🚗', 'Sin viajes disponibles', isDriver ? 'Sé el primero en publicar un viaje' : 'Vuelve más tarde');
    },
    () => {
      const list = document.getElementById('home-list');
      if (list) list.innerHTML = emptyHtml('⚠️', 'Error de conexión', 'Verifica tu conexión a internet');
    }
  );
}

// ══════════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════════
function renderSearch() {
  setScreen(`
    <div class="screen">
      <div class="page-hdr">
        <button class="page-hdr-back" id="search-back">←</button>
        <div class="page-hdr-titles">
          <div class="page-hdr-title">Buscar viaje</div>
        </div>
      </div>
      <div class="search-bar-wrap">
        <div class="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
            <circle cx="11" cy="11" r="7" stroke="var(--text3)" stroke-width="2"/>
            <path d="M16.5 16.5L21 21" stroke="var(--text3)" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input id="search-input" class="search-input" placeholder="Origen o destino…" autocomplete="off" autofocus/>
          <button id="search-clear" class="search-clear hidden">✕</button>
        </div>
      </div>
      <div class="scroll">
        <div class="scroll-pad" id="search-results">
          <div class="empty" style="padding-top:40px">
            <div class="empty-icon">🔍</div>
            <p class="empty-title">Busca un viaje</p>
            <p class="empty-sub">Escribe el origen o destino</p>
          </div>
        </div>
      </div>
    </div>`);

  document.getElementById('search-back').onclick = () => switchTab('home');

  let allRides = [];
  let unsub = null;

  unsub = listenAvailableRides(rides => { allRides = rides; }, () => {});

  const input   = document.getElementById('search-input');
  const clear   = document.getElementById('search-clear');
  const results = document.getElementById('search-results');

  results.addEventListener('click', e => {
    const card = e.target.closest('.ride-card');
    if (!card) return;
    if (unsub) unsub();
    renderDetail(card.dataset.id, 'home');
  });

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    clear.classList.toggle('hidden', q.length === 0);

    if (!q) {
      results.innerHTML = `<div class="empty" style="padding-top:40px">
        <div class="empty-icon">🔍</div>
        <p class="empty-title">Busca un viaje</p>
        <p class="empty-sub">Escribe el origen o destino</p>
      </div>`;
      return;
    }

    const filtered = allRides.filter(r =>
      r.origin?.toLowerCase().includes(q) ||
      r.destination?.toLowerCase().includes(q)
    );

    results.innerHTML = filtered.length
      ? filtered.map(r => rideCardHtml(r)).join('')
      : emptyHtml('😕', 'Sin resultados', `No hay viajes con "${input.value.trim()}"`);
  });

  clear.addEventListener('click', () => {
    input.value = '';
    input.focus();
    clear.classList.add('hidden');
    results.innerHTML = `<div class="empty" style="padding-top:40px">
      <div class="empty-icon">🔍</div>
      <p class="empty-title">Busca un viaje</p>
      <p class="empty-sub">Escribe el origen o destino</p>
    </div>`;
  });

  document._searchUnsub = () => { if (unsub) { unsub(); unsub = null; } };
}

// ══════════════════════════════════════════════
//  MAP
// ══════════════════════════════════════════════
function renderMap() {
  const LAT = 3.3696;
  const LNG = -76.5322;
  const embedUrl = `https://maps.google.com/maps?q=${LAT},${LNG}&z=15&output=embed`;

  setScreen(`
    <div class="screen">
      <div class="page-hdr">
        <button class="page-hdr-back" id="map-back">←</button>
        <div class="page-hdr-titles">
          <div class="page-hdr-title">Mapa</div>
          <div class="page-hdr-sub">Pontificia Universidad Javeriana Cali</div>
        </div>
      </div>
      <div class="map-container">
        <iframe
          src="${embedUrl}"
          class="map-iframe"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
      <div class="map-info">
        <div class="map-info-row">
          <span class="map-pin-icon">📍</span>
          <div>
            <div class="map-info-title">PUJ Cali — Punto de referencia</div>
            <div class="map-info-sub">Cra. 118 #18-250, Pance, Cali</div>
          </div>
        </div>
      </div>
    </div>`);

  document.getElementById('map-back').onclick = () => switchTab('home');
}

// ══════════════════════════════════════════════
//  RIDE DETAIL
// ══════════════════════════════════════════════
async function renderDetail(rideId, fromTab) {
  const prevTab = fromTab || activeTab;

  setScreen(`
    <div class="screen">
      <div class="page-hdr">
        <button class="page-hdr-back" id="detail-back">←</button>
        <div class="page-hdr-titles">
          <div class="page-hdr-title">Detalle del viaje</div>
        </div>
      </div>
      <div class="scroll">
        <div class="scroll-pad" id="detail-body">${loaderHtml()}</div>
      </div>
    </div>`);

  document.getElementById('detail-back').onclick = () => switchTab(prevTab);
  await loadDetailBody(rideId);
}

async function loadDetailBody(rideId) {
  const body = document.getElementById('detail-body');
  if (!body) return;
  try {
    const ride = await getRideById(rideId);
    if (!ride) { body.innerHTML = emptyHtml('😕', 'Viaje no encontrado'); return; }

    const uid          = currentUser?.uid;
    const isDriver     = ride.createdBy === uid;
    const isPassenger  = ride.passengers.includes(uid);
    const canBook      = !isDriver && !isPassenger && ride.status === 'pending' && ride.availableSeats > 0;
    const canCancelRes = isPassenger && ['pending', 'accepted'].includes(ride.status);
    const canComplete  = isDriver && ['pending', 'accepted'].includes(ride.status);
    const canCancelD   = isDriver && ['pending', 'accepted'].includes(ride.status);
    const pct          = ride.seats > 0 ? Math.round((ride.seats - ride.availableSeats) / ride.seats * 100) : 0;
    const priceF       = Number(ride.price).toLocaleString('es-CO');

    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        ${badgeHtml(ride.status)}
        ${isDriver    ? `<span class="badge" style="background:rgba(29,204,112,0.12);color:var(--accent)">Tu viaje</span>` : ''}
        ${isPassenger ? `<span class="badge" style="background:rgba(10,132,255,0.12);color:var(--blue)">Reservado ✓</span>` : ''}
      </div>

      <div class="detail-hero">
        <div class="route-line-wrap" style="padding-top:6px">
          <div class="rdot rdot-o"></div>
          <div class="rline"></div>
          <div class="rdot rdot-d"></div>
        </div>
        <div class="detail-route">
          <div class="detail-city">${ride.origin}</div>
          <div style="height:22px"></div>
          <div class="detail-city">${ride.destination}</div>
        </div>
        <div class="detail-price-block">
          <div class="detail-price">$${priceF}</div>
          <div class="detail-price-lbl">por cupo</div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-section-title">Información del viaje</div>
        <div class="info-row">
          <span class="info-row-icon">📅</span>
          <span class="info-row-label">Fecha</span>
          <span class="info-row-val">${formatDate(ride.date)}</span>
        </div>
        <div class="info-row">
          <span class="info-row-icon">🕐</span>
          <span class="info-row-label">Hora de salida</span>
          <span class="info-row-val">${ride.time}</span>
        </div>
        <div class="info-row">
          <span class="info-row-icon">💺</span>
          <span class="info-row-label">Cupos totales</span>
          <span class="info-row-val">${ride.seats}</span>
        </div>
        <div class="info-row">
          <span class="info-row-icon">✅</span>
          <span class="info-row-label">Cupos disponibles</span>
          <span class="info-row-val" style="color:${ride.availableSeats > 0 ? 'var(--accent)' : 'var(--danger)'}">${ride.availableSeats}</span>
        </div>
      </div>

      <div class="info-section">
        <div class="info-section-title">Ocupación</div>
        <div class="occ-bar-wrap">
          <div class="occ-bar"><div class="occ-bar-fill" style="width:${pct}%"></div></div>
          <div class="occ-text">${ride.seats - ride.availableSeats} de ${ride.seats} cupos ocupados (${pct}%)</div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-section-title">Conductor</div>
        <div class="driver-card">
          <div class="avatar">${(ride.driverName || '?')[0].toUpperCase()}</div>
          <div>
            <div class="driver-name">${ride.driverName}</div>
            <div class="driver-email">${ride.driverEmail}</div>
          </div>
        </div>
      </div>

      ${ride.description ? `
      <div class="info-section">
        <div class="info-section-title">Descripción</div>
        <div style="padding:14px 16px;font-size:14px;color:var(--text2);line-height:1.7">${ride.description}</div>
      </div>` : ''}

      <div class="action-area" id="ride-actions">
        ${canBook      ? `<button id="btn-book"     class="btn btn-primary">Reservar cupo</button>` : ''}
        ${canCancelRes ? `<button id="btn-canc-r"   class="btn btn-danger">Cancelar mi reserva</button>` : ''}
        ${canComplete  ? `<button id="btn-complete" class="btn btn-secondary">Marcar como completado ✅</button>` : ''}
        ${canCancelD   ? `<button id="btn-canc-d"   class="btn btn-danger">Cancelar este viaje</button>` : ''}
        ${isPassenger && ride.status === 'completed' ? `
        <div style="text-align:center;padding:12px;color:var(--accent);font-weight:700;font-size:15px">
          ✅ Viaje completado
        </div>` : ''}
        ${!canBook && !canCancelRes && !canComplete && !canCancelD && !isPassenger && ride.status !== 'pending' ? `
        <div style="text-align:center;padding:12px;color:var(--text3);font-size:14px">
          Este viaje ya no está disponible
        </div>` : ''}
      </div>`;

    const act = (fn, successMsg, confirmTitle, confirmSub, icon = '') => {
      if (confirmTitle) {
        showModal({
          icon,
          title: confirmTitle,
          subtitle: confirmSub || '',
          actions: [
            { label: 'Cancelar',  cls: 'btn-ghost',  onPress: () => {} },
            { label: 'Confirmar', cls: 'btn-primary', onPress: async () => {
              try { await fn(); toast(successMsg, 'success'); await loadDetailBody(rideId); }
              catch (e) { toast(e.message, 'error'); }
            }},
          ],
        });
      } else {
        fn().then(() => { toast(successMsg, 'success'); loadDetailBody(rideId); })
            .catch(e => toast(e.message, 'error'));
      }
    };

    document.getElementById('btn-book')?.addEventListener('click', () =>
      act(() => bookRide(rideId, uid),
        '¡Cupo reservado! 🎉',
        '¿Confirmar reserva?',
        `${ride.origin} → ${ride.destination}  ·  $${priceF}`, '🚗'));

    document.getElementById('btn-canc-r')?.addEventListener('click', () =>
      act(() => cancelBooking(rideId, uid),
        'Reserva cancelada',
        '¿Cancelar tu reserva?',
        'Tu cupo quedará disponible para otros pasajeros.', '⚠️'));

    document.getElementById('btn-complete')?.addEventListener('click', () =>
      act(() => completeRide(rideId, uid),
        'Viaje completado ✅',
        '¿Marcar como completado?',
        'Esta acción no se puede deshacer.', '✅'));

    document.getElementById('btn-canc-d')?.addEventListener('click', () =>
      act(() => cancelRide(rideId, uid),
        'Viaje cancelado',
        '¿Cancelar el viaje?',
        'Se cancelará para todos los pasajeros registrados.', '🚫'));

  } catch (e) {
    body.innerHTML = emptyHtml('😕', 'Error al cargar el viaje', 'Intenta de nuevo');
    console.error(e);
  }
}

// ══════════════════════════════════════════════
//  CREATE RIDE (conductor)
// ══════════════════════════════════════════════
function renderCreateRide(fromQuickBtn = false) {
  const today = new Date().toISOString().split('T')[0];

  setScreen(`
    <div class="screen">
      <div class="page-hdr">
        <button class="page-hdr-back" id="create-back">←</button>
        <div class="page-hdr-titles">
          <div class="page-hdr-title">Publicar viaje</div>
          <div class="page-hdr-sub">Como conductor</div>
        </div>
      </div>
      <div class="scroll">
        <div class="scroll-pad">

          <div class="section-label">Ruta</div>
          <div class="create-route">
            <div class="create-route-dots">
              <div class="rdot rdot-o"></div>
              <div class="rline"></div>
              <div class="rdot rdot-d"></div>
            </div>
            <div class="create-route-inputs">
              <input id="c-origin" class="field-input" placeholder="Origen  ·  ¿Desde dónde?"/>
              <input id="c-dest"   class="field-input" placeholder="Destino  ·  ¿Hacia dónde?"/>
            </div>
          </div>

          <div class="section-label">Fecha y hora</div>
          <div class="two-col">
            <div class="field">
              <label class="field-label">Fecha</label>
              <input id="c-date" class="field-input" type="date" min="${today}"/>
            </div>
            <div class="field">
              <label class="field-label">Hora</label>
              <input id="c-time" class="field-input" type="time"/>
            </div>
          </div>

          <div class="section-label">Precio y cupos</div>
          <div class="two-col">
            <div class="field">
              <label class="field-label">Precio (COP)</label>
              <input id="c-price" class="field-input" type="number" placeholder="5000" min="0"/>
            </div>
            <div class="field">
              <label class="field-label">Cupos</label>
              <input id="c-seats" class="field-input" type="number" placeholder="1" min="1" max="8" value="1"/>
            </div>
          </div>

          <div class="section-label">Descripción <span style="font-weight:400;text-transform:none;letter-spacing:0">(opcional)</span></div>
          <div class="field">
            <textarea id="c-desc" class="field-input" rows="3" placeholder="Punto de encuentro, modelo del carro, observaciones…"></textarea>
          </div>

          <button id="c-publish-btn" class="btn btn-primary mt-8">Publicar viaje 🚗</button>
        </div>
      </div>
    </div>`);

  document.getElementById('create-back').onclick = () => switchTab(fromQuickBtn ? 'home' : 'publish');

  document.getElementById('c-publish-btn').onclick = async () => {
    const btn    = document.getElementById('c-publish-btn');
    const origin = document.getElementById('c-origin').value.trim();
    const dest   = document.getElementById('c-dest').value.trim();
    const date   = document.getElementById('c-date').value;
    const time   = document.getElementById('c-time').value;
    const price  = parseFloat(document.getElementById('c-price').value);
    const seats  = parseInt(document.getElementById('c-seats').value);
    const desc   = document.getElementById('c-desc').value.trim();

    if (!origin || !dest)     { toast('Ingresa origen y destino', 'error'); return; }
    if (!date)                { toast('Selecciona una fecha', 'error'); return; }
    if (!time)                { toast('Selecciona una hora', 'error'); return; }
    if (!price || price <= 0) { toast('Ingresa un precio válido', 'error'); return; }
    if (!seats || seats < 1)  { toast('Mínimo 1 cupo', 'error'); return; }

    btnLoad(btn, true);
    try {
      await createRide(currentUser, { origin, destination: dest, date, time, price, seats, description: desc || undefined });
      showModal({
        icon: '🚗',
        title: '¡Viaje publicado!',
        subtitle: `Tu viaje de ${origin} → ${dest} ya está visible para los pasajeros.`,
        actions: [{ label: 'Ver inicio', cls: 'btn-primary', onPress: () => switchTab('home') }],
      });
    } catch (e) {
      toast(e.message || 'Error al publicar', 'error');
      btnLoad(btn, false);
    }
  };
}

// ══════════════════════════════════════════════
//  MY RIDES
// ══════════════════════════════════════════════
async function renderMyRides() {
  const isDriver = ['driver', 'admin'].includes(currentUser?.role);
  if (!isDriver) myRidesMode = 'passenger';

  setScreen(`
    <div class="screen">
      <div class="page-hdr">
        <button class="page-hdr-back" id="myrides-back">←</button>
        <div class="page-hdr-titles">
          <div class="page-hdr-title">Mis viajes</div>
        </div>
      </div>
      ${isDriver ? `
      <div class="inner-tabs">
        <button class="inner-tab ${myRidesMode === 'driver' ? 'active' : ''}" id="tab-driver">🚗 Como conductor</button>
        <button class="inner-tab ${myRidesMode === 'passenger' ? 'active' : ''}" id="tab-pax">🎒 Como pasajero</button>
      </div>` : ''}
      <div class="scroll">
        <div class="scroll-pad" id="my-list">${skeletonHtml(2)}</div>
      </div>
    </div>`);

  document.getElementById('myrides-back').onclick = () => switchTab('home');

  if (isDriver) {
    document.getElementById('tab-driver').onclick = () => { myRidesMode = 'driver';    renderMyRides(); };
    document.getElementById('tab-pax').onclick    = () => { myRidesMode = 'passenger'; renderMyRides(); };
  }

  try {
    const uid   = currentUser.uid;
    const rides = myRidesMode === 'driver'
      ? await getMyRides(uid)
      : await getMyBookings(uid);

    const list = document.getElementById('my-list');
    if (!list) return;

    if (!rides.length) {
      list.innerHTML = myRidesMode === 'driver'
        ? emptyHtml('🚗', 'Sin viajes publicados', 'Publica tu primer viaje desde la pestaña +')
        : emptyHtml('🎒', 'Sin reservas', 'Busca viajes disponibles en Inicio');
    } else {
      list.innerHTML = rides.map(r => rideCardHtml(r, myRidesMode === 'driver')).join('');
      list.querySelectorAll('.ride-card').forEach(c => {
        c.onclick = () => renderDetail(c.dataset.id, 'myrides');
      });
    }
  } catch (e) {
    toast('Error al cargar viajes', 'error');
    console.error(e);
  }
}

// ══════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════
function renderProfile() {
  const u         = currentUser;
  const roleLabel = { passenger: 'Pasajero', driver: 'Conductor', admin: 'Administrador' };
  const roleIcon  = { passenger: '🎒', driver: '🚗', admin: '⚙️' };
  const roleCls   = u.role === 'driver' ? 'role-driver' : 'role-passenger';

  setScreen(`
    <div class="screen">
      <div class="page-hdr">
        <button class="page-hdr-back" id="profile-back">←</button>
        <div class="page-hdr-titles">
          <div class="page-hdr-title">Mi perfil</div>
        </div>
      </div>
      <div class="scroll">
        <div class="scroll-pad">

          <div class="profile-hero">
            <div class="profile-avatar">${u.name?.[0]?.toUpperCase() || '?'}</div>
            <div>
              <div class="profile-name">${u.name}</div>
              <div class="profile-email">${u.email}</div>
              <div class="profile-role-badge ${roleCls}">${roleIcon[u.role]} ${roleLabel[u.role]}</div>
            </div>
          </div>

          ${u.role !== 'admin' ? `
          <div class="section-label">Cambiar rol</div>
          <div class="role-toggle-wrap" style="margin-bottom:20px">
            <button class="role-opt ${u.role === 'passenger' ? 'selected' : ''}" data-role="passenger" type="button">
              <span class="role-opt-icon">🎒</span>
              <span class="role-opt-title">Pasajero</span>
              <span class="role-opt-desc">Reserva cupos en viajes</span>
              <span class="role-opt-check">✓</span>
            </button>
            <button class="role-opt ${u.role === 'driver' ? 'selected' : ''}" data-role="driver" type="button">
              <span class="role-opt-icon">🚗</span>
              <span class="role-opt-title">Conductor</span>
              <span class="role-opt-desc">Publica y gestiona viajes</span>
              <span class="role-opt-check">✓</span>
            </button>
          </div>` : ''}

          <div class="section-label">Preferencias</div>
          <div class="settings-section" style="margin-bottom:20px">
            <div class="toggle-row">
              <span class="settings-row-icon">🌙</span>
              <span class="settings-row-label" style="flex:1;font-size:15px;font-weight:500">Modo oscuro</span>
              <label class="toggle-switch">
                <input type="checkbox" id="dark-mode-chk" ${isDark() ? 'checked' : ''}/>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="section-label">Cuenta</div>
          <div class="settings-section" style="margin-bottom:20px">
            <div class="settings-row">
              <span class="settings-row-icon">✉️</span>
              <span class="settings-row-label">Correo</span>
              <span class="settings-row-val">${u.email}</span>
            </div>
            <div class="settings-row">
              <span class="settings-row-icon">🛡️</span>
              <span class="settings-row-label">Rol actual</span>
              <span class="settings-row-val">${roleLabel[u.role]}</span>
            </div>
            <div class="settings-row">
              <span class="settings-row-icon">🔑</span>
              <span class="settings-row-label">ID de usuario</span>
              <span class="settings-row-val" style="font-size:12px">${u.uid.substring(0, 16)}…</span>
            </div>
          </div>

          <button id="signout-btn" class="btn btn-danger">Cerrar sesión</button>
          <p class="version mt-16">JaveCupos · PUJ Cali · v4.0</p>
        </div>
      </div>
    </div>`);

  const darkChk = document.getElementById('dark-mode-chk');
  if (darkChk) {
    darkChk.onchange = () => toggleDarkMode(darkChk.checked);
  }

  document.getElementById('profile-back').onclick = () => switchTab('home');

  document.querySelectorAll('.role-opt[data-role]').forEach(card => {
    card.onclick = async () => {
      const newRole = card.dataset.role;
      if (newRole === currentUser.role) return;
      try {
        await updateRole(currentUser.uid, newRole);
        toast(`Cambiado a ${roleLabel[newRole]} ${roleIcon[newRole]}`, 'success');
        mountApp();
      } catch (e) { toast(e.message, 'error'); }
    };
  });

  document.getElementById('signout-btn').onclick = () => {
    showModal({
      icon: '👋',
      title: '¿Cerrar sesión?',
      subtitle: 'Tendrás que iniciar sesión de nuevo para usar JaveCupos.',
      actions: [
        { label: 'Cancelar',      cls: 'btn-ghost',  onPress: () => {} },
        { label: 'Cerrar sesión', cls: 'btn-danger', onPress: async () => {
          stopHomeListener();
          await signOut();
          toast('Sesión cerrada', 'info');
          mountAuth('login');
        }},
      ],
    });
  };
}