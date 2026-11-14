# OpenClaw Meals plugin

Native, agent-scoped meal planning for OpenClaw. This plugin owns a meal plan, a
grocery list, optional flyer setup, and one pending week suggestion per agent.
It has no channel delivery, background watch, recipe API, or purchase path.

## Tools

- `get_meals` — read the saved plan and any pending week suggestion.
- `set_meal` — save or replace one meal by date and meal name.
- `delete_meal` — remove one saved meal.
- `get_grocery_list` — read the saved list.
- `add_grocery_item` — add an item or update its quantity and notes.
- `remove_grocery_item` — remove an item by name.
- `search_flyer_deals` — search current public flyer listings for one item.
- `check_flyer_watch` — search the grocery list and upcoming meal ingredients.
- `get_meals_setup` — read flyer setup; the postal code is masked.
- `save_meals_setup` — save or clear the postal code, store list, and IANA timezone.
- `save_week_suggestion` — store a proposed week without applying it.

Meals and grocery items are keyed by the host-supplied agent ID. A different agent
does not see them. The state lives in OpenClaw's plugin keyed store under the
`meals-state` namespace. No template file contains a real postal code, store list,
meal, or grocery item.

## Flyer search

Flyer search uses the public Flipp item search endpoint only when the agent has a
saved postal code. A store list filters by merchant name. There is no default
postal code and no default store list. Without a postal code, every other tool
still works and flyer tools return `configured: false` with a note.

`check_flyer_watch` is on demand. It checks at most 12 unique items drawn from the
current grocery list and ingredients on saved meals that are not in the past. Past
uses the saved IANA timezone when one is set, and the gateway host's local date
otherwise. It does not start a watch, poll in the background, or send a message.
Responses are bounded. An unavailable provider or a partial check is reported as
such. When the 12-item cap is hit, the remaining items are later meals and grocery
lines, not meals already in the past.

Flyer results are listings, not price guarantees. Availability, coverage, and
provider terms can change. The plugin does not bypass authentication or scrape a
logged-in account.

## Build and test

With Node 24.22.1 or newer:

    npm install --ignore-scripts
    npm run typecheck
    npm run build
    npm test

The tests use a fictional flyer fixture and a fake keyed store. They do not make
a live flyer request. The build is a self-contained ESM distribution; install the
npm artifact through OpenClaw so the host manages `typebox`.

## Privacy

A saved postal code is used only to construct the flyer search request. Tool
output masks it and errors do not include the request URL. The public flyer
provider receives the postal code as part of that request. The plugin does not
write workspace files, log the postal code, or share state between agents.

## Template hookup

The plugin id is `meals-planner`. The Meals template vendors a pinned build under
`plugins/meals/` and grants only the eleven tool names above plus workspace read.
The template does not declare
Family Pack as a requirement. A visible `family_members` tool can support a
conversational check with a parent, but the plugin does not implement an approval
gate.

## License

MIT
