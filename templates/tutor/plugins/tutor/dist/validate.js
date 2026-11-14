const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]?\d|2[0-3]):[0-5]\d(\s?[ap]m)?$/i;
function isDate(value) {
  if (!DATE.test(value)) return false;
  const parsed = /* @__PURE__ */ new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function isTime(value) {
  return TIME.test(value.trim());
}
function isTimeZone(value) {
  try {
    Intl.DateTimeFormat(void 0, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
function today(now, timeZone) {
  if (timeZone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date(now));
    const part = (type) => parts.find((entry) => entry.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}-${part("day")}`;
  }
  const date = new Date(now);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}
const MONTHS = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12
};
function resolveCalendarDate(value, todayIso) {
  const trimmed = value.trim();
  if (isDate(trimmed)) return trimmed;
  const withoutWeekday = trimmed.replace(/^(?:mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\.?,?\s+/i, "");
  const match = /^(?:(\d{1,2})\s+([A-Za-z]+)|([A-Za-z]+)\s+(\d{1,2}))(?:,?\s+(\d{4}))?$/.exec(withoutWeekday);
  if (!match) return null;
  const day = Number(match[1] ?? match[4]);
  const month = MONTHS[(match[2] ?? match[3]).toLowerCase()];
  if (!month || day < 1 || day > 31) return null;
  const explicitYear = match[5] ? Number(match[5]) : null;
  const baseYear = Number(todayIso.slice(0, 4));
  const years = explicitYear === null ? [baseYear - 1, baseYear, baseYear + 1] : [explicitYear];
  const candidates = years.flatMap((year) => {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return isDate(iso) ? [iso] : [];
  });
  if (!candidates.length) return null;
  if (explicitYear !== null) return candidates[0] ?? null;
  const todayMs = Date.parse(`${todayIso}T12:00:00Z`);
  const scored = candidates.map((iso) => ({ iso, delta: Date.parse(`${iso}T12:00:00Z`) - todayMs }));
  const inWindow = scored.filter((entry) => entry.delta >= -2 * 864e5 && entry.delta <= 14 * 864e5);
  const pool = inWindow.length ? inWindow : scored;
  pool.sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta) || a.delta - b.delta);
  return pool[0]?.iso ?? null;
}
function addDays(day, days) {
  const date = /* @__PURE__ */ new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
function weekday(day) {
  return new Intl.DateTimeFormat("en-CA", { weekday: "long", timeZone: "UTC" }).format(/* @__PURE__ */ new Date(`${day}T12:00:00Z`));
}
function cleanText(value, label, max) {
  const clean = value.trim();
  if (!clean) throw new Error(`${label} is required.`);
  if (clean.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return clean;
}
function optionalText(value, max) {
  if (value === void 0 || value === null) return null;
  const clean = value.trim();
  if (!clean) return null;
  if (clean.length > max) throw new Error(`Text must be ${max} characters or fewer.`);
  return clean;
}
function normalize(value) {
  return value.trim().toLocaleLowerCase("en-CA").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
function keyOf(...parts) {
  return parts.map(normalize).join("|");
}
function words(value) {
  return value.toLocaleLowerCase("en-CA").match(/[\p{L}\p{N}]+/gu) ?? [];
}
function asString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}
function asStringArray(value, max) {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === "string").slice(0, max) : [];
}
export {
  addDays,
  asString,
  asStringArray,
  cleanText,
  isDate,
  isTime,
  isTimeZone,
  keyOf,
  normalize,
  optionalText,
  resolveCalendarDate,
  today,
  weekday,
  words
};
