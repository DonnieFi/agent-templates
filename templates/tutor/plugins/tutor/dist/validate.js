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
function today(now) {
  const date = new Date(now);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
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
  keyOf,
  normalize,
  optionalText,
  today,
  weekday,
  words
};
