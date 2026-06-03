// ── Toast ──────────────────────────────────────
export function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-dot"></span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.classList.add('show'), 0);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 350);
  }, 3000);
}

// ── Modal ──────────────────────────────────────
export function showModal({ icon = '', title, subtitle = '', actions = [] }) {
  let existing = document.getElementById('jv-modal');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'jv-modal';
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      ${icon ? `<div class="modal-icon">${icon}</div>` : ''}
      <div class="modal-title">${title}</div>
      ${subtitle ? `<div class="modal-sub">${subtitle}</div>` : ''}
      <div class="modal-actions">
        ${actions.map((a, i) => `<button class="btn ${a.cls || 'btn-secondary'}" data-idx="${i}">${a.label}</button>`).join('')}
      </div>
    </div>`;

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) { closeModal(); return; }
    const btn = e.target.closest('button[data-idx]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx);
    closeModal();
    setTimeout(() => actions[idx]?.onPress?.(), 50);
  });

  document.body.appendChild(backdrop);
  setTimeout(() => backdrop.classList.add('open'), 0);
}

export function closeModal() {
  const m = document.getElementById('jv-modal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(() => m?.remove(), 320);
}

// ── Button loading ─────────────────────────────
export function btnLoad(btn, on) {
  if (!btn) return;
  if (on) {
    btn._orig = btn.innerHTML;
    btn.innerHTML = `<span class="btn-spinner"></span>`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn._orig || '';
    btn.disabled = false;
  }
}

// ── Badge ──────────────────────────────────────
const STATUS_LABEL = {
  pending:   'Disponible',
  accepted:  'Lleno',
  completed: 'Completado',
  canceled:  'Cancelado',
};
export function badgeHtml(status) {
  return `<span class="badge badge-${status}">${STATUS_LABEL[status] || status}</span>`;
}

// ── Ride Card ─────────────────────────────────
export function rideCardHtml(ride, isDriver = false) {
  const pct     = ride.seats > 0 ? Math.round((ride.seats - ride.availableSeats) / ride.seats * 100) : 0;
  const subInfo = isDriver
    ? `👥 ${ride.passengers.length} pasajero${ride.passengers.length !== 1 ? 's' : ''}`
    : `🧑 ${ride.driverName?.split(' ')[0] || 'Conductor'}`;

  const priceFormatted = Number(ride.price).toLocaleString('es-CO');
  const dateStr = formatDate(ride.date);

  return `
    <div class="ride-card" data-id="${ride.id}">
      <div class="ride-card-head">
        ${badgeHtml(ride.status)}
        <div>
          <div class="ride-price-tag">$${priceFormatted}</div>
          <div class="ride-price-sub">por cupo</div>
        </div>
      </div>
      <div class="ride-route">
        <div class="route-line-wrap">
          <div class="rdot rdot-o"></div>
          <div class="rline"></div>
          <div class="rdot rdot-d"></div>
        </div>
        <div class="route-places">
          <div class="route-place">${ride.origin}</div>
          <div class="route-place">${ride.destination}</div>
        </div>
      </div>
      <div class="ride-meta">
        <span class="meta-chip">📅 ${dateStr}</span>
        <span class="meta-chip">🕐 ${ride.time}</span>
        <span class="meta-chip">${subInfo}</span>
      </div>
      <div class="seats-row">
        <div class="seats-bar"><div class="seats-fill" style="width:${pct}%"></div></div>
        <span class="seats-label">${ride.availableSeats} libre${ride.availableSeats !== 1 ? 's' : ''}</span>
      </div>
    </div>`;
}

// ── Skeleton cards ─────────────────────────────
export function skeletonHtml(n = 3) {
  return Array.from({ length: n }, () => `
    <div class="skeleton">
      <div class="sk sk-h sk-h-lg" style="width:40%;margin-bottom:18px"></div>
      <div class="sk sk-h" style="width:85%;margin-bottom:10px"></div>
      <div class="sk sk-h" style="width:65%;margin-bottom:18px"></div>
      <div class="sk sk-h" style="width:100%;height:4px;border-radius:99px"></div>
    </div>`).join('');
}

export function loaderHtml() {
  return `<div class="loader"><div class="spinner"></div></div>`;
}

export function emptyHtml(icon, title, sub = '') {
  return `<div class="empty">
    <span class="empty-icon">${icon}</span>
    <p class="empty-title">${title}</p>
    ${sub ? `<p class="empty-sub">${sub}</p>` : ''}
  </div>`;
}

// ── Date formatter ─────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
}