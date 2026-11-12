# Acceptance scenarios

This is a test plan, not a passing test report. Package validation/build is
separate from actual conversations, provider integration, and host permissions.

---

## 1. Conversational continuity & capability onboarding

- **Reusing supplied facts**: Rider opens with starting location and destination;
  Hopper verifies tools silently, checks `get_transit_system`, and asks only for
  missing details without restarting the interview.
- **Ready integration & preset reuse**: When `get_transit_system` returns active
  Halifax preset `mdb-734`, Hopper reuses it directly without prompting to re-select
  an agency.
- **Agency search & user confirmation**: Rider requests a new city; Hopper searches
  via `search_transit_systems`, presents candidates, explains any authentication
  requirements, and requires explicit user confirmation before calling `use_transit_system`.
- **Explicit permission denial**: When a tool call returns a policy denial, Hopper
  explains the observed restriction and notes the concrete tool grants needed under
  host policy, without demanding wildcard or shell permissions.
- **Connection or runtime failure**: When a tool call encounters a transport drop,
  timeout, or crash, Hopper explains the plugin did not respond and points to
  runtime logs, without prescribing permissions without evidence.
- **No visible transit tools**: Hopper explains access is unavailable, does not
  infer whether software is installed or blocked on the host, offers timetable help,
  and refers to `reference/transit-setup.md`.
- **User declines setup**: Gracefully proceed using rider-provided schedules without
  nagging or repeating configuration prompts.

---

## 2. Transit correctness & departure provenance

- **Live departures**: `get_transit_departures` returns departures with ISO timestamps,
  `trip_headsign`, stop sequence, feed age, and timezone. Labeled as live predictions.
- **Stale prediction**: Realtime feed is >15–30 minutes old. Verify Hopper reports
  departure as a stale prediction with age, and does not claim static schedule data
  unless actually returned.
- **Midnight & service-day boundary**: Agency timezone is preserved; departures
  crossing midnight are not compared by raw clock strings without service-date awareness.
- **Stop sequence verification**: Destination must follow boarding stop on the trip.
- **Walking time 8 minutes, buffer 3, departure in 7**: Not comfortably catchable.
- **Rounding uncertainty**: Account for rounded relative minutes and elapsed query time;
  for tight margins inside uncertainty, recommend the later option.
- **Missing walking time**: Show departures, not a confident leave-now instruction.

---

## 3. Scope and privacy

- **No alert queries**: Disruption alert feeds are not queried; lack of alerts is
  not an all-clear.
- **No journey planning**: Direct boarding-stop departures only.
- **No background watches**: On demand only; no "tracking started" promises.
- **Private delivery & storage**: Only persist personal commute preferences in a
  verified private store. No personal records in shared files.

---

## 4. Bundled Plugin Integration & Acceptance Criteria

### Integration Evidence
- **Authoritative repository**: `https://github.com/DonnieFi/openclaw-gtfs`
- **Source commit**: `ba65c1d` (commit `ba65c1d4287841ee1a18ea0b3f15f6fc10ca8b99`)
- **Package artifact**: `hopper-gtfs-plugin-0.1.0-dev.3.tgz` (SHA-256: `c51cbc87d5f94e382940be0044b412da539a6abb9323943174f6507c58e98c7d`)
- **Staged path**: `templates/hopper/plugins/gtfs/` containing compiled `dist/`,
  `package.json`, `openclaw.plugin.json`, `README.md`, and `LICENSE`.

### Disposable Gateway Acceptance Gate
When testing on a disposable Gateway:
1. Fresh disposable Gateway environment with clean state and separate port.
2. No pre-existing `gtfs-mcp` binary or `HOPPER_GTFS_CONFIG` environment variable.
3. Add Hopper template through normal source and capability consent.
4. Verify plugin dependencies (`csv-parse`, `gtfs`, `gtfs-realtime-bindings`, `better-sqlite3`, `typebox`, `yauzl`) install cleanly into the Gateway environment.
5. Verify all six native tools register under `profile: minimal`.
6. Complete end-to-end conversation: choose Halifax -> confirm boarding stop -> obtain real departure answer.
7. Cold restart: verify system selection survives Gateway restart.
