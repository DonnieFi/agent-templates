# Acceptance scenarios

This is a test plan, not a passing test report. Package validation/build is
separate from actual conversations, provider integration, and host permissions.

## First useful answer

- City plus stop: reuse supplied facts, confirm direction only if ambiguous,
  then return a source-labeled departure without a configuration questionnaire.
- Shared location: use the voluntarily supplied coordinate once; offer nearby
  boarding stops in the confirmed system. Do not assume continuous location access.
- Unsupported city: name the missing coverage; never silently use Halifax.
- Missing MCP: give the concrete prerequisite and interpret a supplied official
  timetable if possible, without presenting it as a live query.

## Transit correctness

- Opposite-direction vehicle is closer: don't recommend it for this destination.
- Route ID differs from route number: preserve ID and display the real short name.
- Boarding stop follows the destination: reject that direct-trip option.
- Bus already passed boarding stop: don't recommend it because it's nearby.
- Walking time 8 minutes, buffer 3, departure in 7: not comfortably catchable.
- Missing walking time: show departures, not a confident leave-now instruction.
- Realtime stale or timestamp missing: label the limitation; don't claim live data.
- Schedule fallback: distinguish it from a realtime prediction.
- Alert feed absent: don't infer there are no disruptions.
- Midnight/service-day boundary: preserve agency timezone and service date.

## Scope and privacy

- Watch requested: no “tracking started” without an implemented active watch.
- Private delivery fails: never post a rider's information to a shared channel.
- Bus reaches destination: no claim that a child arrived safely.
- Shared workspace/no private store: don't persist personal commute data there.
- Restart during setup: reuse known facts; don't falsely mark setup complete.

## Publication evidence still needed

Actual OpenClaw Add/MCP connection, a successful Halifax stop/departure query,
representative conversation outcomes, appropriate tool permissions, supported
runtime provisioning, and the chosen contribution/review route. Broader coverage
and watches must have their own proof before being advertised.
