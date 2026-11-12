---
name: hopper-transit
description: Discover transit capabilities, find stops, check live or scheduled departures, and compare catchable direct transit options using configured GTFS tools.
---

# Transit with Hopper

Use for stop lookup, route/direction questions, departures, disruptions, and
public vehicle positions. This skill uses existing transit data tools; it does not
implement an internal GTFS parser, alter host configurations, or run background
watches.

## 1. Capability Discovery & Verification

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
2. **Permission & Accessibility Boundaries**:
   If tools are not visible or return permission errors, do not assume software is
   missing. It may be disabled, disconnected, or restricted by host tool policy.
   Explain the boundary clearly without requesting shell commands or wildcard
   permissions. If an integration uses custom names, note that operator grants
   are required.
3. **Harmless Initial Read**:
   When tools are visible, call `list_systems` to verify connectivity and retrieve
   configured agency system IDs. Check `get_feed_health` when supported to assess
   data freshness before making departure claims.

## 2. Resolving Stops & Directions

1. **Match Configured System**:
   Compare the rider's requested city only against confirmed system IDs. If
   ambiguous, ask a short clarifying question. Never substitute an unrequested
   city or assume global coverage.
2. **Find Stops**:
   Use `find_nearby_stops` when the rider shares a coordinate, or `search_stops`
   for a stop name or intersection. Inspect `get_stop` and `list_routes`/`get_route`
   to verify travel direction and stop sequences. Opposite-side stops are not
   interchangeable.
3. **Validate Direct Travel**:
   Confirm that the requested destination comes after the boarding stop on the
   actual trip using `get_route` or `get_trip`. These tools support direct routes,
   not complex multi-transfer journey planning; disclose that limit when relevant.

## 3. Retrieving & Interpreting Departures

1. **Query Arrivals & Feed Health**:
   Query `get_arrivals` for the confirmed stop and check relevant `get_alerts`.
   Inspect timestamps, prediction indicators, and error fields.
   - Realtime predictions must be explicitly labeled as live.
   - When realtime updates are missing, stale, or unavailable, clearly label the
     time as scheduled.
   - An empty alerts response from an unconfigured alert feed does not mean there
     are no disruptions.
2. **Headsign & Direction Verification**:
   In `gtfs-mcp` v1.0.2, arrival headsigns in realtime updates may name intermediate
   or terminal stops. Verify the vehicle's true direction using `get_trip.trip.trip_headsign`
   and the ordered stop list before recommending a boarding direction.
3. **Walking Time & Catchability**:
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
- Clearly label data status: **Live prediction** (with freshness if available) vs.
  **Scheduled timetable**.
- Include walking/buffer assumptions if provided, plus one sensible backup option.
- Vehicle positions (`get_vehicles`) show where vehicles currently are; they are
  not arrival time predictions.

## 5. Graceful Fallback & Setup Guidance

When no compatible transit tools are exposed or the feed is unavailable:
1. Explain what is missing (no live tool access or unconfigured city feed).
2. Offer to interpret official timetable tables, schedule text, or stop listings
   provided by the rider (clearly marked as scheduled/user-supplied, never live).
3. If an OpenClaw GTFS plugin is in development or unpublished, state honestly
   that guided plugin installation is not yet available. Never link to unverified
   or imagined plugin packages.
4. For advanced operators, reference the external `gtfs-mcp` recipe in
   `reference/transit-setup.md`.
