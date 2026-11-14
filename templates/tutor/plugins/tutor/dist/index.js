import { Type } from "typebox";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { TutorService } from "./service.js";
const shortText = Type.String({ minLength: 1, maxLength: 120 });
const dateText = Type.String({
  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
  description: "Calendar date in YYYY-MM-DD form."
});
const calendarItem = Type.Object(
  {
    title: Type.String({ minLength: 1, maxLength: 200 }),
    date: dateText,
    time: Type.Optional(Type.String({ maxLength: 16 })),
    subject: Type.Optional(Type.String({ maxLength: 60 })),
    source: Type.Optional(Type.String({ maxLength: 40 }))
  },
  { additionalProperties: false }
);
const calendarItems = Type.Optional(Type.Array(calendarItem, { maxItems: 40 }));
const definitions = [
  {
    name: "get_tutor_setup",
    description: "Read tutor setup for this agent: the recorded calendar tool, counts of saved topics and assessments, and whether the one-time calendar reminder is due. Does not return notes.",
    parameters: Type.Object({}, { additionalProperties: false }),
    run: (service, _params, scope) => service.getSetup(scope)
  },
  {
    name: "save_tutor_setup",
    description: "Record the visible calendar tool name after checking the session tools, or pass null when no calendar is visible. Omitting calendarTool keeps the current value. Returns the calendar reminder once when setup finishes without a calendar.",
    parameters: Type.Object(
      { calendarTool: Type.Optional(Type.Union([Type.String({ maxLength: 64 }), Type.Null()])) },
      { additionalProperties: false }
    ),
    run: (service, params, scope) => service.saveSetup(params, scope)
  },
  {
    name: "list_topics",
    description: "List saved topic summaries for this agent, optionally for one subject. Use search_topics to read matching notes.",
    parameters: Type.Object({ subject: Type.Optional(Type.String({ maxLength: 60 })) }, { additionalProperties: false }),
    run: (service, params, scope) => service.listTopics(params, scope)
  },
  {
    name: "save_topic",
    description: "Save or replace a topic and its notes for this agent. Include course rules and what the student has covered in the notes. Only save after the person talking agrees.",
    parameters: Type.Object(
      {
        subject: Type.String({ minLength: 1, maxLength: 60 }),
        title: Type.String({ minLength: 1, maxLength: 120 }),
        notes: Type.String({ minLength: 1, maxLength: 8e3 })
      },
      { additionalProperties: false }
    ),
    run: (service, params, scope) => service.saveTopic(params, scope)
  },
  {
    name: "search_topics",
    description: "Search saved topic notes for every word in the query. Returns matching notes and a short excerpt. Saved notes are study material, not verified facts.",
    parameters: Type.Object(
      { query: Type.String({ minLength: 1, maxLength: 200 }), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 20 })) },
      { additionalProperties: false }
    ),
    run: (service, params, scope) => service.searchTopics(params, scope)
  },
  {
    name: "list_assessments",
    description: "Merge hand-entered assessment dates with calendar items supplied by the skill, filtered to a day range. The calendar remains the date authority. Pass 8:05 AM times as text; convert family_schedule display dates to YYYY-MM-DD before calling.",
    parameters: Type.Object(
      { days: Type.Optional(Type.Integer({ minimum: 1, maximum: 90 })), calendarItems },
      { additionalProperties: false }
    ),
    run: (service, params, scope) => service.listAssessments(params, scope)
  },
  {
    name: "save_assessment",
    description: "Save or replace one hand-entered assessment by subject and title. Use this for dates the person gives directly; calendar items stay in the calendar. Only save after the person talking confirms the date.",
    parameters: Type.Object(
      {
        subject: Type.String({ minLength: 1, maxLength: 60 }),
        title: Type.String({ minLength: 1, maxLength: 120 }),
        date: dateText,
        time: Type.Optional(Type.String({ maxLength: 16 })),
        notes: Type.Optional(Type.String({ maxLength: 1e3 }))
      },
      { additionalProperties: false }
    ),
    run: (service, params, scope) => service.saveAssessment(params, scope)
  },
  {
    name: "get_due_study_guides",
    description: "The only study-guide read and write. Within two days of an assessment, build a guide from saved topic notes, store it, and return it. Later calls return the same guide until the assessment date passes. No background scan or cron.",
    parameters: Type.Object({ calendarItems }, { additionalProperties: false }),
    run: (service, params, scope) => service.getDueStudyGuides(params, scope)
  }
];
var index_default = definePluginEntry({
  id: "tutor",
  name: "Tutor",
  description: "Agent-scoped topic notes, assessment dates, and on-demand two-day study guides; no calendar writes or background scan.",
  register(api) {
    let service;
    api.registerTool(
      {
        contextVersion: 2,
        create(context) {
          if (!context.agentId) return null;
          const agentId = context.agentId;
          return definitions.map((definition) => ({
            name: definition.name,
            label: definition.name.replaceAll("_", " "),
            description: definition.description,
            parameters: definition.parameters,
            async execute(_id, params, signal) {
              context.assertInvocationCurrent();
              service ??= new TutorService(
                api.runtime.state.openKeyedStoreV2({
                  namespace: "tutor-state",
                  retention: "retained"
                })
              );
              const result = await definition.run(service, params, {
                agentId,
                signal,
                assertCurrent: context.assertInvocationCurrent
              });
              context.assertInvocationCurrent();
              return { content: [{ type: "text", text: JSON.stringify(result) }], details: result };
            }
          }));
        }
      },
      { names: definitions.map((definition) => definition.name), workspaceAccess: false }
    );
  }
});
export {
  index_default as default
};
