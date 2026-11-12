---
name: hopper-transit
description: Discover transit capabilities, find stops, check live or scheduled departures, and compare catchable direct transit options using configured GTFS tools.
---

# Transit with Hopper

Use for stop lookup, route/direction questions, departures, disruptions, and
public vehicle positions. This skill uses existing transit data tools; it does not
implement an internal GTFS parser, alter host configurations, or run background
watches.

## 1. Capability Discovery & Evidence-Based Verification

1. **Discover available tools**:
   Inspect the tools exposed in the current session. Compatible transit integrations
   may expose tools under the `hopper-transit__` namespace or un-prefixed names:
   - `list_systems`
   - `search_stops`
   - `find_nearby_stops`
   - `get_stop`
   - `get_arrivals`
   - `list_routes`
   - `get_route`
   - `get_alerts`
   - `get_vehicles`
   - `get_trip`
   - `get_feed_health`
   Match tools by their function schemas and parameters rather than assuming a
   rigid transport prefix.
2. **Diagnose Access vs. Connection Failures Separately**:
   - **Explicit permission denial**: If a tool call explicitly fails with a policy
     rejection or permission error, explain the observed restriction and note that
     an operator can grant the concrete tool names in Gateway tool policy.
   - **Connection or runtime failure**: If a tool call fails with a transport drop,
     timeout, connection error, or runtime crash, explain that the integration did
     not respond. Do not prescribe additional permissions without evidence; direct
     the operator to runtime logs.
   - **No visible compatible tools**: If no transit tools appear in the session,
     state that live tool access is unavailable. Do not claim software is missing,
     installed, or policy-blocked solely from invisible tools.
   - **Tools responding**: If tools respond, proceed with a harmless initial read.
     Do not request shell access or wildcard tool grants.
3. **Harmless Initial Read**:
   When tools are visible, call `list_systems` to verify connectivity and retrieve
   configured agency system IDs. Check `get_feed_health` when supported to assess
   data freshness before making departure claims.

## 2. Resolving Stops & Directions

1. **Reuse Supplied Facts**:
   If the rider has already named their starting point, destination, stop, or
   preferences, use them immediately. Ask only for missing facts.
2. **Match Configured System**:
   Compare the rider's requested city only against confirmed system IDs from
   `list_systems`. If ambiguous, ask a short clarifying question. Never substitute
   an unrequested city or assume global coverage.
3. **Find Stops**:
   Use `find_nearby_stops` when the rider shares a coordinate, or `search_stops`
   for a stop name or intersection. Inspect `get_stop` and `list_routes`/`get_route`
   to verify travel direction and stop sequences. Opposite-side stops are not
   interchangeable.
4. **Validate Direct Travel**:
   Confirm that the requested destination comes after the boarding stop on the
   actual trip using `get_route` or `get_trip`. These tools support direct routes,
   not complex multi-transfer journey planning; disclose that limit when relevant.

## 3. Retrieving & Interpreting Departures

1. **Departure Provenance & Data Freshness**:
   Query `get_arrivals` for the confirmed stop and check relevant `get_alerts`.
   Inspect timestamps, prediction indicators, feed health, and error fields.
   Distinguish:
   - **Fresh realtime prediction**: explicitly labeled as live with age when known
     (e.g., “live prediction, feed 14s old”).
   - **Scheduled timetable time**: obtained from actual schedule data, explicitly
     labeled as scheduled (e.g., “scheduled timetable departure”).
   - **Stale prediction**: explicitly labeled as stale with age when known
     (e.g., “stale prediction from update 48m ago”). **Never** relabel an old
     prediction as a scheduled timetable departure.
   - **Unknown / unavailable data**: when neither prediction nor schedule data is
     available, report data as unavailable rather than guessing.
   - **Fallback rule**: Only fall back to “scheduled” when a separate scheduled
     timetable value is actually available in the returned data. If a stale prediction
     differs from the scheduled timetable time, report both with their respective
     labels. Freshness unknown must not become a fresh or live claim.
   - An empty alerts response from an unconfigured alert feed does not mean there
     are no disruptions.
2. **Timezone & Midnight Boundaries**:
   Always interpret departure times in the agency timezone. Preserve service dates;
   never compare raw clock strings across midnight boundaries without service-day
   awareness.
3. **Headsign & Direction Verification**:
   In `gtfs-mcp` v1.0.2, arrival headsigns in realtime updates may name intermediate
   or terminal stops. Verify the vehicle's true direction using `get_trip.trip.trip_headsign`
   and the ordered stop list before recommending a boarding direction.
4. **Walking Time & Catchability**:
   With the rider's walking estimate and buffer:
   - Compare departures against the earliest comfortable arrival time.
   - Account for rounded relative minutes and query age; do not promise
     second-precise or tight arrival guarantees.
   - If departure timing falls within rounding uncertainty, recommend the later,
     safer option.
   - Without walking estimates, list departures without a "leave now" instruction.

## 4. Presenting Results

- Lead with route short name, destination/headsign, boarding stop, and agency-local
  time.
- Clearly label data status: **Live prediction** (with freshness if available),
  **Scheduled timetable**, or **Stale prediction** (with age).
- Include walking/buffer assumptions if provided, plus one sensible backup option.
- Vehicle positions (`get_vehicles`) show where vehicles currently are; they are
  not arrival time predictions.

## 5. Graceful Fallback & Setup Guidance

When no compatible transit tools are exposed or data is unavailable:
1. Explain what is missing (e.g. no live tool access, integration unresponsive,
   or unconfigured city feed).
2. Offer to interpret official timetable tables, schedule text, or stop listings
   provided by the rider (clearly marked as scheduled/user-supplied, never live).
3. If an integration is needed, refer to `reference/transit-setup.md` for current
   options (including the planned Hopper transit plugin and advanced operator MCP
   setup). Do not guess or invent package names or URLs.
