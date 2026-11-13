// Utilidades generales: fechas, escalado de cantidades y formato.

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(isoDate) {
  const today = new Date(todayISO());
  const target = new Date(isoDate);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function expiryStatus(isoDate) {
  const days = daysUntil(isoDate);
  if (days < 0) return { level: "caducado", label: "Caducado", days };
  if (days <= 2) return { level: "urgente", label: days === 0 ? "Caduca hoy" : `Caduca en ${days}d`, days };
  if (days <= 5) return { level: "pronto", label: `Caduca en ${days}d`, days };
  return { level: "ok", label: `Caduca en ${days}d`, days };
}

export function scaleQuantity(baseQuantity, baseServings, targetServings) {
  if (!baseServings) return baseQuantity;
  const scaled = (baseQuantity * targetServings) / baseServings;
  return Math.round(scaled * 100) / 100;
}

export function formatQuantity(quantity, unit) {
  const rounded = Math.round(quantity * 100) / 100;
  if (unit === "g" && rounded >= 1000) return `${(rounded / 1000).toFixed(2).replace(/\.00$/, "")} kg`;
  if (unit === "ml" && rounded >= 1000) return `${(rounded / 1000).toFixed(2).replace(/\.00$/, "")} l`;
  return `${rounded} ${unit}`;
}

export function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
