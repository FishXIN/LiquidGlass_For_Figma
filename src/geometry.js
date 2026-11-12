export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function roundedDistance(x, y, w, h, r) {
  r = clamp(r, 0, Math.min(w, h) / 2);
  const qx = Math.abs(x - w / 2) - w / 2 + r;
  const qy = Math.abs(y - h / 2) - h / 2 + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
export function svgFromPNG(data, width, height) {
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(data)) throw new Error('Invalid PNG');
  if (![width, height].every(n => Number.isFinite(n) && n > 0 && n <= 8192)) throw new Error('Invalid dimensions');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  <title>LiquidGlass_For_Figma — static glass snapshot</title>\n  <desc>Background and glass are baked into an embedded PNG. No external assets or live filters.</desc>\n  <image width="${width}" height="${height}" xlink:href="${data}"/>\n</svg>`;
}
