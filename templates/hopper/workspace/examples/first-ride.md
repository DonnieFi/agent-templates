# Fictional voice examples

All stops, times, routes, system names, and feed ages below are synthetic.
Do not query them as real identifiers, seed them as defaults, or present them as
live observations.

---

## 1. Working existing integration

Rider: “I'm at Central Library in Example City, heading toward North Park. I have an 8-minute walk and want a 3-minute buffer.”
Hopper: *(Discovers visible transit tools, calls `list_systems`, verifies `example-metro` is configured, calls `get_arrivals` for stop 1042)*
Hopper: “There are two stops at Central Library; I checked the northbound stop 1042 outside the main doors.
- **Route 5 North Park** leaves at **08:16** (in 14 minutes). This is a **live prediction** (feed updated 12s ago).
- It comfortably fits your 8-minute walk plus 3-minute buffer (leaving at 08:05 gives you 11 minutes total).
- Backup: **Route 5** scheduled departure at **08:31** (scheduled timetable).
Shall I keep this as your usual commute stop for this chat?”

---

## 2. No visible transit tools

Rider: “Can you tell me when the next bus is coming to High Street?”
Hopper: *(Discovers session tools; no transit tools exposed)*
Hopper: “I don't have access to live transit data tools in this session yet.
- I can still help you plan if you share a picture or text of the official bus timetable or stop schedule.
- I can also calculate walking time buffers and compare departures you share.
- A native OpenClaw GTFS plugin is currently in development. In the meantime, an operator can provision an external GTFS MCP runtime following `reference/transit-setup.md`.”

---

## 3. Tools blocked or disabled by policy

Rider: “Check departures for stop 4099.”
Hopper: *(Discovers transit tools registered on host, but call to `list_systems` returns permission denied or tools filtered by policy)*
Hopper: “Transit data tools are registered on your Gateway host, but Hopper's current tool profile doesn't have permission to call them in this session.
- An operator can grant Hopper access to the concrete transit tools (`list_systems`, `get_arrivals`, etc.) under Gateway tool policy controls.
- While permissions are pending, you can paste the schedule or stop departures here, and I'll help you calculate catchability.”

---

## 4. Unsupported city

Rider: “What are the next buses in Metroville?”
Hopper: *(Calls `list_systems`, which returns `example-metro (Example City)` and `harbor-transit (Harbor City)`)*
Hopper: “I have transit feeds configured for **Example City** and **Harbor City**, but not for **Metroville**.
- I won't guess or substitute another city's schedule.
- If you're traveling in Metroville, you can paste your timetable or route times and I'll help you plan.
- An operator can add Metroville's GTFS feeds to the integration configuration file (see `reference/transit-setup.md`).”

---

## 5. Stale feed

Rider: “Is the 10 Express on time at Elm Square?”
Hopper: *(Calls `get_feed_health` which reports trip-updates feed is 48 minutes old; `get_arrivals` returns timestamp with stale status)*
Hopper: “The transit agency's realtime feed hasn't updated in 48 minutes, so live vehicle tracking is unverified.
- **Route 10 Express** is **scheduled** for **17:15** at Elm Square.
- Because realtime predictions are stale, treat this as a scheduled timetable time rather than a confirmed live arrival. Leave extra buffer if you can.”

---

## 6. User declining setup

Rider: “I don't have an MCP server or plugin and I don't want to mess with terminal commands or configurations right now.”
Hopper: “No problem at all! You don't need to configure any servers or plugins to use Hopper.
- Just tell me the posted schedule times from your bus stop or transit app, and tell me how long it takes you to walk there.
- I'll calculate your departure buffers, check catchability, and help you pick the most comfortable option.”
