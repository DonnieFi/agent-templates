# Meals acceptance scenarios

This is a test plan, not a passing test report. Plugin tests, Template validation,
and a real conversation are separate forms of evidence.

## 1. Setup

- **No setup yet**: `get_meals_setup` reports no postal code and no stores.
  Meals does not demand setup before helping with dinner.
- **Skip flyers**: The person declines both facts. The agent continues with the
  plan and list and does not ask again in the same conversation.
- **Postal code only**: A postal code is saved; the returned hint is masked and
  the full code is absent from tool output.
- **Stores only**: Stores are saved without a postal code. `flyerSearchAvailable`
  stays false and no flyer request is attempted.
- **Clear a field**: `postalCode: null` clears the code; `stores: []` clears the
  list.
- **No invention**: No default postal code, store list, or timezone appears anywhere.
- **Timezone**: A saved IANA timezone decides which meals are still upcoming for
  a flyer check. With none saved, that date is the gateway host's local date.
  An invalid name is rejected.

## 2. Meal plan

- **First meal**: A confirmed `set_meal` saves a date, meal label, dish, notes,
  and optional ingredients.
- **Replace**: The same date and meal name replaces the existing meal instead of
  adding a duplicate.
- **Delete**: A confirmed `delete_meal` removes the meal; a second delete reports
  no match rather than claiming success.
- **Weekday resolution**: “Monday” is resolved to a real date and the date is
  stated back before saving.
- **Unconfirmed change**: A proposal is not written until the person talking says
  yes.
- **Agent scope**: A different agent does not see the first agent's plan.

## 3. Grocery list

- **Direct add**: “Add milk” saves the item and reports it.
- **Update**: Adding the same name with a quantity keeps the old notes if notes
  are omitted.
- **Remove**: Removal ignores case; a missing item returns `removed: false`.
- **Bound**: The list reports a clear error at the 100-item cap rather than
  silently dropping an item.

## 4. Flyers

- **No postal code**: `search_flyer_deals` returns `configured: false`, and the
  agent mentions the missing setup once without retrying.
- **One item**: A match shows merchant, item, price, and validity dates returned
  by the tool.
- **Store filter**: Only matching merchants are returned.
- **Empty result**: A valid search with no match is reported as no current
  listing, not as a failure or an invented price.
- **Provider failure**: The tool returns a generic unavailable error and does not
  echo the request URL or postal code.
- **Watch coverage**: `check_flyer_watch` uses the current list and ingredients on
  meals that are not in the past.
- **Partial watch**: More than 12 unique items produces `truncated: true` with an
  honest checked count.
- **No background watch**: The agent does not promise a later automatic check,
  notification, or standing sale watch.

## 5. Week suggestion

- **Proposal**: The agent reads the plan, list, and any flyer hits before
  proposing a week.
- **Confirmation**: `save_week_suggestion` is called only after a yes.
- **Not applied**: The suggestion does not change the saved meal plan.
- **Returned later**: `get_meals` returns the pending suggestion.
- **Replacement**: A new suggestion replaces the old one and reports that it did.

## 6. Boundaries

- **No channel**: Nothing is posted; the agent does not ask about Discord,
  routing, or delivery.
- **No recipe API**: No Spoonacular or other external recipe call is offered.
- **Missing tools**: The agent says the Meals tools are unavailable and does not
  claim a save or search.
- **Family Pack absent**: The template remains useful without Family Pack.
- **Family Pack present**: A visible `family_members` tool can support a parent
  check in chat; it is not an approval gate.
