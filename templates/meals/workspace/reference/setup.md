# Meals setup and operator notes

Meals uses the bundled native `meals-planner` plugin. The template stages the tested
build; it does not require Family Pack, a recipe API, Discord, or a background
job.

## Pinned build

- Package: `openclaw-meals-plugin@0.1.0`
- Plugin ID: `meals-planner`
- Artifact: `openclaw-meals-plugin-0.1.0.tgz`
- SHA-256: `dc23a28ddcf146bf5cd53d201531fe0361add1b99fcff860a79d41b8fb76ec18`
- Source: https://github.com/DonnieFi/openclaw-meals
- Source commit: `9db4684bea0bc5cae0a17fa8038e0fb7095e4e79`
- Staged path: `plugins/meals/` with compiled `dist/`, `package.json`,
  `openclaw.plugin.json`, `README.md`, and `LICENSE`

The template does not include `node_modules`. OpenClaw installs the declared
`typebox` dependency through its normal plugin path.

## State and tools

The plugin stores one record per host-supplied agent ID in the `meals-state`
keyed store. It contains the meal plan, grocery list, flyer setup, and one pending
week suggestion. A different agent does not see them.

The eleven tools are:

1. `get_meals`
2. `set_meal`
3. `delete_meal`
4. `get_grocery_list`
5. `add_grocery_item`
6. `remove_grocery_item`
7. `search_flyer_deals`
8. `check_flyer_watch`
9. `get_meals_setup`
10. `save_meals_setup`
11. `save_week_suggestion`

The template grants exactly those names plus workspace `read` under a minimal
tool profile, with `fs.workspaceOnly: true`.

## Setup behavior

`get_meals_setup` reports:

- whether a postal code is present,
- a masked hint such as `X0X***`,
- the configured stores and whether the list is set,
- the saved IANA timezone, and whether one is set,
- whether flyer search is available.

`save_meals_setup` accepts `postalCode`, `stores`, and `timezone`.

- Omit `postalCode` to keep it.
- Pass `null` to clear it.
- Pass a string to replace it.
- `stores` replaces the list; `[]` clears it.
- `timezone` is an IANA name such as `America/Halifax`. `null` clears it and
  upcoming meals use the gateway host's local date.

There is no default postal code, store list, or timezone. Setup can skip any of
them. Without a postal code, meals, the grocery list, and week suggestions still
work.

The full postal code is not returned by either setup tool and is not written to
a workspace file. The plugin uses it only to construct the flyer request; the
public flyer provider receives it as part of that request.

## Flyer behavior

`search_flyer_deals` uses the public Flipp item search endpoint when a postal
code is saved. `check_flyer_watch` makes the same on-demand search for the current
grocery list and ingredients on saved meals that are not in the past. "Not in
the past" uses the saved timezone, or the gateway host's local date when none
is saved. The check is bounded to 12 unique items, four concurrent requests,
and ten seconds per request. Items past that cap stay on the grocery list or
on later meals.

- Store names filter by merchant name, ignoring case and punctuation.
- Expired and not-yet-valid listings are removed.
- Results are listings, not price guarantees.
- An unavailable provider returns an honest error; the plan and list are not
  changed.
- No background watch, polling, notification, or message delivery exists.

No live flyer call is part of the package proof. The tests use a fictional
fixture. Flyer coverage, provider terms, and availability can change.

## Family Pack

Meals does not list Family Pack under `requiresPlugins`, and the template does
not include `family_members` or `family_schedule` in `alsoAllow`. If the host
separately grants `family_members`, the agent can ask a parent in chat before a
shared meal change. The plugin still owns the plan and list and does not run an
approval gate.

## Validate and build

From the source repository root:

    openclaw templates validate ./templates/meals
    openclaw templates dev ./templates/meals
    openclaw templates inspect ./templates/meals
    openclaw templates build ./templates/meals --out ./dist/meals-0.1.0.tgz

Plugin proof is run in the source repository
(https://github.com/DonnieFi/openclaw-meals):

    npm install --ignore-scripts
    npm run typecheck
    npm run build
    npm test

The tests do not install an agent, call a live flyer service, or change a host.
