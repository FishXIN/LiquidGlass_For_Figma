export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function roundedDistance(x, y, w, h, r) {
  r = clamp(r, 0, Math.min(w, h) / 2);
  const qx = Math.abs(x - w / 2) - w / 2 + r;
  const qy = Math.abs(y - h / 2) - h / 2 + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
