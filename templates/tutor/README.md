# Tutor

**Understand it together. Don't hand over the answer.** An OpenClaw study
companion that keeps topic notes and assessment dates, uses a visible calendar
when one exists, and builds a study guide two days ahead. No calendar writes,
background scan, or channel delivery.

## What Tutor includes

- **Conversational persona**: first-run calendar check, teaching stance, and a
  clear line against finishing assignments for the student.
- **Bundled tutor skill** (`skills/tutor`): coordinates calendar discovery,
  `family_schedule` reading, topic notes, assessment merging, and study guides.
- **Bundled native tutor plugin** (`plugins/tutor/`):
  `openclaw-tutor-plugin@0.1.0` (`tutor-study`), providing the ten tools listed below. The
  plugin owns its state; the template ships no students, topics, dates, grades,
  or syllabi.

## Native tools

- `get_tutor_setup` / `save_tutor_setup`: record the visible calendar tool and an optional IANA timezone.
- `list_topics` / `save_topic` / `delete_topic` / `search_topics`: manage saved notes.
- `list_assessments` / `save_assessment` / `delete_assessment`: merge calendar items with hand-entered
  dates, save a date the person gives, or remove one.
- `get_due_study_guides`: build, store, and return a guide inside the two-day
  window. This is the only guide read and write.

## Calendar behavior

The skill looks for a visible calendar tool. Family Pack's `family_schedule` is
one source. When it is used:

- call `family_schedule({ days: 7 })` with no `query`;
- without `query`, `days` defaults to 1;
- with `query`, every word must appear in the title, so `test quiz exam` matches
  nothing;
- read the returned sections and find test, quiz, and exam titles locally;
- pass display dates such as `Fri Oct 9` through as `calendarItems`;
- the plugin resolves those dates and skips an unrecognized item without failing the rest.

The calendar remains the date authority. The tutor does not create calendar events
in v1. Without a calendar, topic search and hand-entered dates still work. Setup
returns the missing-calendar reminder once.

## First study session

1. Add the Template with normal OpenClaw review and consent.
2. Start a conversation. Tutor checks its tools and the visible calendar.
3. It records the calendar choice, or finishes without one.
4. Ask “What's coming up?”, “Quiz me on fractions,” or “Help me make an outline.”
5. Save a topic or a hand-entered date only after you agree.
6. Within two days of an assessment, `get_due_study_guides` returns a stored guide
   built from saved notes.

The guide is a starting point. It is not an answer key or a finished assignment.

## Boundaries

- No Discord delivery, routing, or channel setup questions.
- No background scan, cron, or notification.
- No automatic calendar creation or calendar writes.
- No separate study-guide save tool.
- No second student database inside Family Pack.
- No private household syllabus copied into the package.
- Family Pack is optional. When `family_members` is visible, the agent can ask a
  parent in chat before saving a shared or school outline; the plugin does not
  enforce an approval gate.

## Files

- `CLAW.md`: manifest frontmatter and personality (`SOUL.md`).
- `BOOTSTRAP.md`: first-run conversation.
- `workspace/AGENTS.md`: calendar, teaching, privacy, and authority rules.
- `skills/tutor/SKILL.md`: tool workflow, including the `family_schedule` call.
- `plugins/tutor/`: pinned native plugin build.
- `workspace/reference/setup.md`: operator notes and calendar behavior.
- `workspace/reference/acceptance.md`: test plan, not a passing report.
- `workspace/examples/study-session.md`: fictional example.
- `package.json`: package metadata.

## Validate

With a compatible OpenClaw CLI:

```bash
openclaw templates validate ./templates/tutor
openclaw templates dev ./templates/tutor
openclaw templates inspect ./templates/tutor
openclaw templates build ./templates/tutor --out ./dist/tutor-0.1.0.tgz
```

Package validation does not install a calendar, prove a live model conversation,
or establish calendar coverage. The README is also mapped into
`reference/package-readme.md` for the installed agent.

## Source

The plugin source is [DonnieFi/openclaw-tutor](https://github.com/DonnieFi/openclaw-tutor),
at source commit `a1c7967de81296f51a4532cb53dccc90586f5ca9`. The template vendors
only the tested build: `openclaw-tutor-plugin@0.1.0`, artifact SHA-256
`d389213e1e19abecd4c6ba5ae945f98078c7fc0bf3c2360d2346741e16cf4d26`.

No private student records, real syllabi, raw conversations, or machine-specific
paths are included.
