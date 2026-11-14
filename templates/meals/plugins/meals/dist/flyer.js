const FLYER_ENDPOINT = "https://backflipp.wishabi.com/flipp/items/search";
const FLYER_SOURCE = "Flipp public flyer search";
function flyerSearchUrl(endpoint, postalCode, item) {
  const url = new URL(endpoint);
  url.searchParams.set("locale", "en-ca");
  url.searchParams.set("postal_code", postalCode);
  url.searchParams.set("q", item);
  return url.toString();
}
function normalized(value) {
  return value.toLocaleLowerCase("en-CA").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
function storeMatches(merchant, stores) {
  if (!stores.length) return true;
  const haystack = ` ${normalized(merchant)} `;
  return stores.some((store) => {
    const needle = ` ${normalized(store)} `;
    return needle.trim().length > 0 && haystack.includes(needle);
  });
}
function price(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}
function iso(value) {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}
function parseFlyerDeals(payload, options) {
  if (!payload || typeof payload !== "object") return [];
  const items = payload.items;
  if (!Array.isArray(items)) return [];
  const seen = /* @__PURE__ */ new Set();
  const deals = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw;
    if (typeof item.name !== "string" || typeof item.merchant_name !== "string") continue;
    const name = item.name.trim();
    const merchant = item.merchant_name.trim();
    if (!name || !merchant) continue;
    if (!storeMatches(merchant, options.stores)) continue;
    const validFrom = iso(item.valid_from);
    const validTo = iso(item.valid_to);
    const fromMs = validFrom === null ? null : Date.parse(validFrom);
    const toMs = validTo === null ? null : Date.parse(validTo);
    if (options.now !== void 0) {
      if (fromMs !== null && fromMs > options.now) continue;
      if (toMs !== null && toMs < options.now) continue;
    }
    const current = price(item.current_price);
    const original = price(item.original_price);
    const key = `${normalized(merchant)}|${normalized(name)}|${current ?? "none"}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deals.push({ name, merchant, price: current, originalPrice: original, validFrom, validTo });
    if (deals.length >= options.limit) break;
  }
  return deals;
}
function flyerResult(payload, options) {
  return {
    source: FLYER_SOURCE,
    checkedAt: new Date(options.now).toISOString(),
    deals: parseFlyerDeals(payload, options),
    filteredByStores: [...options.stores]
  };
}
export {
  FLYER_ENDPOINT,
  FLYER_SOURCE,
  flyerResult,
  flyerSearchUrl,
  parseFlyerDeals,
  storeMatches
};
