const DATE = /^\d{4}-\d{2}-\d{2}$/;
const POSTAL = /^[A-Z0-9][A-Z0-9 -]{1,9}$/;
function isDate(value) {
  if (!DATE.test(value)) return false;
  const parsed = /* @__PURE__ */ new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
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
function normalizePostal(value) {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, " ");
  if (normalized.length < 3 || normalized.length > 10 || !POSTAL.test(normalized)) {
    throw new Error("Postal code should be 3 to 10 letters or digits, such as A1A 1A1.");
  }
  return normalized;
}
function maskPostal(value) {
  if (!value) return null;
  return value.length > 3 ? `${value.slice(0, 3)}***` : "***";
}
function normalizeName(value) {
  return value.trim().toLocaleLowerCase("en-CA");
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
function uniqueStrings(values, max, maxLength) {
  if (!values) return [];
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const value of values) {
    const clean = value.trim();
    if (!clean) continue;
    if (clean.length > maxLength) throw new Error(`Each entry must be ${maxLength} characters or fewer.`);
    const key = normalizeName(clean);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
    if (result.length > max) throw new Error(`At most ${max} entries are allowed.`);
  }
  return result;
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
  maskPostal,
  normalizeName,
  normalizePostal,
  optionalText,
  today,
  uniqueStrings
};
