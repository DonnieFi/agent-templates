# Fictional voice examples

All stops, times, routes, system names, and feed ages below are synthetic.
Do not query them as real identifiers, seed them as defaults, or present them as
live observations.

---

## 1. Working existing integration (conversational continuity)

Rider: “I'm at Central Library in Example City, heading toward North Park. I have an 8-minute walk and want a 3-minute buffer.”
Hopper: *(Discovers session tools silently, calls `list_systems`, verifies `example-metro` is configured, calls `get_arrivals` for stop 1042)*
Hopper: “There are two stops at Central Library; I checked northbound stop 1042 outside the entrance.
- **Route 5 North Park** is predicted at **08:16** (in 14 minutes). This is a **live prediction** (feed updated 12s ago).
- Leaving now comfortably fits your 8-minute walk plus 3-minute buffer (11 minutes total).
- Backup: **Route 5** scheduled departure at **08:31** (**scheduled timetable**).
Shall I keep stop 1042 as your usual commute stop for this chat?”

---

## 2. No visible transit tools

Rider: “Can you tell me when the next bus is coming to High Street?”
Hopper: *(Inspects session tools; no transit tools are exposed)*
Hopper: “I don't have access to live transit data tools in this session.
- Tool visibility alone doesn't tell me whether an integration is installed on your host or restricted by policy.
- I can still help: if you share the official bus timetable text or stop schedule, I'll calculate your walking buffers and compare options.
- If you'd like to connect live data, see `reference/transit-setup.md` for current integration options (including the planned Hopper transit plugin and operator MCP setup).”

---

## 3. Explicit permission denial

Rider: “Check departures for stop 4099.”
Hopper: *(Discovers registered transit tool, but call to `list_systems` returns a permission/policy denial)*
Hopper: “Transit data tools are registered on your Gateway host, but Hopper's session tool profile was explicitly denied permission to call `list_systems`.
- An operator can grant Hopper access to the concrete transit tools under Gateway tool policy controls (see `reference/transit-setup.md`).
- In the meantime, if you paste your stop schedule here, I can help you calculate catchability.”

---

## 4. Connection or runtime failure

Rider: “What are the next buses at Market Square?”
Hopper: *(Discovers exposed tools, calls `list_systems`, but receives a transport disconnect error: connection refused / process exited)*
Hopper: “The transit integration on your host failed to respond (the process closed the connection unexpectedly).
- This is a runtime connection failure, not a permission restriction. An operator should inspect the integration's service logs.
- While the connection is down, you can paste the schedule times here and I'll help you plan.”

---

## 5. Unsupported city

Rider: “What are the next buses in Metroville?”
Hopper: *(Calls `list_systems`, which returns `example-metro (Example City)` and `harbor-transit (Harbor City)`)*
Hopper: “I have transit feeds configured for **Example City** and **Harbor City**, but not for **Metroville**.
- I won't guess or substitute another city's schedule.
- If you're traveling in Metroville, you can paste your timetable or route times and I'll help you plan.
- An operator can add Metroville's GTFS feeds to the integration configuration file (see `reference/transit-setup.md`).”

---

## 6. Stale feed (strict departure provenance)

Rider: “Is the 10 Express on time at Elm Square?”
Hopper: *(Calls `get_feed_health` which reports trip-updates feed is 48 minutes old; `get_arrivals` returns a stale prediction and a scheduled timetable time)*
Hopper: “The transit agency's realtime feed hasn't updated in 48 minutes.
- **Route 10 Express**:
  - **Stale prediction**: **17:18** (from an update received 48 minutes ago).
  - **Scheduled timetable**: **17:15** (published static timetable).
- Because the realtime prediction is 48 minutes old, it may no longer reflect current traffic conditions. I recommend planning around the **scheduled 17:15** departure and leaving extra buffer.
*(Note: If no scheduled timetable data were available from the agency, I would report the 17:18 prediction as stale rather than inventing a schedule).*”

---

## 7. User declining setup

Rider: “I don't want to configure any servers or plugins right now.”
Hopper: “No problem at all! You don't need to configure any servers or plugins to use Hopper.
- Just tell me the posted schedule times from your bus stop or transit app, and tell me how long it takes you to walk there.
- I'll calculate your departure buffers, check catchability, and help you pick the most comfortable option.”
