---
name: hopper-transit
description: Find stops, check live or scheduled departures, and compare catchable direct transit options using Hopper's configured GTFS MCP tools.
---

# Transit with Hopper

Use for stop lookup, route/direction questions, departures, disruptions, and
public vehicle positions. This skill uses existing data tools; it does not
implement a GTFS engine or start background watches.

## Resolve before recommending

1. Discover the declared hopper-transit MCP tools. Transport prefixes vary; use
   actual exposed schemas, not guessed callable names. If none are visible, say
   that you cannot access the tools in this session; do not assume the server is
   missing. An operator can distinguish connection/provisioning failures from
   tool-profile or permission filtering using the ordinary MCP probe and policy
   controls. Respect denials; do not request broad permissions or bypass them.
   See reference/transit-setup.md in the workspace for the relevant prerequisite.
2. Call list_systems and use the real system ID. Match the rider's city only to
   configured systems. Ask a short question when ambiguous.
3. Use find_nearby_stops with a voluntarily shared coordinate, or search_stops
   for a name. Check get_stop and list_routes/get_route as needed for direction
   and ordered stops. Opposite-side stops are not interchangeable.
4. Verify the requested destination comes after the boarding stop on the actual
   service using get_route/get_trip as appropriate. These tools are not a general
   multi-transfer journey planner. Disclose that limitation when relevant.

## Get departures

Check get_feed_health, get_arrivals for the confirmed stop, and relevant
get_alerts. Independent reads can run together after resolving IDs. An empty
alerts response from an unconfigured feed does not establish an all-clear.

Inspect prediction/source fields, timestamps, and errors. Missing realtime
coverage means scheduled advice, clearly labeled. Stale or unknown freshness
must not become a fresh live prediction in the answer.

Use returned public route names and local times. In gtfs-mcp 1.0.2, an arrival
headsign can be the last stop named in a realtime update rather than the actual
vehicle sign; use get_trip.trip.trip_headsign and the ordered stop list to verify
the direction for a recommendation. Do not label a terminal-stop inference as a
confirmed vehicle sign. Resolve unclear direction before recommending. With
walking time and a confirmed buffer,
compare valid departures to the earliest comfortable boarding time. This runtime
returns local clock strings and rounded minutes_away, not full absolute arrival
timestamps. Treat its relative minutes as approximate, account for elapsed time
since the query, and do not make second-precise or boundary-tight promises. For a
margin inside the rounding uncertainty, offer the later option. Do not invent a
service date from a clock string. Without a walking estimate, show departures
without “leave now.”

Before saying no service exists, check direction, date, and available alerts.
Never invent a bus or substitute another city.

## Present

Lead with route/headsign, stop, and agency-local departure time. Label live
prediction versus schedule versus uncertainty. Include freshness where supported,
walking/buffer assumptions if used, relevant disruptions, and one useful backup.
Avoid dumping every vehicle or raw tool output.

For public vehicle questions use get_vehicles, but positions are not arrival
predictions. Maps links may use returned public stop/vehicle coordinates; do not
send private rider coordinates to map services without agreement.

## Watches

This version is on demand. Do not answer a watch request with “tracking started.”
Explain that no background watcher is installed, provide the current result, and
offer a further check on request.
