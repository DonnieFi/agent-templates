# Tutor acceptance scenarios

This is a test plan, not a passing test report. Plugin tests, Template validation,
and a real conversation are separate forms of evidence.

## 1. Setup

- **Calendar visible**: The skill sees `family_schedule` (or another calendar),
  asks whether to use it, and saves the exact tool name.
- **No calendar**: The skill saves `null`, says topic search and hand-entered
  dates still work, and delivers the missing-calendar reminder once.
- **Reminder not repeated**: A second setup save does not repeat the reminder.
- **No installation**: The agent does not install a calendar or claim one exists.
- **Missing tools**: The agent says the Tutor tools are unavailable and does not
  claim a saved topic, date, or guide.
- **Agent scope**: A different agent does not see the first agent's topics,
  dates, or guides.

## 2. Topics

- **Save after confirmation**: A new topic is written only after the person
  agrees.
- **Upsert**: The same subject and title replaces the notes instead of adding a
  duplicate.
- **Course rules**: A rule such as “cite the assistant” is kept in the notes and
  appears in a due guide.
- **Search**: A query must match every word somewhere in the saved topic.
- **No match**: A query with an unmatched word returns no matches, not a guess.
- **Preview**: Listing topics returns a short preview and does not dump every
  note.

## 3. Assessments

- **Hand-entered date**: `save_assessment` stores a subject, title, date, time,
  and notes.
- **Replace**: The same subject and title with a new date replaces the old
  hand-entered date.
- **Calendar merge**: Supplied calendar items merge with hand-entered dates; a
  match is marked `both`.
- **Calendar authority**: A calendar date is not overwritten by a hand-entered
  copy or duplicated.
- **Duplicates**: The same calendar item passed twice appears once.
- **Range**: Items outside the requested day range are excluded.
- **Display date**: A calendar date such as `Fri Oct 9` is accepted and resolved
  near today. A hand-entered `save_assessment` date stays `YYYY-MM-DD`.
- **Skipped item**: One unrecognized calendar item is reported in
  `skippedCalendarItems`. The other items in that call still return.
- **Delete**: A confirmed `delete_topic` or `delete_assessment` removes that
  record. Deleting an assessment also drops its stored guide. A second delete
  reports no match.
- **Timezone**: A saved IANA timezone decides today and the two-day window. With
  none saved, those dates use the gateway host's local date.

## 4. Study guides

- **Outside the window**: An assessment more than two days away produces no
  guide.
- **Inside the window**: A due assessment builds a guide from saved notes and
  returns it.
- **Stored guide reused**: A later call before the date returns the same guide
  unchanged, even if notes changed.
- **Calendar-only guide**: A calendar item can be the only source of a due guide.
- **No notes**: The guide says no topic notes are saved and suggests adding one.
- **After the date**: A past guide is not presented as current; it is pruned.
- **No background scan**: No guide appears without a conversation turn.
- **Not a finished assignment**: The guide names study steps and saved notes; it
  does not contain an answer key or a completed essay.

## 5. Family Pack

- **Absent**: Tutor remains useful without Family Pack.
- **Calendar only**: A visible `family_schedule` supplies the week; the plugin
  still owns topics, notes, and guides.
- **Parent check**: A visible `family_members` tool can support a chat question
  before saving a shared or school outline.
- **Not a gate**: The plugin does not implement an approval gate, and the template
  does not list `family_schedule` or `family_members` in `alsoAllow`.

## 6. Boundaries

- **No calendar writes**: The agent does not create, edit, or delete an event.
- **No delivery**: Nothing is posted; the agent does not ask about Discord,
  channels, routing, or delivery.
- **No private syllabus**: A household syllabus is not copied into the package
  or a workspace file.
- **No second student database**: Family Pack does not gain a student schema in
  this version.
