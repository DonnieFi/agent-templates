# Tutor setup and operator notes

Tutor uses the bundled native `tutor` plugin. The template stages the tested
build; it does not require Family Pack, install a calendar, or run a background
scan.

## Pinned build

- Package: `openclaw-tutor-plugin@0.1.0`
- Plugin ID: `tutor`
- Artifact: `openclaw-tutor-plugin-0.1.0.tgz`
- SHA-256: `bc1535ec9c7b34be235cc4a17047ef6daa635aa8d633366378bb39b33f0af664`
- Source: the sibling `openclaw-tutor` plugin repository
- Staged path: `plugins/tutor/` with compiled `dist/`, `package.json`,
  `openclaw.plugin.json`, `README.md`, and `LICENSE`

The template does not include `node_modules`. OpenClaw installs the declared
`typebox` dependency through its normal plugin path.

## State and tools

The plugin stores one record per host-supplied agent ID in the `tutor-state`
keyed store. It contains the setup record, topic notes, hand-entered assessment
dates, and stored study guides. A different agent does not see them.

The eight tools are:

1. `get_tutor_setup`
2. `save_tutor_setup`
3. `list_topics`
4. `save_topic`
5. `search_topics`
6. `list_assessments`
7. `save_assessment`
8. `get_due_study_guides`

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
- Convert display dates such as `Fri Oct 9` to `YYYY-MM-DD` before passing them.
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

Plugin proof is run in the sibling source repository:

    npm install --ignore-scripts
    npm run build
    npm test

The tests use a fake keyed store and clock. They do not call a calendar or a
model, install an agent, or change a host.
