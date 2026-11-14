import { Type } from "typebox";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { fetchJson } from "./http.js";
import { MealsService } from "./service.js";
const shortText = Type.String({ minLength: 1, maxLength: 80 });
const dateText = Type.String({
  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
  description: "Calendar date in YYYY-MM-DD form."
});
const mealText = Type.String({ minLength: 1, maxLength: 40 });
const dishText = Type.String({ minLength: 1, maxLength: 160 });
const notes = Type.Optional(Type.String({ maxLength: 1e3 }));
const ingredients = Type.Optional(
  Type.Array(Type.String({ minLength: 1, maxLength: 80 }), { maxItems: 30 })
);
const limit = Type.Optional(Type.Integer({ minimum: 1, maximum: 20 }));
const storeLimit = Type.Optional(Type.Integer({ minimum: 1, maximum: 10 }));
const suggestedDay = Type.Object(
  {
    day: dateText,
    meal: mealText,
    dish: dishText,
    notes,
    ingredients
  },
  { additionalProperties: false }
);
const definitions = [
  {
    name: "get_meals",
    description: "Read the saved meal plan and any pending week suggestion for this agent. Does not change or send anything.",
    parameters: Type.Object({}, { additionalProperties: false }),
    run: (service, _params, scope) => service.getMeals(scope)
  },
  {
    name: "set_meal",
    description: "Save or replace one meal by date and meal name. Only call after the person talking confirms the change. Does not touch the grocery list.",
    parameters: Type.Object(
      { day: dateText, meal: mealText, dish: dishText, notes, ingredients },
      { additionalProperties: false }
    ),
    run: (service, params, scope) => service.setMeal(params, scope)
  },
  {
    name: "delete_meal",
    description: "Remove one saved meal by date and meal name. Only call after the person talking confirms the change.",
    parameters: Type.Object({ day: dateText, meal: mealText }, { additionalProperties: false }),
    run: (service, params, scope) => service.deleteMeal(params, scope)
  },
  {
    name: "get_grocery_list",
    description: "Read the saved grocery list for this agent. Does not change anything.",
    parameters: Type.Object({}, { additionalProperties: false }),
    run: (service, _params, scope) => service.getGrocery(scope)
  },
  {
    name: "add_grocery_item",
    description: "Add one grocery item, or update its quantity or notes if the same name is already saved. A direct request from the person talking is enough; ask first when suggesting an item.",
    parameters: Type.Object(
      { name: shortText, quantity: Type.Optional(Type.String({ maxLength: 80 })), notes: Type.Optional(Type.String({ maxLength: 500 })) },
      { additionalProperties: false }
    ),
    run: (service, params, scope) => service.addGrocery(params, scope)
  },
  {
    name: "remove_grocery_item",
    description: "Remove one grocery item by name, ignoring case. Only call after the person talking confirms the change.",
    parameters: Type.Object({ name: shortText }, { additionalProperties: false }),
    run: (service, params, scope) => service.removeGrocery(params, scope)
  },
  {
    name: "search_flyer_deals",
    description: "Search current public flyer listings for one grocery item. Needs a saved postal code; without one, returns configured:false and changes nothing. Store names filter the matches when set.",
    parameters: Type.Object({ item: shortText, limit }, { additionalProperties: false }),
    run: (service, params, scope) => service.searchFlyerDeals(params, scope)
  },
  {
    name: "check_flyer_watch",
    description: "Search flyers for the saved grocery list and upcoming meal ingredients, at most 12 unique items. Needs a saved postal code. Returns matches and an honest partial or unavailable note; does not watch in the background.",
    parameters: Type.Object({ limit: storeLimit }, { additionalProperties: false }),
    run: (service, params, scope) => service.checkFlyerWatch(params, scope)
  },
  {
    name: "get_meals_setup",
    description: "Read flyer setup for this agent: whether a postal code is present (masked), the stores, and whether flyer search is available. Never returns the full postal code.",
    parameters: Type.Object({}, { additionalProperties: false }),
    run: (service, _params, scope) => service.getSetup(scope)
  },
  {
    name: "save_meals_setup",
    description: "Save flyer setup for this agent. Omit postalCode to keep it, pass null to clear it, or pass a postal code to replace it. stores replaces the list; an empty list clears it. timezone is an IANA name used for upcoming meals; null uses the gateway host clock. Output masks the postal code.",
    parameters: Type.Object(
      {
        postalCode: Type.Optional(Type.Union([Type.String({ maxLength: 10 }), Type.Null()])),
        stores: Type.Optional(Type.Array(Type.String({ maxLength: 60 }), { maxItems: 12 })),
        timezone: Type.Optional(Type.Union([Type.String({ maxLength: 80 }), Type.Null()]))
      },
      { additionalProperties: false }
    ),
    run: (service, params, scope) => service.saveSetup(params, scope)
  },
  {
    name: "save_week_suggestion",
    description: "Store a proposed week of meals after the person talking agrees to save it. This does not apply the meals to the plan, send a message, or post to a channel. Replaces the previous pending suggestion.",
    parameters: Type.Object(
      { days: Type.Array(suggestedDay, { minItems: 1, maxItems: 14 }), summary: Type.Optional(Type.String({ maxLength: 1e3 })) },
      { additionalProperties: false }
    ),
    run: (service, params, scope) => service.saveWeekSuggestion(params, scope)
  }
];
var index_default = definePluginEntry({
  id: "meals-planner",
  name: "Meals",
  description: "Agent-scoped meal plans, grocery lists, and optional flyer deal search; no channel delivery or background watch.",
  register(api) {
    api.registerTool(
      {
        contextVersion: 2,
        create(context) {
          if (!context.agentId) return null;
          const agentId = context.agentId;
          return definitions.map((definition) => ({
            name: definition.name,
            label: definition.name.replaceAll("_", " "),
            description: definition.description,
            parameters: definition.parameters,
            async execute(_id, params, signal) {
              context.assertInvocationCurrent();
              const service = new MealsService(
                fetchJson,
                api.runtime.state.openKeyedStoreV2(
                  { namespace: "meals-state", retention: "retained" },
                  { assertCurrent: context.assertInvocationCurrent }
                )
              );
              const result = await definition.run(service, params, {
                agentId,
                signal,
                assertCurrent: context.assertInvocationCurrent
              });
              context.assertInvocationCurrent();
              return { content: [{ type: "text", text: JSON.stringify(result) }], details: result };
            }
          }));
        }
      },
      { names: definitions.map((definition) => definition.name), workspaceAccess: false }
    );
  }
});
export {
  index_default as default
};
