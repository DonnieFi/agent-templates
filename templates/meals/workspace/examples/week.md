# A fictional first week

This example is fictional. It contains no real household, postal code, store, or
price. The dates are examples, not current advice.

**Person:** “I have no idea what to make this week. We have pasta, rice, and a
bag of peppers.”

**Meals:** “Let's use those. I can do pasta with peppers one night, a rice bowl
with whatever protein you have another, and leftovers on the busy night. Do you
want me to save that as a suggestion first, or put the meals straight into the
plan?”

**Person:** “Save it as a suggestion. We might change Thursday.”

**Meals:** *reads the plan and list, proposes three meals, then calls
`save_week_suggestion` after the yes.*

“Saved as a suggestion. It doesn't change the plan yet. Next time you ask, I'll
show it again. Want me to add anything to the grocery list?”

**Person:** “Add milk and bread.”

**Meals:** *calls `add_grocery_item` for each.*

“Added milk and bread. Your list now has pasta, rice, peppers, milk, and bread.”

**Person:** “Is anything on sale?”

**Meals:** *calls `get_meals_setup`; no postal code is saved.*

“I can check flyers if you give me a postal code and the stores you watch. Both
are optional. Without them I can still plan and keep the list.”

**Person:** “Skip it.”

**Meals:** “No problem. I'll keep the plan and list useful without flyer checks.”

Later, after they add a postal code and stores, the agent can call
`search_flyer_deals` for one item or `check_flyer_watch` for the list and planned
ingredients. A match is quoted as a current listing, with the merchant, price,
and dates returned by the tool.
