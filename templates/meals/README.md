# Meals

**Plan the week, not the whole life.** An OpenClaw meal-planning companion with a
conversational setup, an agent-scoped plan and grocery list, and optional flyer
deal checks. No recipe API, channel delivery, or background watch is required.

## What Meals includes

- **Conversational persona**: first-run flow for optional flyer setup, meal and
  list layouts, and clear confirmation rules.
- **Bundled meals skill** (`skills/meals`): coordinates setup, plan changes,
  grocery updates, one-item flyer search, an on-demand watch check, and a saved
  week suggestion.
- **Bundled native meals plugin** (`plugins/meals/`):
  `openclaw-meals-plugin@0.1.0`, providing the eleven tools listed below. The
  plugin owns its state; the template ships no meals, grocery items, postal codes,
  or store names.

## Native tools

- `get_meals`: read the saved plan and pending week suggestion.
- `set_meal` / `delete_meal`: change one meal by date and meal name.
- `get_grocery_list` / `add_grocery_item` / `remove_grocery_item`: read and
  change the list.
- `search_flyer_deals`: search current public flyer listings for one item.
- `check_flyer_watch`: on-demand check of the grocery list and upcoming meal
  ingredients, at most 12 unique items.
- `get_meals_setup` / `save_meals_setup`: read or change the optional postal code
  and store list. The full postal code is never returned.
- `save_week_suggestion`: store a proposed week without applying or sending it.

## First useful week

1. Add the Template with normal OpenClaw review and consent.
2. Start a conversation. Meals checks for its tools and reads any saved plan.
3. It asks only whether flyer search is wanted, then for a postal code and stores.
   Both can be skipped.
4. Ask “What's for dinner this week?”, “Add milk to the list,” or “What's on sale?”
5. Confirm a meal change before it is saved.

A saved week suggestion is returned by `get_meals` on a later turn. Nothing is
posted to a channel. Flyer results are current listings, not price guarantees.

## Boundaries

- No Spoonacular or other recipe API.
- No standing sale watch beyond the on-demand list and planned ingredients.
- No Discord delivery, routing, or channel setup questions.
- No Family Pack page, brief line, or schema change.
- Family Pack is optional. When `family_members` is visible, the agent can ask a
  parent in chat before a shared meal change; the plugin does not enforce an
  approval gate.

## Files

- `CLAW.md`: manifest frontmatter and personality (`SOUL.md`).
- `BOOTSTRAP.md`: first-run conversation.
- `workspace/AGENTS.md`: correctness, privacy, confirmation, and authority rules.
- `skills/meals/SKILL.md`: tool workflow.
- `plugins/meals/`: pinned native plugin build.
- `workspace/reference/setup.md`: operator notes and flyer behavior.
- `workspace/reference/acceptance.md`: test plan, not a passing report.
- `workspace/examples/week.md`: fictional example.
- `package.json`: package metadata.

## Validate

With a compatible OpenClaw CLI:

```bash
openclaw templates validate ./templates/meals
openclaw templates dev ./templates/meals
openclaw templates inspect ./templates/meals
openclaw templates build ./templates/meals --out ./dist/meals-0.1.0.tgz
```

Package validation does not install flyer access, prove a live model conversation,
or establish provider coverage. The README is also mapped into
`reference/package-readme.md` for the installed agent.

## Source

The plugin source is the sibling `openclaw-meals` repository. The template vendors
only the tested build: `openclaw-meals-plugin@0.1.0`, artifact SHA-256
`97fdcdca851a685dc70220476ca85db0acb5298531f154ef45a081ba025731f6`.

No private household records, real postal codes, store lists, raw conversations,
or machine-specific paths are included.
