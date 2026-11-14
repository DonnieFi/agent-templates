---
name: meals-week-planning
description: Plan a week of dinners, keep an agent-scoped grocery list, and check optional flyer deals with the Meals native plugin.
---

# Meals with the Meals plugin

Use for meal plans, grocery lists, week suggestions, and optional flyer checks.
This skill uses the eleven native `meals-planner` plugin tools. It does not use a recipe
API, a channel, a calendar, or a background watch.

## 1. Read before asking

1. Call `get_meals` to read the saved plan and any pending week suggestion.
2. Call `get_grocery_list` when the request involves shopping or what is on hand.
3. Call `get_meals_setup` before offering flyer search. It reports whether a
   postal code is present (masked) and which stores are set.
4. Reuse facts already in the conversation. Do not restart setup or re-ask a
   question the person already answered.

If a tool is missing, say which capability is unavailable. Do not claim a saved
plan, list, or flyer result without a tool result.

## 2. Setup, only when needed

Flyer search needs a postal code. Everything else works without one.

1. If `get_meals_setup` shows no postal code, offer it once:
   “Do you want flyer search? If so, what postal code should I use, and which
   stores should I watch? Both are optional.”
2. Save with `save_meals_setup({ postalCode, stores })` after the person answers.
   - Omit `postalCode` to keep the current one.
   - Pass `null` to clear it.
   - `stores` replaces the list; `[]` clears it.
3. Never read the full postal code back. Use the returned `postalCodeHint`.
4. Ask once which timezone upcoming meals should use. Save an IANA name with
   `save_meals_setup({ timezone })`, for example `America/Halifax`. Skip, or pass
   `null`, to use the gateway host's local date.
5. If they skip flyer setup, continue with the plan and list. Do not ask again
   in the same conversation.

There is no default postal code and no default store list. Do not invent either.

## 3. Meals

1. Resolve a weekday to a real `YYYY-MM-DD` date and say the date back. Example:
   “Monday, November 16” rather than only “Monday”.
2. Read the current plan first when the request could replace or contradict it.
3. Propose the dish and any ingredients. Ask for a yes before a meal write.
4. Call `set_meal({ day, meal, dish, notes, ingredients })` after confirmation.
   - `meal` is a label such as `dinner`, `lunch`, or `breakfast`.
   - `ingredients` is optional. Save the ingredients the person names so
     `check_flyer_watch` can use them.
   - The same date and meal name replaces the saved meal.
5. Call `delete_meal({ day, meal })` only after confirmation. If nothing matched,
   say so rather than claiming a deletion.
6. When `family_members` is visible and the meal is shared, ask a parent in chat
   before the change. That conversation is not an approval gate; the plugin still
   writes only after the person talking agrees.

## 4. Grocery list

1. A direct “add milk” or “remove bread” is confirmation. Call
   `add_grocery_item` or `remove_grocery_item` and report the result.
2. When suggesting an item, ask first.
3. `add_grocery_item({ name, quantity, notes })` updates an existing item by name.
   Omitted fields keep their old value; an empty string clears that field.
4. `remove_grocery_item({ name })` ignores case. If it returns `removed: false`,
   say no matching item was found.
5. Read the list back after a change only when it helps the next step, not as a
   substitute for a clear confirmation.

## 5. Flyers

### One item

Call `search_flyer_deals({ item, limit })`.

- `configured: false` means no postal code is saved. Mention that once; do not
  retry.
- Present each returned deal as merchant, item, price, and valid dates. Do not
  add a price, unit, coupon, or store that the tool did not return.
- No deals is a valid answer. Say no current listing matched; do not invent one.
- `error` means the public flyer service did not answer. Say the search is
  unavailable and keep helping with the plan and list.

### The list and planned ingredients

Call `check_flyer_watch({ limit })` when the person asks what is on sale or wants
the list checked.

- It covers the current grocery list and ingredients on saved meals that are not
  in the past, at most 12 unique items.
- Present matches grouped by item. Mention items with no match only when useful.
- If `truncated` is true, say how many unique items were checked and how many were
  left out.
- This is one check, not a standing watch. Do not promise notifications or a
  later automatic check.

## 6. A week suggestion

1. Gather what exists: `get_meals`, `get_grocery_list`, and (if setup allows)
   `check_flyer_watch`.
2. Propose a short week that uses the plan, the list, and any real flyer hits.
   Include a busy-night fallback such as leftovers.
3. Ask whether to save the suggestion. Do not call `save_week_suggestion` before
   a yes.
4. Call `save_week_suggestion({ days, summary })`. Each day has `day`, `meal`,
   `dish`, optional `notes`, and optional `ingredients`.
5. Tell the person it is saved as a suggestion. It does not change the plan and
   is not sent anywhere. `get_meals` returns it on a later turn.
6. If they then want it applied, confirm again and use `set_meal` for each meal.

## 7. Boundaries

- Do not ask about Discord, channels, routing, or delivery.
- Do not call `family_schedule` or another Family Pack tool from this skill.
  `family_members` is allowed only for the optional parent check above.
- Do not use a recipe API, order groceries, or start a standing sale watch.
- Do not put the postal code, meal plan, or grocery list into workspace files.
- If a tool fails with a permission error, explain that the concrete Meals tool
  needs a host grant. Do not request shell or wildcard access.
