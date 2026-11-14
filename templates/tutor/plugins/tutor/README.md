# OpenClaw Tutor plugin

Native, agent-scoped study notes and assessment tracking for OpenClaw. The plugin
owns topic notes, hand-entered assessment dates, calendar items supplied by the
skill, and stored study guides. It does not write a calendar, scan in the
background, or complete an assignment.

## Tools

- `get_tutor_setup` — read the recorded calendar tool and counts.
- `save_tutor_setup` — record a visible calendar tool, or none.
- `list_topics` — list topic summaries.
- `save_topic` — save or replace a topic and its notes.
- `search_topics` — search saved notes for every word in the query.
- `list_assessments` — merge hand-entered dates with supplied calendar items.
- `save_assessment` — save or replace one hand-entered date.
- `delete_topic` — remove one saved topic.
- `delete_assessment` — remove one hand-entered assessment and its stored guide.
- `get_due_study_guides` — build, store, and return a guide within two days.

State is keyed by the host-supplied agent ID in OpenClaw's plugin keyed store,
namespace `tutor-state`. No template file contains a real student, syllabus,
grade, or course record.

## Calendar behavior

The plugin cannot see or call another tool. The Tutor skill checks for a visible
calendar tool, records its name with `save_tutor_setup`, and passes test, quiz, and
exam items to `list_assessments` and `get_due_study_guides`.

When Family Pack's `family_schedule` is the calendar, the skill calls it with
`days: 7` and no `query`. Without `query`, `days` defaults to 1. With `query`,
every word must appear in the title, so a keyword such as `test quiz exam` matches
nothing. The skill reads the returned sections and looks for test, quiz, and exam
titles locally. Pass those display dates through. This plugin accepts `YYYY-MM-DD`
and a display date such as `Fri Oct 9`. An unrecognized item is reported in
`skippedCalendarItems` and the rest of the call still runs. The calendar remains
the date authority. This plugin does not create calendar events.

Today and the two-day window use the saved IANA timezone when `save_tutor_setup`
has one. Otherwise they use the gateway host's local date. Without a calendar,
topic search and hand-entered dates still work. Setup returns the missing-calendar
reminder once.

## Study guides

`get_due_study_guides` is the only guide read and write. On a call within two days
of an assessment, it matches saved topics by subject, then by title words, builds
a Markdown guide from the saved notes, stores it, and returns it. Later calls
return the same guide unchanged until the assessment date passes. Past guides are
pruned.

There is no background scan, cron, notification, or message delivery. A guide is
built only when someone talks to the tutor. The guide is a starting point and
names the study steps; it is not an answer key or a finished assignment.

## Build and test

With Node 24.22.1 or newer:

    npm install --ignore-scripts
    npm run typecheck
    npm run build
    npm test

Tests use a fake keyed store and clock. They do not call a calendar or model.
Install the npm artifact through OpenClaw so the host manages `typebox`.

## Template hookup

The plugin id is `tutor-study`. The Tutor template vendors a pinned build under
`plugins/tutor/` and grants only the ten tool names above plus workspace read.
Family Pack is not required and
`family_schedule` is not in `alsoAllow`. A visible `family_members` tool can
support a conversational parent check, but the plugin does not implement an
approval gate.

## License

MIT
