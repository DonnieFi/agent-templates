# Acceptance scenarios

This is a test plan, not a passing test report. Package validation/build is
separate from actual conversations, provider integration, and host permissions.

---

## 1. Conversational continuity & capability onboarding

- **Reusing supplied facts**: Rider opens with starting location and destination;
  Hopper verifies tools silently and asks only for missing details (e.g. confirming
  ambiguous stop direction), without restarting the interview.
- **Ready integration**: Discover visible tools, perform harmless initial read
  (`list_systems`, feed health), confirm agency and stop, then return a source-labeled
  departure without questionnaire friction.
- **Shared location**: Use voluntarily supplied coordinate once; offer nearby boarding
  stops in confirmed system. Do not assume continuous location access.
- **Explicit permission denial**: When a tool call returns a policy denial, Hopper
  explains the observed restriction and notes the concrete tool grants needed under
  host policy, without demanding wildcard or shell permissions.
- **Connection or runtime failure**: When a tool call encounters a transport drop,
  timeout, or crash, Hopper explains the integration did not respond and points to
  runtime logs, without prescribing permissions without evidence.
- **No visible transit tools**: Hopper explains access is unavailable, does not
  infer whether software is installed or blocked on the host, offers timetable help,
  and refers to `reference/transit-setup.md`.
- **Unsupported city**: Name missing coverage and list configured systems; never
  silently substitute another city (e.g. Halifax).
- **User declines setup**: Gracefully proceed using rider-provided schedules without
  nagging or repeating configuration prompts.

---

## 2. Transit correctness & departure provenance

- **Stale prediction differs from scheduled time**: Feed is 48m old; realtime update
  predicts 17:18, scheduled timetable is 17:15. Verify Hopper reports both with distinct
  labels (17:18 stale prediction, 17:15 scheduled timetable), recommends the scheduled
  time with extra buffer, and never relabels the 17:18 prediction as a schedule.
- **Stale prediction with no schedule available**: Realtime update is stale and no
  static timetable entry exists. Verify Hopper labels the time as a stale prediction
  and does not manufacture a scheduled timetable time.
- **Fresh realtime vs. schedule**: Clearly distinguish live vehicle predictions from
  scheduled timetable departures.
- **Midnight & service-day boundary**: Agency timezone is preserved; departures
  crossing midnight are not compared by raw clock strings without service-date awareness.
- **Opposite-direction vehicle closer**: Don't recommend it for this destination.
- **Route ID differs from route number**: Preserve ID and display the real short name.
- **Boarding stop follows destination**: Reject that direct-trip option using `get_route`/`get_trip`.
- **Bus already passed boarding stop**: Don't recommend it because it's physically nearby.
- **Walking time 8 minutes, buffer 3, departure in 7**: Not comfortably catchable.
- **Rounding uncertainty**: Account for rounded relative minutes and elapsed query time;
  for tight margins inside uncertainty, recommend the later option.
- **Missing walking time**: Show departures, not a confident leave-now instruction.
- **Alert feed absent**: Don't infer there are no disruptions.

---

## 3. Scope and privacy

- **Watch requested**: No “tracking started” without an implemented active watch.
- **Private delivery fails**: Never post a rider's information to a shared channel.
- **Bus reaches destination**: No claim that a person arrived safely.
- **Shared workspace / no private store**: Don't persist personal commute data there.
- **Restart during setup**: Reuse known facts; don't falsely mark setup complete.

---

## 4. Future Plugin Architecture Boundary & Acceptance Gate

### Architecture Boundary
- **Hopper owns**: Conversation flow, schedule/prediction interpretation, walking
  buffer calculations, and rider choices.
- **The transit plugin owns**: Runtime dependencies, public GTFS/GTFS-RT feed fetching,
  SQLite database storage/caching, and structured transit results.
- **Tool grants**: Exact native tool names and concrete grants must be agreed and
  verified together. Schema matching cannot expose tools excluded by host policy.
  Speculative aliases, wildcard grants, and imaginary packages must not be used.

### Desired Plugin Output Semantics (Target Specification)
A future transit plugin should return:
- Opaque, stable identifiers for systems, routes, trips, and stops.
- Actual stop sequence and true `trip_headsign` (verified against trip details).
- Distinct scheduled timetable departure timestamps vs. predicted departure timestamps.
- Explicit agency timezone metadata.
- Data freshness / source observation timestamps.
- Service disruption details (distinguishing cancellations and skipped stops).
- Alert feed availability status distinctly separate from "no alerts reported".

### Eventual Integration Acceptance Gate
When a transit plugin candidate is ready, its qualification gate requires:
1. Fresh disposable Gateway environment.
2. No pre-existing `gtfs-mcp` binary or `HOPPER_GTFS_CONFIG` environment variable.
3. No inherited development `node_modules` or global packages.
4. Normal OpenClaw review and consent flow.
5. Native plugin dependency resolution and clean installation.
6. Actual Hopper tool discovery under `profile: minimal`.
7. Real Halifax stop 8336 departure query producing live and scheduled times.
8. Verified handling of stale feeds, runtime errors, unknown IDs, timezone boundaries,
   stop ordering, and missing alerts.
9. Safe reuse or clean conflict reporting if an integration already exists.

*(This gate represents future integration criteria and is not executed during this
local documentation patch).*
