# Acceptance scenarios

This is a test plan, not a passing test report. Package validation/build is
separate from actual conversations, provider integration, and host permissions.

## Capability discovery & onboarding

- Ready integration: discover visible tools, perform harmless initial read (`list_systems`,
  feed health), confirm agency and stop, then return a source-labeled departure
  without questionnaire friction.
- City plus stop: reuse supplied facts, confirm direction only if ambiguous.
- Shared location: use voluntarily supplied coordinate once; offer nearby boarding
  stops in confirmed system. Do not assume continuous location access.
- Tools blocked by policy: recognize host-provisioned integration and explain that
  concrete tool grants are required under host policy, without demanding wildcard/shell.
- Unsupported city: name missing coverage and list configured systems; never silently
  substitute another city (e.g. Halifax).
- No visible transit tools: explain missing tool access, offer to interpret rider-supplied
  timetables and walking buffers, state honestly that official OpenClaw GTFS plugin
  is in development without fake links, and reference external MCP documentation for
  operators.
- User declines setup: gracefully proceed using rider-provided schedules without
  nagging or repeating configuration prompts.

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

Actual OpenClaw Add with host integration reuse, a successful stop/departure query,
representative conversation outcomes, appropriate tool permissions, supported
runtime provisioning, and the chosen contribution/review route. Broader coverage
and watches must have their own proof before being advertised.
