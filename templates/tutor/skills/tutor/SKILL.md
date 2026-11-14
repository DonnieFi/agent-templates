---
name: tutor-study-planning
description: Track topic notes and assessment dates, use a visible calendar when present, and build a two-day study guide with the Tutor native plugin.
---

# Studying with the Tutor plugin

Use for topic notes, test and quiz dates, calendar-aware study planning, and
study guides. This skill uses the ten native `tutor-study` plugin tools. It does not
create calendar events, run a background scan, or write a finished assignment.

## 1. Read setup and saved work

1. Call `get_tutor_setup` to read the recorded calendar tool and saved counts.
2. Call `list_topics` and `list_assessments` before asking for something that may
   already be saved.
3. Reuse facts already in the conversation. Do not restart setup.

If a Tutor tool is missing, say which capability is unavailable. Do not claim a
saved note, date, or guide without a tool result.

## 2. Calendar setup

Look at the visible session tools for a calendar. `family_schedule` is one
example; another calendar tool may have a different name and shape. Do not
install, create, or change a calendar.

- **A calendar is visible**: tell the person which tool you can use and ask
  whether to use it for test and quiz dates. Save the exact tool name with
  `save_tutor_setup({ calendarTool })`.
- **No calendar is visible**: save `save_tutor_setup({ calendarTool: null })`.
  Tell them once that topic search and hand-entered dates still work, and that
  the two-day guide needs a calendar or a date they type in. The tool returns the
  reminder once; do not repeat it every turn.

Ask once which timezone dates should use. Save an IANA name with
`save_tutor_setup({ timezone })`, for example `America/Halifax`. Skip, or pass
`null`, to use the gateway host's local date. Today and the two-day window follow
that choice.

The plugin stores the tool name but cannot see other tools itself. The skill is
responsible for checking visibility and for passing calendar items into the
plugin.

## 3. Reading Family Pack's `family_schedule`

When `family_schedule` is the visible calendar:

1. Call `family_schedule({ days: 7 })` with **no** `query`.
   - Without `query`, `days` defaults to 1. Passing `days: 7` asks for the week.
   - With `query`, every word must appear in the title. A keyword such as
     `test quiz exam` matches nothing, so do not use `query` for this scan.
2. Read the returned `sections` and their `items`. Look for titles containing
   `test`, `quiz`, or `exam` (case-insensitive). The calendar may classify them
   under “not the usual”, “homework”, or another section.
3. For each match, collect:
   - `title`
   - `date` as returned, including a display date such as `Fri Oct 9`
   - `time` when present, as text such as `8:05 AM`
   - `subject` when known, otherwise omit it
   - `source: "family_schedule"`
4. Pass the schedule's display date, such as `Fri Oct 9`, through as `date`.
   The plugin accepts that form and `YYYY-MM-DD`. It reports an unrecognized
   item in `skippedCalendarItems` and still returns the other items. If an item
   is skipped, ask for that date. Do not drop the whole call.
5. Pass the collected items as `calendarItems` to `list_assessments` and
   `get_due_study_guides`. Do not save a calendar item with `save_assessment`;
   the calendar remains the date authority.
6. Do not create, edit, or delete a calendar event. v1 has no calendar write.

For another visible calendar tool, use its own read shape and map its events to
the same `calendarItems` fields. Do not assume it returns `family_schedule`
sections.

If the calendar call fails, say the calendar did not answer. Fall back to
hand-entered dates and do not invent one.

## 4. Topic notes

1. Ask only for the subject and what the student has covered when it matters to
   the next step.
2. Read saved topics first. Use `search_topics({ query })` to find notes; every
   word in the query must appear somewhere in the saved topic.
3. Include course rules in the notes when the student shares them, such as
   whether citing an assistant is allowed or whether the work must be individual.
4. Ask before saving a new topic or replacing notes. Then call
   `save_topic({ subject, title, notes })`.
5. When the student wants a new outline, help them reason it through. Save the
   outline as notes only after they confirm. When `family_members` is visible and
   the outline is shared or for school, ask a parent in chat before saving. That
   question is not an approval gate.
6. Saved notes are study material, not verified facts. If a note looks wrong,
   say so and offer to correct it after confirmation.

## 5. Assessment dates

- Use `save_assessment({ subject, title, date, time, notes })` for a date the
  person gives directly. It replaces an existing hand-entered date with the same
  subject and title.
- Use `delete_topic({ subject, title })` or `delete_assessment({ subject, title })`
  only after the person confirms. Deleting an assessment also drops its stored
  study guide. A full store can be shrunk this way.
- Use `list_assessments({ days, calendarItems })` to merge hand-entered dates
  with the calendar items. The plugin returns the source for each item: `tutor`,
  `calendar`, or `both`.
- If a calendar item and a hand-entered date disagree, use the calendar date and
  say the saved date differed. Do not overwrite the calendar or add a duplicate
  hand-entered copy.
- Do not guess a date, time, or subject. If the person is unsure, list what is
  known and ask.

## 6. Study guides

`get_due_study_guides({ calendarItems })` is the only guide read and write.

1. Call it when someone talks to the tutor and an assessment is within two days.
   There is no background scan and no cron.
2. It builds the guide from saved topic notes, stores it, and returns it. Later
   calls return the same guide unchanged until the assessment date passes.
3. Present the guide as a starting point:
   - read the assessment date and time,
   - name the saved topics it uses,
   - offer to quiz, explain a section, or help the student write their own
     outline.
4. If no notes are saved, say the guide has no notes yet and offer to add a topic.
5. Do not present a past guide as current. If the date has passed, drop it and
   look at the next assessment.
6. Do not produce a finished assignment, an answer key, or a predicted grade.

## 7. Teaching

- Ask a useful question before a long explanation. Check understanding with a
  small example.
- Help the student reason, check their work, and name what they still need.
- Follow the course rules in the notes. If they say to cite help or work alone,
  say so before offering an outline.
- Do not copy a private household syllabus into the package or a workspace file.

## 8. Boundaries

- Do not ask about Discord, channels, routing, or delivery.
- Do not create a calendar event, reminder, or scheduled job.
- Do not run a background scan or promise a notification.
- Do not use a second student database inside Family Pack.
- If a tool fails with a permission error, explain that the concrete Tutor tool
  needs a host grant. Do not request shell or wildcard access.
