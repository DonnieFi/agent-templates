# Meals and tutor v1

Two Hopper-shaped packages. Each one is a template you can Add on its own, with the plugin source in its own repository. Family Pack is optional. This document is the v1 contract. It does not install an agent, vendor a plugin build, or change `oc-family-pack`.

## Directories

Four new directories, matching `openclaw-gtfs` plus `templates/hopper/`:

| Path | What it is |
|---|---|
| `/mnt/adata/opt/openclaw-meals` | Meals plugin source |
| `/mnt/adata/opt/agent-templates/templates/meals` | Meals template: persona, skill, and a pinned plugin build |
| `/mnt/adata/opt/openclaw-tutor` | Tutor plugin source |
| `/mnt/adata/opt/agent-templates/templates/tutor` | Tutor template: persona, skill, and a pinned plugin build |

The plugin repository is the source of truth. The template vendors a pinned build only after that plugin's tests pass. Neither package lists Family Pack under `requiresPlugins`. A skill calls a Family Pack tool only after it sees that tool.

Tool names are prefixed by package, including setup. Meals and the tutor can both be granted to one agent, such as Bernie, and OpenClaw keeps one tool list per agent.

Each template uses the minimal tool profile plus its own tools in `alsoAllow`. It does not list `family_members` or `family_schedule`. Those stay available when Bernie, or the host policy, grants them.

## Shared rules

- Setup is a conversation in the template's `BOOTSTRAP.md`. It asks only for the facts that package needs.
- No Discord, channel, routing, or delivery questions.
- Nothing is posted to a channel. A weekly meal suggestion is saved and returned by `get_meals` on a later turn. A study guide is generated when someone talks to the tutor inside the two-day window, then returned again until the assessment date passes.
- Storage is the plugin's agent-scoped store. The template ships no meals, students, postal codes, store names, or syllabi.
- A missing Family Pack install leaves the template useful. A missing calendar or postal code leaves the rest of that template useful.
- Confirm a write with the person who is talking. When `family_members` is visible, the agent can ask a parent in chat. That roster read is not Family Pack's approval gate, and the plugin does not enforce it.
- Proof is plugin tests with fixtures, then `openclaw templates validate`, `dev`, `inspect`, and `build`. No live Add, no live flyer call, and no live calendar call in that proof.

## Meals

The job is a week of dinners, a grocery list, and flyer matches for those items.

### In v1

- Remember meals for this agent: day, meal, dish, notes.
- Grocery list: add, remove, and show.
- Setup asks whether they have a postal code for flyer search, then which stores to watch. Both can be skipped. There is no default postal code and no default store list.
- Track flyer deals for the current grocery list and for ingredients named on the saved meal plan. `search_flyer_deals` answers one item. A watch check covers the saved list and meal ingredients.
- Suggest a week of meals from what is already planned, what is on the list, and any flyer hits. The suggestion is saved. It is not sent anywhere.
- Meal changes wait for a yes from the person talking.

### Tools

`get_meals`, `set_meal`, `delete_meal`, `get_grocery_list`, `add_grocery_item`, `remove_grocery_item`, `search_flyer_deals`, `check_flyer_watch`, `get_meals_setup`, `save_meals_setup`, `save_week_suggestion`.

`get_meals` returns the saved plan and any pending week suggestion from `save_week_suggestion`. `get_meals_setup` reports postal code present or absent, and whether stores are set. It does not return the postal code in full in logs or template files.

### Left out

Spoonacular and any other recipe API. Standing sale watches beyond the grocery list and planned meals. Discord delivery. A Family Pack page, brief line, or schema change.

### With Family Pack

When `family_members` is visible, the agent can ask a parent in chat before a shared meal change. The meals plugin still owns the plan and the list, and it does not run an approval gate.

## Tutor

The job is to watch for a test or quiz, prepare a study guide two days ahead, and help search a topic. The tutor teaches. It does not hand over a finished assignment.

### In v1

- Setup asks whether a calendar is already available. The skill looks for a visible calendar tool, including Family Pack's `family_schedule`. It does not install one.
- If no calendar tool is visible, setup finishes and the agent reminds them once that the two-day study guide needs a calendar. Topic search and hand-entered test dates still work.
- When `family_schedule` is the calendar tool, call it with `days: 7` and no `query`. Without `query`, `days` defaults to 1. With `query`, every word must appear in the title, so a keyword such as `test quiz exam` matches nothing. The skill reads the returned sections and looks for test, quiz, and exam locally. The calendar remains the date authority. The tutor does not create calendar events in v1.
- A study guide is generated on demand. When someone talks to the tutor inside the two-day window, `get_due_study_guides` builds the guide from saved topic notes, stores it, and returns it. Later calls return that same guide until the assessment date passes. v1 has no background scan and no cron.
- Help search topics against saved notes. Course rules, such as whether to cite an assistant, live in those notes. A new outline is saved only after the person confirms. When `family_members` is visible, the agent asks a parent in chat before saving a shared or school outline. That question is not an approval gate.

### Tools

`get_tutor_setup`, `save_tutor_setup`, `list_topics`, `save_topic`, `search_topics`, `list_assessments`, `save_assessment`, `get_due_study_guides`.

`list_assessments` merges hand-entered dates with calendar items when a calendar tool is visible. `save_assessment` replaces an existing hand-entered date. `get_due_study_guides` is the only study-guide read and write: it generates inside the two-day window and returns the stored guide until the date passes.

### Left out

Discord delivery. A background scan or cron. Automatic calendar creation. A separate study-guide save tool. A second student database inside Family Pack. Copying a private household syllabus into the package.

### With Family Pack

`family_schedule`, called with `days: 7` and no `query`, supplies the week when it is visible. The tutor plugin still owns topics, notes, and study guides. The template's `alsoAllow` list does not include it.

## Not in this v1

Oura and homelab watch stay later. They would follow the same four-directory shape when they start.
