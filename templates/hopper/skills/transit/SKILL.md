---
name: hopper-transit
description: Discover transit capabilities, manage agency selection, search stops, and retrieve real-time departures and vehicle locations using the hopper-gtfs native plugin.
---

# Transit with Hopper

Use for transit system selection, stop lookup, departure queries, and public
vehicle positions. This skill uses the native `hopper-gtfs` plugin tools; it does
not implement an internal GTFS parser, alter host configurations, or run background
watches.

## 1. Native Tool Discovery & System Verification

1. **Verify Exposed Tools**:
   Check for the six native transit tools declared by `hopper-gtfs`:
   - `search_transit_systems`
   - `use_transit_system`
   - `get_transit_system`
   - `search_transit_stops`
   - `get_transit_departures`
   - `get_transit_vehicles`
2. **Access & Connection Diagnostics**:
   - **Explicit permission denial**: If a tool call fails with a policy rejection,
     explain that an operator must grant the concrete tool in Gateway tool policy.
   - **Connection or runtime failure**: If a call fails with a transport drop or
     process exit, explain that the plugin did not respond; direct to runtime logs.
   - **No visible compatible tools**: Explain that live transit tools are unavailable;
     distinguish missing installation from policy filtering without guessing.
3. **Read Current Selection**:
   Call `get_transit_system` first. If a system is already selected and matches the
   rider's area (e.g. built-in Halifax preset `mdb-734`), reuse it directly. Do
   not repeatedly reconfigure an already working selection.

## 2. System Selection & Confirmation

1. **Search Systems**:
   If no system is configured or the rider travels in another city, call
   `search_transit_systems({ query: "<city or agency>" })`.
2. **Explain Unsupported or Auth-Required Feeds**:
   If a matching candidate requires private API keys or lacks public GTFS-RT
   endpoints, explain that limitation honestly.
3. **User Confirmation Required**:
   Always obtain user confirmation before calling `use_transit_system({ system_id })`,
   as this choice sets the active agency across sessions for this agent.

## 3. Resolving Stops & Departures

1. **Find Stops**:
   Call `search_transit_stops({ query: "<stop name or ID>" })`. Review returned
   stops and verify direction. Opposite-side stops are not interchangeable.
2. **Query Departures**:
   Call `get_transit_departures({ stop_id: "<id>", route_id?: "<route>" })`.
   The plugin returns predicted departure timestamps (ISO format), route short name,
   `trip_headsign`, stop sequence, feed age, and agency timezone.
3. **Interpret Provenance & Freshness**:
   - **Live prediction**: Departure timestamps based on fresh realtime vehicle/trip
     updates. State the feed age when provided.
   - **Stale prediction**: If feed age is elevated (e.g. >15–30 minutes), explicitly
     label the departure as stale with its age. Never relabel a stale prediction as
     a scheduled timetable time.
   - **Missing schedule / unavailable**: If no departures are returned or static
     timetables are absent, report data as unavailable rather than inventing times.
4. **Walking Time & Buffer**:
   With the rider's walking estimate and buffer:
   - Compare departures against the earliest comfortable arrival time.
   - Account for rounded relative minutes and elapsed query time; do not promise
     second-precise or tight arrival guarantees.
   - If departure timing falls within rounding uncertainty, recommend the later,
     safer option.
   - Without walking estimates, list departures without a "leave now" instruction.

## 4. Vehicle Positions

Call `get_transit_vehicles({ route_id?: "<route>" })` to view current vehicle
coordinates and speeds. Vehicle positions show where buses currently are; they are
not arrival time predictions.

## 5. Non-Implemented Boundaries

- **No alert queries**: Disruption alert feeds are not queried in this version.
  An absence of alerts does not mean there are no delays.
- **No journey planning**: Hopper queries direct departures from a boarding stop,
  not multi-transfer itineraries.
- **No background watches**: This version is strictly on-demand. Do not promise
  notifications or ongoing tracking.
