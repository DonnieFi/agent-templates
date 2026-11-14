# Meals and Tutor verification

Observed 2026-11-14. This is an initial draft record, not a publication or a
production-readiness declaration.

## Qualified inputs

- OpenClaw CLI: `2026.11.3` (`17db247`).
- Node used for plugin tests: `26.13.0`.
- Template source: branch `feat/meals-tutor-v1`, based on the collection's
  `main` at the start of this work.
- Plugin source: sibling `openclaw-meals` and `openclaw-tutor` repositories,
  created locally for this v1. Both plugin commits are local; no remote or
  registry publication was performed.
- No live flyer request, live calendar call, Template Add, model conversation,
  or scheduler change is part of this proof.

The installed OpenClaw distribution did not include plugin-entry declaration
files, so the source modules were typechecked with a local declaration shim for
the `definePluginEntry` boundary. The shipped plugin is the esbuild output.

## Plugin tests

Both plugins use a fake keyed store and a clock; Meals uses a fictional flyer
fixture and Tutor uses a fictional calendar-item fixture. No network or host
state is touched.

### Meals

    npm install --ignore-scripts
    npm run build
    npm test

Observed: 11 tests passed, 0 failed. Cover:

- agent-scoped meal writes, replace-by-date-and-meal, and delete;
- ingredient bounds and impossible-date rejection;
- grocery upsert, omitted-field preservation, case-insensitive removal;
- setup masking, store dedupe, clearing, and no full postal code in output;
- flyer parsing, expired and future filtering, store filtering, and bounds;
- provider failure without echoing the postal code or request URL;
- watch coverage of the list and upcoming ingredients, past-meal exclusion,
  the 12-item bound, and missing setup;
- a saved week suggestion returned by `get_meals` without changing the plan;
- revoked invocation before a write;
- corrupt stored state reading as empty.

Plugin package: `openclaw-meals-plugin@0.1.0`.
Artifact SHA-256:
`7a6c27a84afdc1d418c1197c48e3a907d7654832d42c202225ca923de28f4fa6`.

### Tutor

    npm install --ignore-scripts
    npm run build
    npm test

Observed: 10 tests passed, 0 failed. Cover:

- calendar setup and the one-time missing-calendar reminder;
- topic upsert, agent scope, every-word search, previews, and input validation;
- hand-entered assessment replace-by-subject-and-title;
- calendar-item merge, `both` source, duplicate collapse, range filtering, and
  bad-date rejection;
- same-title, same-date assessments in different subjects staying separate,
  with a subject match merging and an ambiguous calendar item adding its own;
- a due guide built from saved notes, stored, and returned unchanged;
- calendar-only due guides and an empty-topic guide;
- no guide outside the two-day window;
- past guides not returned and no write on a revoked invocation;
- title-word topic matching when the subject differs.

Plugin package: `openclaw-tutor-plugin@0.1.0`.
Artifact SHA-256:
`132160ed6e734eca5b5dbed4f04b37b6337adf57c4d75a87b17434d21cf11fb8`.

## Template checks

Run from the collection root:

    openclaw templates validate ./templates/meals
    openclaw templates dev ./templates/meals
    openclaw templates inspect ./templates/meals
    openclaw templates build ./templates/meals --out ./dist/meals-0.1.0.tgz

    openclaw templates validate ./templates/tutor
    openclaw templates dev ./templates/tutor
    openclaw templates inspect ./templates/tutor
    openclaw templates build ./templates/tutor --out ./dist/tutor-0.1.0.tgz

Observed:

- Both projects validate as Template projects.
- `inspect` reports one agent, one skill, one bundled plugin, zero MCP servers,
  and zero automations for each.
- `dev` reports 11 actions, 3 capability escalations, and 0 blocked actions for
  each package.
- `build` reports 0 excluded project paths for each package.
- Archive contents include the pinned `dist/` JavaScript, plugin manifest,
  package metadata, skill, workspace rules, references, and example. They contain
  no `node_modules`, TypeScript source, or real household data.
- The template archives exclude the plugin test fixture and any tarball.

Template artifact integrity:

- `dist/meals-0.1.0.tgz`:
  `sha256:180b908f711f5e96d8f10cf34b360c58bd9f67d3b83ded716bee58de3e92c196`
- `dist/tutor-0.1.0.tgz`:
  `sha256:54083b17dbc2d2dc888d72c66a62034afebd9dad6e5213b5a24d195bab776bb1`

## Boundaries confirmed in the packages

- Neither template lists Family Pack under `requiresPlugins`.
- Neither `alsoAllow` list includes `family_members` or `family_schedule`.
- Meals has no Discord, channel, routing, delivery, recipe API, or background
  watch.
- Tutor has no calendar write, background scan, cron, automatic calendar
  creation, or separate guide-save tool.
- Meals masks the postal code in setup output and does not write it to workspace
  files.
- Tutor stores topics, dates, and guides in the plugin store, not workspace
  files.
- The Meals flyer fixture is fictional; the Tutor tests use no calendar.

## Incomplete

- A live flyer request against the public provider from a receiving host.
- A live `family_schedule` read and a real calendar with a test or quiz item.
- Template Add on a disposable Gateway, followed by a genuine model
  conversation through the installed agent.
- Receiving-host permission and tool-grant checks beyond offline preview.
- Family Pack installed alongside each template, with the optional parent check
  exercised in conversation.
- Provider coverage, terms, and price accuracy for flyer search.
- ClawHub publication and any community showcase post.
