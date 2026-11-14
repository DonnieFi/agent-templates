# Meals and Tutor verification

Observed 2026-11-14. This is an initial draft record, not a publication or a
production-readiness declaration.

## Qualified inputs

- OpenClaw CLI: `2026.11.3` (`17db247`).
- Node used for plugin tests: `26.13.0`.
- Template source: branch `feat/meals-tutor-v1`, based on the collection's
  `main` at the start of this work.
- Plugin source: [DonnieFi/openclaw-meals](https://github.com/DonnieFi/openclaw-meals)
  at `67ce23db4edce0af275deabe09e6248e438524ce`, and
  [DonnieFi/openclaw-tutor](https://github.com/DonnieFi/openclaw-tutor) at
  `a39fa6ff4cca228b55effb4469d7afc4e56f495f`. Both are public source
  repositories. No package-registry or ClawHub publication was performed.
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
Source: https://github.com/DonnieFi/openclaw-meals
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
Source: https://github.com/DonnieFi/openclaw-tutor
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
  `sha256:a53b46e9dce71e243b0b6721c6f4d26de1a214a1145c80f407ede7ef9e213c40`
- `dist/tutor-0.1.0.tgz`:
  `sha256:2e7ef54b541e130883ec1f85b18f97e03885ba8603bcfb53850b5c67825f766a`

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

## Review follow-up — 2026-11-14

Same CLI and Node as above. This pass supersedes the plugin source pins, plugin
artifact hashes, and template archive hashes recorded earlier on this page.
The earlier test counts described the first v1 build.

Plugin source:

- [DonnieFi/openclaw-meals](https://github.com/DonnieFi/openclaw-meals) at
  `9ad9cb0e090f47da9d96641ff0e62ac0fc8cf14e`. Plugin id `meals-planner`.
  Package `openclaw-meals-plugin@0.1.0`. Artifact SHA-256
  `529571bd0d102e0d251f68132be5a426bf8134fd19b02ee1add0e0054a1d0558`.
- [DonnieFi/openclaw-tutor](https://github.com/DonnieFi/openclaw-tutor) at
  `a1c7967de81296f51a4532cb53dccc90586f5ca9`. Plugin id `tutor-study`.
  Package `openclaw-tutor-plugin@0.1.0`. Artifact SHA-256
  `d389213e1e19abecd4c6ba5ae945f98078c7fc0bf3c2360d2346741e16cf4d26`.

`npm test` in each plugin repository: Meals 12/12, Tutor 12/12. New coverage is
a saved IANA timezone for “today”, Meals leaving a truncated flyer check on the
grocery list or later meals, Tutor resolving a display date such as `Fri Oct 9`,
skipping one unrecognized calendar item, and `delete_topic` /
`delete_assessment`. No network or host state was touched.

`openclaw templates validate`, offline `dev`, `inspect`, and `build` passed
again for `./templates/meals` and `./templates/tutor`. Each still reports one
agent, one skill, one bundled plugin, zero MCP servers, zero automations, 11
preview actions, 3 capability escalations, and 0 blocked actions. Those preview
actions are the install plan (agent, workspace files, skill, and plugin). The
Tutor allow list includes `delete_topic` and `delete_assessment`. Each build
reported 0 excluded project paths.

Template archive integrity, superseding the hashes above:

- `dist/meals-0.1.0.tgz`:
  `sha256:71685e701d745cdc5be396fa583eefa83fea5c52c7e16c910d1b0332019729c4`
- `dist/tutor-0.1.0.tgz`:
  `sha256:9919bdc7962db89d06e38cbc1b34157f01d4efa951c103f27df5259274d5350c`

Agent ids stay `meals` and `tutor`. Study-guide reuse until the assessment date
passes is unchanged. No cron, Spoonacular, Discord delivery, or Family Pack
`requiresPlugins` entry was added. No live flyer request, live calendar call,
Template Add, or model conversation was run.
