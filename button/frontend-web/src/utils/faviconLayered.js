let _blinkTimer = null;
let _originalFavicon = null;

function ensureLink() {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  return link;
}

function setFaviconHref(href) {
  const link = ensureLink();
  link.href = href;
}

function saveOriginal() {
  if (_originalFavicon) return;
  const link = document.querySelector("link[rel~='icon']");
  _originalFavicon = link ? link.href : '/img/favicon.ico';
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function faviconWithFill({ overlayPath = '/img/overlay.png', fillColor = '#00c853', fillPercent = 1, size = 64 }) {
  const overlay = await loadImage(overlayPath).catch(() => null);

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  // background chassis
  ctx.clearRect(0, 0, size, size);
  const pad = Math.round(size * 0.08);
  const w = size - pad * 2;
  const h = size - pad * 2;
  const r = Math.round(size * 0.06);

  ctx.fillStyle = '#222';
  roundRect(ctx, pad, pad, w, h, r, true, false);

  // fill (from bottom)
  const innerPad = 2;
  const fillH = Math.max(0, Math.min(1, fillPercent)) * (h - innerPad * 2);
  const fillY = pad + (h - innerPad) - fillH;
  ctx.fillStyle = fillColor;
  roundRect(ctx, pad + innerPad, fillY, w - innerPad * 2, fillH, r / 1.5, true, false);

  // draw overlay PNG on top if available
  if (overlay) ctx.drawImage(overlay, 0, 0, size, size);

  return canvas.toDataURL('image/png');
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (r === undefined) r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

export function startFaviconBlink({ overlayPath = '/img/overlay.png', fillColor = '#ffd600', interval = 600 } = {}) {
  saveOriginal();
  if (_blinkTimer) return;
  let showAlt = false;
  _blinkTimer = setInterval(async () => {
    try {
      if (showAlt) {
        setFaviconHref(_originalFavicon);
      } else {
        const data = await faviconWithFill({ overlayPath, fillColor, fillPercent: 1 });
        setFaviconHref(data);
      }
      showAlt = !showAlt;
    } catch (e) {
      // ignore
    }
  }, interval);
}

export function stopFaviconBlink() {
  if (!_blinkTimer) return;
  clearInterval(_blinkTimer);
  _blinkTimer = null;
  if (_originalFavicon) setFaviconHref(_originalFavicon);
}

export async function setFaviconFillNow(opts) {
  const data = await faviconWithFill(opts).catch(() => null);
  if (data) setFaviconHref(data);
}
