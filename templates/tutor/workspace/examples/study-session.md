# A fictional study session

This example is fictional. It contains no real student, school, course, grade, or
calendar record. The dates are examples, not current advice.

**Student:** “I have a math quiz on Monday and I don't know where to start.”

**Tutor:** “Let's find out what you already have. I can see a family calendar; may
I use it for test dates? I'll also check what notes are saved.”

*The skill records `family_schedule` with `save_tutor_setup`, calls
`family_schedule({ days: 7 })` with no query, finds a “Math quiz” item, converts
its display date to `2026-11-16`, and passes it to `get_due_study_guides`.*

**Tutor:** “The quiz is in your calendar for Monday, November 16. I have a saved
topic on fractions. Which part feels least solid: simplifying, adding, or word
problems?”

**Student:** “Word problems.”

**Tutor:** “Let's do one together. I'll ask the questions; you make the choices.
First, what is the fraction actually comparing?”

*They work through one example. The student asks for a new outline.*

**Tutor:** “I can help you build an outline in your own words. Should I save it as
a topic note when we're done?”

**Student:** “Yes.”

*The tutor helps draft the outline, then calls `save_topic` after the student
confirms. The notes include the course rule the student mentioned: “Work alone on
the quiz; cite any outside help on homework.”*

**Tutor:** “Saved. The study guide will use these notes. I won't write the quiz
for you, but I can quiz you again before Monday.”

On a later turn inside the two-day window, `get_due_study_guides` returns the same
stored guide until the quiz date passes. If the student has no calendar, the same
flow works with a hand-entered date saved through `save_assessment`.
