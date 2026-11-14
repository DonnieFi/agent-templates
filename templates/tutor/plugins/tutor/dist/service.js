import {
  addDays,
  asString,
  cleanText,
  isDate,
  isTime,
  keyOf,
  normalize,
  optionalText,
  today,
  weekday,
  words
} from "./validate.js";
const MAX_TOPICS = 100;
const MAX_ASSESSMENTS = 100;
const MAX_GUIDES = 50;
const MAX_CALENDAR_ITEMS = 40;
const DUE_DAYS = 2;
const MAX_GUIDE_TOPICS = 5;
const MAX_GUIDE_NOTE_CHARS = 12e3;
const MAX_SEARCH_NOTE_CHARS = 3e3;
function emptyState() {
  return {
    version: 1,
    setup: { calendarTool: null, calendarReminderShownAt: null, updatedAt: null },
    topics: [],
    assessments: [],
    guides: []
  };
}
function record(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function normalizeState(value) {
  if (!record(value) || value.version !== 1) return emptyState();
  const setup = record(value.setup) ? value.setup : {};
  const topics = Array.isArray(value.topics) ? value.topics.filter(record).flatMap((topic) => {
    const subject = asString(topic.subject);
    const title = asString(topic.title);
    const notes = asString(topic.notes);
    if (!subject.trim() || !title.trim() || !notes.trim()) return [];
    return [{
      subject,
      title,
      notes,
      createdAt: asString(topic.createdAt),
      updatedAt: asString(topic.updatedAt)
    }];
  }).slice(0, MAX_TOPICS) : [];
  const assessments = Array.isArray(value.assessments) ? value.assessments.filter(record).flatMap((assessment) => {
    const subject = asString(assessment.subject);
    const title = asString(assessment.title);
    const date = asString(assessment.date);
    if (!subject.trim() || !title.trim() || !isDate(date)) return [];
    return [{
      subject,
      title,
      date,
      time: typeof assessment.time === "string" ? assessment.time : null,
      notes: asString(assessment.notes),
      createdAt: asString(assessment.createdAt),
      updatedAt: asString(assessment.updatedAt)
    }];
  }).slice(0, MAX_ASSESSMENTS) : [];
  const guides = Array.isArray(value.guides) ? value.guides.filter(record).flatMap((guide) => {
    const title = asString(guide.title);
    const subject = asString(guide.subject);
    const date = asString(guide.date);
    const markdown = asString(guide.markdown);
    if (!title.trim() || !subject.trim() || !isDate(date) || !markdown.trim()) return [];
    return [{
      key: asString(guide.key, keyOf(subject, title, date)),
      title,
      subject,
      date,
      time: typeof guide.time === "string" ? guide.time : null,
      markdown,
      generatedAt: asString(guide.generatedAt)
    }];
  }).slice(-MAX_GUIDES) : [];
  return {
    version: 1,
    setup: {
      calendarTool: typeof setup.calendarTool === "string" ? setup.calendarTool : null,
      calendarReminderShownAt: typeof setup.calendarReminderShownAt === "string" ? setup.calendarReminderShownAt : null,
      updatedAt: typeof setup.updatedAt === "string" ? setup.updatedAt : null
    },
    topics,
    assessments,
    guides
  };
}
function timeRank(value) {
  if (!value) return 24 * 60;
  const match = /^(\d{1,2}):(\d{2})(?:\s?([ap]m))?$/i.exec(value.trim());
  if (!match) return 24 * 60;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (match[3]?.toLowerCase() === "pm" && hours < 12) hours += 12;
  if (match[3]?.toLowerCase() === "am" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}
function sortAssessments(items) {
  return [...items].sort(
    (a, b) => a.date.localeCompare(b.date) || timeRank(a.time) - timeRank(b.time) || a.title.localeCompare(b.title, "en-CA")
  );
}
function summary(topic) {
  return {
    subject: topic.subject,
    title: topic.title,
    notesPreview: topic.notes.replace(/\s+/g, " ").trim().slice(0, 200),
    notesLength: topic.notes.length,
    updatedAt: topic.updatedAt
  };
}
function cleanCalendarItem(item, index) {
  if (!isDate(item.date)) throw new Error(`calendarItems[${index}].date must be a real date in YYYY-MM-DD form.`);
  const time = optionalText(item.time, 16);
  if (time !== null && !isTime(time)) throw new Error(`calendarItems[${index}].time must look like 08:05 or 8:05 AM.`);
  return {
    title: cleanText(item.title, `calendarItems[${index}].title`, 200),
    date: item.date,
    ...time === null ? {} : { time },
    ...item.subject === void 0 ? {} : { subject: cleanText(item.subject, `calendarItems[${index}].subject`, 60) },
    ...item.source === void 0 ? {} : { source: cleanText(item.source, `calendarItems[${index}].source`, 40) }
  };
}
function cleanCalendar(items) {
  if (!items) return [];
  if (items.length > MAX_CALENDAR_ITEMS) throw new Error(`calendarItems is limited to ${MAX_CALENDAR_ITEMS} items.`);
  return items.map(cleanCalendarItem);
}
class TutorService {
  constructor(store, now = Date.now) {
    this.store = store;
    this.now = now;
  }
  store;
  now;
  key(scope) {
    return `agent:${scope.agentId}`;
  }
  async load(scope) {
    const state = normalizeState(await this.store.lookup(this.key(scope)));
    scope.assertCurrent();
    return state;
  }
  async save(state, scope) {
    scope.assertCurrent();
    await this.store.register(this.key(scope), state, { assertCurrent: scope.assertCurrent });
    scope.assertCurrent();
  }
  merge(state, calendarItems, days) {
    const current = today(this.now());
    const end = addDays(current, days);
    const map = /* @__PURE__ */ new Map();
    for (const assessment of state.assessments) {
      if (assessment.date < current || assessment.date > end) continue;
      map.set(keyOf(assessment.subject, assessment.title, assessment.date), {
        ...assessment,
        source: "tutor",
        sources: ["tutor"]
      });
    }
    const mergeItem = (key, existing, item, source) => {
      const sources = [.../* @__PURE__ */ new Set([...existing.sources, source])];
      map.set(key, {
        ...existing,
        subject: existing.subject === "General" && item.subject ? item.subject : existing.subject,
        time: existing.time ?? item.time ?? null,
        source: existing.source === "calendar" ? "calendar" : "both",
        sources
      });
    };
    for (const item of calendarItems) {
      if (item.date < current || item.date > end) continue;
      const source = item.source ?? "calendar";
      const exact = item.subject === void 0 ? void 0 : keyOf(item.subject, item.title, item.date);
      const existing = exact === void 0 ? void 0 : map.get(exact);
      if (exact !== void 0 && existing) {
        mergeItem(exact, existing, item, source);
        continue;
      }
      const sameTitleDate = item.subject === void 0 ? [...map.entries()].filter(([, value]) => keyOf(value.title, value.date) === keyOf(item.title, item.date)) : [];
      if (sameTitleDate.length === 1) {
        const [key2, value] = sameTitleDate[0];
        mergeItem(key2, value, item, source);
        continue;
      }
      const key = keyOf(item.subject ?? "General", item.title, item.date);
      const duplicate = map.get(key);
      if (duplicate) {
        mergeItem(key, duplicate, item, source);
        continue;
      }
      map.set(key, {
        subject: item.subject ?? "General",
        title: item.title,
        date: item.date,
        time: item.time ?? null,
        notes: "",
        createdAt: "",
        updatedAt: "",
        source: "calendar",
        sources: [source]
      });
    }
    return { current, end, items: sortAssessments([...map.values()]) };
  }
  async getSetup(scope) {
    const state = await this.load(scope);
    const current = today(this.now());
    return {
      calendarTool: state.setup.calendarTool,
      calendarAvailable: Boolean(state.setup.calendarTool),
      topics: state.topics.length,
      assessments: state.assessments.length,
      activeGuides: state.guides.filter((guide) => guide.date >= current).length,
      calendarReminderDue: !state.setup.calendarTool && !state.setup.calendarReminderShownAt,
      note: state.setup.calendarTool ? "The skill checks whether the recorded calendar tool is actually visible before using it." : "Topic search and hand-entered test dates work without a calendar. The two-day study guide needs a calendar or dates entered by hand."
    };
  }
  async saveSetup(input, scope) {
    const state = await this.load(scope);
    if (input.calendarTool !== void 0) {
      const value = input.calendarTool === null ? null : input.calendarTool.trim();
      state.setup.calendarTool = value ? cleanText(value, "calendarTool", 64) : null;
      if (state.setup.calendarTool && !/^[A-Za-z][A-Za-z0-9_.:-]*$/.test(state.setup.calendarTool)) {
        throw new Error("calendarTool must be a tool name, using letters, digits, dots, colons, underscores, or hyphens.");
      }
    }
    state.setup.updatedAt = new Date(this.now()).toISOString();
    let reminder;
    if (!state.setup.calendarTool && !state.setup.calendarReminderShownAt) {
      state.setup.calendarReminderShownAt = state.setup.updatedAt;
      reminder = "I can still help with topics and dates you type in, but the two-day study guide needs a calendar. When a calendar tool is available, tell me and I will use it.";
    }
    await this.save(state, scope);
    return {
      calendarTool: state.setup.calendarTool,
      calendarAvailable: Boolean(state.setup.calendarTool),
      topics: state.topics.length,
      assessments: state.assessments.length,
      calendarReminderDue: false,
      ...reminder === void 0 ? {} : { reminder }
    };
  }
  async listTopics(input, scope) {
    const state = await this.load(scope);
    const subject = input.subject?.trim();
    const topics = state.topics.filter((topic) => !subject || normalize(topic.subject) === normalize(subject)).sort((a, b) => a.subject.localeCompare(b.subject, "en-CA") || a.title.localeCompare(b.title, "en-CA"));
    return {
      topics: topics.map(summary),
      count: topics.length,
      ...subject ? { subject } : {},
      note: topics.length ? "Search topics to read the saved notes." : "No topic notes are saved for this agent yet."
    };
  }
  async saveTopic(input, scope) {
    const subject = cleanText(input.subject, "subject", 60);
    const title = cleanText(input.title, "title", 120);
    const notes = cleanText(input.notes, "notes", 8e3);
    const state = await this.load(scope);
    const key = keyOf(subject, title);
    const index = state.topics.findIndex((topic2) => keyOf(topic2.subject, topic2.title) === key);
    const updatedAt = new Date(this.now()).toISOString();
    const topic = index === -1 ? { subject, title, notes, createdAt: updatedAt, updatedAt } : { ...state.topics[index], subject, title, notes, updatedAt };
    if (index === -1) {
      if (state.topics.length >= MAX_TOPICS) throw new Error(`At most ${MAX_TOPICS} topics are saved. Remove one first.`);
      state.topics.push(topic);
    } else {
      state.topics[index] = topic;
    }
    await this.save(state, scope);
    return { saved: true, topic: summary(topic), count: state.topics.length };
  }
  async searchTopics(input, scope) {
    const query = cleanText(input.query, "query", 200);
    const limit = input.limit ?? 8;
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error("limit must be between 1 and 20.");
    const tokens = [...new Set(words(query))];
    if (!tokens.length) throw new Error("query needs at least one word.");
    const state = await this.load(scope);
    const matches = state.topics.flatMap((topic) => {
      const title = topic.title.toLocaleLowerCase("en-CA");
      const subject = topic.subject.toLocaleLowerCase("en-CA");
      const notesText = topic.notes.toLocaleLowerCase("en-CA");
      let score = 0;
      const matchedIn = /* @__PURE__ */ new Set();
      for (const token of tokens) {
        if (title.includes(token)) {
          score += 5;
          matchedIn.add("title");
        } else if (subject.includes(token)) {
          score += 3;
          matchedIn.add("subject");
        } else if (notesText.includes(token)) {
          score += 1;
          matchedIn.add("notes");
        } else return [];
      }
      const first = tokens.find((token) => notesText.includes(token));
      let snippet = topic.notes.replace(/\s+/g, " ").trim().slice(0, 240);
      if (first) {
        const at = notesText.indexOf(first);
        snippet = topic.notes.slice(Math.max(0, at - 100), at + 180).replace(/\s+/g, " ").trim();
      }
      return [{
        subject: topic.subject,
        title: topic.title,
        score,
        matchedIn: [...matchedIn],
        snippet,
        notes: topic.notes.slice(0, MAX_SEARCH_NOTE_CHARS),
        notesTruncated: topic.notes.length > MAX_SEARCH_NOTE_CHARS,
        updatedAt: topic.updatedAt
      }];
    }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "en-CA")).slice(0, limit);
    return {
      query,
      matches,
      count: matches.length,
      note: matches.length ? "Matches are saved notes, not verified facts." : "No saved topic notes matched every word in that query."
    };
  }
  async listAssessments(input, scope) {
    const days = input.days ?? 30;
    if (!Number.isInteger(days) || days < 1 || days > 90) throw new Error("days must be between 1 and 90.");
    const calendarItems = cleanCalendar(input.calendarItems);
    const state = await this.load(scope);
    const merged = this.merge(state, calendarItems, days);
    return {
      today: merged.current,
      through: merged.end,
      days,
      assessments: merged.items,
      calendarItemsConsidered: calendarItems.length,
      note: merged.items.length ? "Hand-entered dates and supplied calendar items are merged; the calendar remains the date authority." : "No assessments in that range. Add a date or pass calendar items."
    };
  }
  async saveAssessment(input, scope) {
    const subject = cleanText(input.subject, "subject", 60);
    const title = cleanText(input.title, "title", 120);
    if (!isDate(input.date)) throw new Error("date must be a real date in YYYY-MM-DD form.");
    const time = optionalText(input.time, 16);
    if (time !== null && !isTime(time)) throw new Error("time must look like 08:05 or 8:05 AM.");
    const notes = optionalText(input.notes, 1e3) ?? "";
    const state = await this.load(scope);
    const key = keyOf(subject, title);
    const index = state.assessments.findIndex((assessment2) => keyOf(assessment2.subject, assessment2.title) === key);
    const updatedAt = new Date(this.now()).toISOString();
    const assessment = index === -1 ? { subject, title, date: input.date, time, notes, createdAt: updatedAt, updatedAt } : { ...state.assessments[index], date: input.date, time, notes, updatedAt };
    if (index === -1) {
      if (state.assessments.length >= MAX_ASSESSMENTS) throw new Error(`At most ${MAX_ASSESSMENTS} assessments are saved. Remove one first.`);
      state.assessments.push(assessment);
    } else {
      state.assessments[index] = assessment;
    }
    await this.save(state, scope);
    return { saved: true, assessment, count: state.assessments.length };
  }
  topicsFor(state, assessment) {
    const exact = state.topics.filter((topic) => normalize(topic.subject) === normalize(assessment.subject));
    if (exact.length) {
      return [...exact].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, MAX_GUIDE_TOPICS);
    }
    const titleWords = new Set(words(assessment.title));
    return state.topics.flatMap((topic) => {
      const haystack = new Set(words(`${topic.subject} ${topic.title}`));
      const score = [...titleWords].filter((word) => haystack.has(word)).length;
      return score ? [{ topic, score }] : [];
    }).sort((a, b) => b.score - a.score || b.topic.updatedAt.localeCompare(a.topic.updatedAt)).slice(0, MAX_GUIDE_TOPICS).map((entry) => entry.topic);
  }
  buildGuide(state, assessment) {
    const topics = this.topicsFor(state, assessment);
    let used = 0;
    let shortened = false;
    const sections = [];
    for (const topic of topics) {
      const remaining = MAX_GUIDE_NOTE_CHARS - used;
      if (remaining <= 0) {
        shortened = true;
        break;
      }
      const note = topic.notes.slice(0, remaining);
      if (note.length < topic.notes.length) shortened = true;
      used += note.length;
      sections.push(`### ${topic.title}

${note}`);
    }
    const saved = sections.length ? sections.join("\n\n") : "No topic notes are saved for this subject yet. Tell the tutor what you have covered, save a topic, then ask again.";
    const when = `${weekday(assessment.date)}, ${assessment.date}${assessment.time ? ` at ${assessment.time}` : ""}`;
    const markdown = [
      `# Study guide: ${assessment.title}`,
      "",
      `**Assessment:** ${when}`,
      `**Subject:** ${assessment.subject}`,
      "",
      "## Saved notes",
      "",
      saved,
      ...shortened ? ["", "_Some notes were shortened. Open the saved topic for the full text._"] : [],
      "",
      "## Before the assessment",
      "",
      "- Re-read the notes above and rewrite the main idea in your own words.",
      "- Write down two questions you still have.",
      "- Confirm the date, time, and what materials are allowed with your teacher.",
      "- Ask the tutor to quiz you or explain one part. This guide is not a finished assignment.",
      "",
      `_Built from saved notes on ${today(this.now())}. It is a starting point, not an answer key._`
    ].join("\n");
    return {
      key: keyOf(assessment.subject, assessment.title, assessment.date),
      title: assessment.title,
      subject: assessment.subject,
      date: assessment.date,
      time: assessment.time,
      markdown,
      generatedAt: new Date(this.now()).toISOString()
    };
  }
  async getDueStudyGuides(input, scope) {
    const calendarItems = cleanCalendar(input.calendarItems);
    const state = await this.load(scope);
    const merged = this.merge(state, calendarItems, DUE_DAYS);
    const due = merged.items.filter((assessment) => assessment.date >= merged.current && assessment.date <= merged.end);
    const before = state.guides.length;
    state.guides = state.guides.filter((guide) => guide.date >= merged.current).slice(-MAX_GUIDES);
    const guides = due.map((assessment) => {
      const key = keyOf(assessment.subject, assessment.title, assessment.date);
      const existing = state.guides.find((guide) => guide.key === key && guide.date === assessment.date);
      if (existing) return { ...existing, reused: true };
      const built = this.buildGuide(state, assessment);
      state.guides.push(built);
      return { ...built, reused: false };
    });
    state.guides = state.guides.slice(-MAX_GUIDES);
    if (guides.some((guide) => !guide.reused) || state.guides.length !== before) await this.save(state, scope);
    return {
      today: merged.current,
      dueWindow: { from: merged.current, through: merged.end },
      guides,
      calendarItemsConsidered: calendarItems.length,
      note: guides.length ? "A stored guide is returned unchanged until its assessment date passes. Use it as a starting point, not a finished assignment." : "No assessment is in the next two days. Keep using topic search; a guide is built when one is due."
    };
  }
}
export {
  DUE_DAYS,
  MAX_ASSESSMENTS,
  MAX_CALENDAR_ITEMS,
  MAX_GUIDES,
  MAX_TOPICS,
  TutorService,
  emptyState,
  normalizeState
};
