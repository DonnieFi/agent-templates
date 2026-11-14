import { FLYER_ENDPOINT, flyerResult, flyerSearchUrl } from "./flyer.js";
import {
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
} from "./validate.js";
const MAX_MEALS = 100;
const MAX_GROCERY = 100;
const MAX_SUGGESTION_DAYS = 14;
const WATCH_ITEMS = 12;
const WATCH_CONCURRENCY = 4;
const WATCH_DEALS_PER_ITEM = 5;
const MAX_FETCH_BYTES = 2 * 1024 * 1024;
const SOURCE = "Flipp public flyer search";
function emptyState() {
  return {
    version: 1,
    setup: { postalCode: null, stores: [], updatedAt: null },
    meals: [],
    grocery: [],
    suggestion: null
  };
}
function record(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function normalizeState(value) {
  if (!record(value) || value.version !== 1) return emptyState();
  const setup = record(value.setup) ? value.setup : {};
  const meals = Array.isArray(value.meals) ? value.meals.filter(record).flatMap((meal) => {
    const day = asString(meal.day);
    const name = asString(meal.meal);
    const dish = asString(meal.dish);
    if (!isDate(day) || !name.trim() || !dish.trim()) return [];
    return [{
      day,
      meal: name,
      dish,
      notes: asString(meal.notes),
      ingredients: asStringArray(meal.ingredients, 30),
      updatedAt: asString(meal.updatedAt)
    }];
  }).slice(0, MAX_MEALS) : [];
  const grocery = Array.isArray(value.grocery) ? value.grocery.filter(record).flatMap((item) => {
    const name = asString(item.name);
    if (!name.trim()) return [];
    return [{
      name,
      quantity: typeof item.quantity === "string" ? item.quantity : null,
      notes: typeof item.notes === "string" ? item.notes : null,
      updatedAt: asString(item.updatedAt)
    }];
  }).slice(0, MAX_GROCERY) : [];
  const suggestion = record(value.suggestion) && Array.isArray(value.suggestion.days) ? {
    days: value.suggestion.days.filter(record).flatMap((entry2) => {
      const day = asString(entry2.day);
      const dish = asString(entry2.dish);
      if (!isDate(day) || !dish.trim()) return [];
      return [{
        day,
        meal: asString(entry2.meal, "dinner"),
        dish,
        notes: asString(entry2.notes),
        ingredients: asStringArray(entry2.ingredients, 30)
      }];
    }).slice(0, MAX_SUGGESTION_DAYS),
    summary: typeof value.suggestion.summary === "string" ? value.suggestion.summary : null,
    createdAt: asString(value.suggestion.createdAt)
  } : null;
  return {
    version: 1,
    setup: {
      postalCode: typeof setup.postalCode === "string" ? setup.postalCode : null,
      stores: asStringArray(setup.stores, 12),
      updatedAt: typeof setup.updatedAt === "string" ? setup.updatedAt : null
    },
    meals,
    grocery,
    suggestion: suggestion && suggestion.days.length ? suggestion : null
  };
}
function mealRank(meal) {
  const rank = ["breakfast", "lunch", "dinner", "snack"].indexOf(meal.toLocaleLowerCase("en-CA"));
  return rank === -1 ? 4 : rank;
}
function sortMeals(meals) {
  return [...meals].sort(
    (a, b) => a.day.localeCompare(b.day) || mealRank(a.meal) - mealRank(b.meal) || a.meal.localeCompare(b.meal)
  );
}
function sortGrocery(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "en-CA", { sensitivity: "base" }));
}
function setupSummary(setup) {
  return {
    postalCodeSet: Boolean(setup.postalCode),
    postalCodeHint: maskPostal(setup.postalCode),
    stores: [...setup.stores],
    storesSet: setup.stores.length > 0,
    flyerSearchAvailable: Boolean(setup.postalCode),
    note: setup.postalCode ? "Flyer search uses this postal code and the selected stores. It never posts or messages anyone." : "No postal code is saved. Meals, the grocery list, and week suggestions still work; flyer search needs a postal code."
  };
}
function entry(input) {
  if (!isDate(input.day)) throw new Error("day must be a real date in YYYY-MM-DD form.");
  return {
    day: input.day,
    meal: cleanText(input.meal, "meal", 40),
    dish: cleanText(input.dish, "dish", 160),
    notes: optionalText(input.notes, 1e3) ?? "",
    ingredients: uniqueStrings(input.ingredients, 30, 80)
  };
}
function errorMessage() {
  return "Flyer search is unavailable right now. The saved plan and list were not changed.";
}
async function mapLimit(items, limit, work) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (; ; ) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await work(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}
class MealsService {
  constructor(fetch, store, now = Date.now, endpoint = FLYER_ENDPOINT) {
    this.fetch = fetch;
    this.store = store;
    this.now = now;
    this.endpoint = endpoint;
  }
  fetch;
  store;
  now;
  endpoint;
  key(scope) {
    return `agent:${scope.agentId}`;
  }
  async load(scope) {
    const state = normalizeState(await this.store.lookup(this.key(scope)));
    scope.assertCurrent();
    return state;
  }
  async save(state, scope) {
    scope.assertCurrent();
    await this.store.register(this.key(scope), state, { assertCurrent: scope.assertCurrent });
    scope.assertCurrent();
  }
  async findDeals(item, state, limit, scope) {
    const postalCode = state.setup.postalCode;
    if (!postalCode) throw new Error("No postal code is saved.");
    const checkedAt = new Date(this.now()).toISOString();
    try {
      const payload = await this.fetch(flyerSearchUrl(this.endpoint, postalCode, item), {
        signal: scope.signal,
        maxBytes: MAX_FETCH_BYTES
      });
      scope.assertCurrent();
      return flyerResult(payload, { now: this.now(), stores: state.setup.stores, limit });
    } catch {
      scope.assertCurrent();
      return {
        source: SOURCE,
        checkedAt,
        deals: [],
        filteredByStores: [...state.setup.stores],
        error: errorMessage()
      };
    }
  }
  async getMeals(scope) {
    const state = await this.load(scope);
    return {
      meals: sortMeals(state.meals),
      pendingWeekSuggestion: state.suggestion,
      note: "Meals are stored for this agent. A saved week suggestion does not change the plan."
    };
  }
  async setMeal(input, scope) {
    const clean = entry({
      day: input.day,
      meal: input.meal,
      dish: input.dish,
      notes: input.notes,
      ingredients: input.ingredients
    });
    const state = await this.load(scope);
    const key = normalizeName(`${clean.day}|${clean.meal}`);
    const index = state.meals.findIndex((meal) => normalizeName(`${meal.day}|${meal.meal}`) === key);
    const saved = { ...clean, updatedAt: new Date(this.now()).toISOString() };
    if (index === -1) {
      if (state.meals.length >= MAX_MEALS) throw new Error(`The meal plan already has ${MAX_MEALS} meals. Delete one first.`);
      state.meals.push(saved);
    } else {
      state.meals[index] = saved;
    }
    await this.save(state, scope);
    return { saved: true, meal: saved, mealCount: state.meals.length };
  }
  async deleteMeal(input, scope) {
    if (!isDate(input.day)) throw new Error("day must be a real date in YYYY-MM-DD form.");
    const meal = cleanText(input.meal, "meal", 40);
    const state = await this.load(scope);
    const key = normalizeName(`${input.day}|${meal}`);
    const index = state.meals.findIndex((item) => normalizeName(`${item.day}|${item.meal}`) === key);
    if (index === -1) return { removed: false, note: "No saved meal matched that date and meal." };
    const [removed] = state.meals.splice(index, 1);
    await this.save(state, scope);
    return { removed: true, meal: removed, mealCount: state.meals.length };
  }
  async getGrocery(scope) {
    const state = await this.load(scope);
    return { items: sortGrocery(state.grocery), count: state.grocery.length };
  }
  async addGrocery(input, scope) {
    const name = cleanText(input.name, "name", 80);
    const state = await this.load(scope);
    const key = normalizeName(name);
    const index = state.grocery.findIndex((item2) => normalizeName(item2.name) === key);
    const updatedAt = new Date(this.now()).toISOString();
    if (index === -1) {
      if (state.grocery.length >= MAX_GROCERY) throw new Error(`The grocery list already has ${MAX_GROCERY} items. Remove one first.`);
      const item2 = {
        name,
        quantity: optionalText(input.quantity, 80),
        notes: optionalText(input.notes, 500),
        updatedAt
      };
      state.grocery.push(item2);
      await this.save(state, scope);
      return { saved: true, item: item2, count: state.grocery.length };
    }
    const existing = state.grocery[index];
    const item = {
      name,
      quantity: input.quantity === void 0 ? existing.quantity : optionalText(input.quantity, 80),
      notes: input.notes === void 0 ? existing.notes : optionalText(input.notes, 500),
      updatedAt
    };
    state.grocery[index] = item;
    await this.save(state, scope);
    return { saved: true, item, count: state.grocery.length, replaced: true };
  }
  async removeGrocery(input, scope) {
    const name = cleanText(input.name, "name", 80);
    const state = await this.load(scope);
    const key = normalizeName(name);
    const index = state.grocery.findIndex((item) => normalizeName(item.name) === key);
    if (index === -1) return { removed: false, note: "No grocery item matched that name." };
    const [removed] = state.grocery.splice(index, 1);
    await this.save(state, scope);
    return { removed: true, item: removed, count: state.grocery.length };
  }
  async saveWeekSuggestion(input, scope) {
    if (!Array.isArray(input.days) || input.days.length === 0) throw new Error("A week suggestion needs at least one day.");
    if (input.days.length > MAX_SUGGESTION_DAYS) throw new Error(`A week suggestion is at most ${MAX_SUGGESTION_DAYS} days.`);
    const byKey = /* @__PURE__ */ new Map();
    for (const raw of input.days) byKey.set(normalizeName(`${raw.day}|${raw.meal}`), entry(raw));
    const days = [...byKey.values()].sort(
      (a, b) => a.day.localeCompare(b.day) || mealRank(a.meal) - mealRank(b.meal)
    );
    const state = await this.load(scope);
    const suggestion = {
      days,
      summary: optionalText(input.summary, 1e3),
      createdAt: new Date(this.now()).toISOString()
    };
    const replaced = Boolean(state.suggestion);
    state.suggestion = suggestion;
    await this.save(state, scope);
    return { saved: true, suggestion, replacedPrevious: replaced };
  }
  async getSetup(scope) {
    const state = await this.load(scope);
    return setupSummary(state.setup);
  }
  async saveSetup(input, scope) {
    const state = await this.load(scope);
    if (input.postalCode !== void 0) {
      state.setup.postalCode = input.postalCode === null ? null : normalizePostal(input.postalCode);
    }
    if (input.stores !== void 0) state.setup.stores = uniqueStrings(input.stores, 12, 60);
    state.setup.updatedAt = new Date(this.now()).toISOString();
    await this.save(state, scope);
    return setupSummary(state.setup);
  }
  async searchFlyerDeals(input, scope) {
    const item = cleanText(input.item, "item", 80);
    const limit = input.limit ?? 8;
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error("limit must be between 1 and 20.");
    const state = await this.load(scope);
    if (!state.setup.postalCode) {
      return {
        configured: false,
        item,
        deals: [],
        note: "No postal code is saved, so flyer search is off. The meal plan and grocery list still work."
      };
    }
    const result = await this.findDeals(item, state, limit, scope);
    return { configured: true, item, ...result };
  }
  async checkFlyerWatch(input, scope) {
    const limit = input.limit ?? WATCH_DEALS_PER_ITEM;
    if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error("limit must be between 1 and 10.");
    const state = await this.load(scope);
    const current = today(this.now());
    const names = [
      ...state.grocery.map((item) => item.name),
      ...state.meals.filter((meal) => meal.day >= current).flatMap((meal) => meal.ingredients)
    ];
    const unique = /* @__PURE__ */ new Map();
    for (const name of names) {
      const key = normalizeName(name);
      if (key && !unique.has(key)) unique.set(key, name);
    }
    const all = [...unique.values()];
    const items = all.slice(0, WATCH_ITEMS);
    if (!state.setup.postalCode) {
      return {
        configured: false,
        checkedAt: new Date(this.now()).toISOString(),
        checked: 0,
        uniqueItemCount: all.length,
        truncated: all.length > WATCH_ITEMS,
        results: [],
        note: "No postal code is saved, so the flyer watch is off. The meal plan and grocery list still work."
      };
    }
    if (!items.length) {
      return {
        configured: true,
        checkedAt: new Date(this.now()).toISOString(),
        checked: 0,
        uniqueItemCount: 0,
        truncated: false,
        results: [],
        note: "There are no grocery items or upcoming meal ingredients to check."
      };
    }
    const results = await mapLimit(items, WATCH_CONCURRENCY, async (item) => ({
      item,
      ...await this.findDeals(item, state, limit, scope)
    }));
    return {
      configured: true,
      checkedAt: new Date(this.now()).toISOString(),
      checked: items.length,
      uniqueItemCount: all.length,
      truncated: all.length > items.length,
      results,
      note: all.length > items.length ? `Checked ${items.length} of ${all.length} unique items. Shorten the grocery list or remove past meals to cover the rest.` : "Flyer matches are current listings, not price guarantees. Confirm the price and dates in the store flyer."
    };
  }
}
export {
  MAX_GROCERY,
  MAX_MEALS,
  MAX_SUGGESTION_DAYS,
  MealsService,
  WATCH_CONCURRENCY,
  WATCH_DEALS_PER_ITEM,
  WATCH_ITEMS,
  emptyState,
  normalizeState
};
