# Tutor setup and operator notes

Tutor uses the bundled native `tutor-study` plugin. The template stages the tested
build; it does not require Family Pack, install a calendar, or run a background
scan.

## Pinned build

- Package: `openclaw-tutor-plugin@0.1.0`
- Plugin ID: `tutor-study`
- Artifact: `openclaw-tutor-plugin-0.1.0.tgz`
- SHA-256: `d389213e1e19abecd4c6ba5ae945f98078c7fc0bf3c2360d2346741e16cf4d26`
- Source: https://github.com/DonnieFi/openclaw-tutor
- Source commit: `a1c7967de81296f51a4532cb53dccc90586f5ca9`
- Staged path: `plugins/tutor/` with compiled `dist/`, `package.json`,
  `openclaw.plugin.json`, `README.md`, and `LICENSE`

The template does not include `node_modules`. OpenClaw installs the declared
`typebox` dependency through its normal plugin path.

## State and tools

The plugin stores one record per host-supplied agent ID in the `tutor-state`
keyed store. It contains the setup record, topic notes, hand-entered assessment
dates, and stored study guides. A different agent does not see them.

The ten tools are:

1. `get_tutor_setup`
2. `save_tutor_setup`
3. `list_topics`
4. `save_topic`
5. `search_topics`
6. `list_assessments`
7. `save_assessment`
8. `delete_topic`
9. `delete_assessment`
10. `get_due_study_guides`

The template grants exactly those names plus workspace `read` under a minimal
tool profile, with `fs.workspaceOnly: true`.

## Calendar integration

The plugin cannot see or call other tools. The Tutor skill checks the session for
a visible calendar, records the exact tool name with `save_tutor_setup`, and maps
events to `calendarItems` for the two date-aware tools.

Family Pack's `family_schedule` is supported as one calendar source:

- Call with `{ days: 7 }` and no `query`.
- Without `query`, `days` defaults to 1. With `query`, every word must appear in
  the title, so `test quiz exam` matches nothing.
- Read the returned sections and look for test, quiz, and exam titles locally.
- Pass display dates such as `Fri Oct 9` through. The plugin resolves them.
  An unrecognized item is reported in `skippedCalendarItems` and does not fail
  the rest of the call.
- Today and the two-day window use the IANA timezone saved with
  `save_tutor_setup`. With none saved, they use the gateway host's local date.
- The calendar remains the date authority.
- The tutor does not create or change calendar events in v1.

Without a calendar, topic search and hand-entered dates still work. Setup returns
the missing-calendar reminder once. The template does not install or require a
calendar.

## Study guides

`get_due_study_guides` is the only guide read and write.

- A guide is built only on demand, inside the two-day window.
- It matches saved topics by subject first, then by title words.
- It stores the guide and returns it unchanged until the assessment date passes.
- Past guides are pruned.
- There is no background scan, cron, notification, or message delivery.
- The guide is assembled from notes; it is not an answer key or a finished
  assignment.

## Family Pack

Tutor does not list Family Pack under `requiresPlugins`, and the template does
not include `family_schedule` or `family_members` in `alsoAllow`. If the host
separately grants `family_schedule`, the skill uses it as a calendar. If it grants
`family_members`, the agent can ask a parent in chat before saving a shared or
school outline. That question is not an approval gate.

## Validate and build

From the source repository root:

    openclaw templates validate ./templates/tutor
    openclaw templates dev ./templates/tutor
    openclaw templates inspect ./templates/tutor
    openclaw templates build ./templates/tutor --out ./dist/tutor-0.1.0.tgz

Plugin proof is run in the source repository
(https://github.com/DonnieFi/openclaw-tutor):

    npm install --ignore-scripts
    npm run build
    npm test

The tests use a fake keyed store and clock. They do not call a calendar or a
model, install an agent, or change a host.
