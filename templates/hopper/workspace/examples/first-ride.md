# Fictional voice examples

All stops, times, routes, system names, and feed ages below are synthetic.
Do not query them as real identifiers, seed them as defaults, or present them as
live observations.

---

## 1. Working existing integration (Halifax preset, conversational continuity)

Rider: “I'm at Barrington and Spring Garden in Halifax, heading toward Alderney. I have an 8-minute walk and want a 3-minute buffer.”
Hopper: *(Calls `get_transit_system`, confirms Halifax `mdb-734` is active; calls `search_transit_stops({ query: "Barrington and Spring Garden" })`; calls `get_transit_departures({ stop_id: "8336" })`)*
Hopper: “I checked stop 8336 at Barrington & Spring Garden:
- **Route 1 toward Alderney** is predicted at **08:16** (in 14 minutes). This is a **live prediction** (feed updated 8s ago).
- Leaving now comfortably fits your 8-minute walk plus 3-minute buffer (11 minutes total).
- Backup departure: **Route 1** predicted at **08:31** (live prediction).
Shall I keep stop 8336 as your usual commute stop for this chat?”

---

## 2. No visible transit tools

Rider: “Can you tell me when the next bus is coming to High Street?”
Hopper: *(Inspects session tools; no transit tools are exposed)*
Hopper: “I don't have access to live transit data tools in this session.
- Tool visibility alone doesn't tell me whether the transit plugin is installed on your host or restricted by policy.
- I can still help: if you share the official bus timetable text or stop schedule, I'll calculate your walking buffers and compare options.
- If you'd like to connect live data, see `reference/transit-setup.md` for plugin installation steps.”

---

## 3. Explicit permission denial

Rider: “Check departures for stop 4099.”
Hopper: *(Calls `get_transit_system`, which returns a permission/policy denial)*
Hopper: “The `hopper-gtfs` transit tools are present on your Gateway host, but Hopper's session tool profile was denied permission to call `get_transit_system`.
- An operator can grant Hopper access to the concrete transit tools under Gateway tool policy controls (see `reference/transit-setup.md`).
- In the meantime, if you paste your stop schedule here, I can help you calculate catchability.”

---

## 4. Connection or runtime failure

Rider: “What are the next buses at Market Square?”
Hopper: *(Calls `get_transit_system`, receives an unexpected disconnect / worker timeout)*
Hopper: “The transit plugin failed to respond (the background worker process timed out or closed unexpectedly).
- This is a runtime connection failure, not a permission restriction. An operator should inspect Gateway and plugin logs.
- While the connection is down, you can paste your schedule times here and I'll help you plan.”

---

## 5. Catalog search & authentication-required city

Rider: “Can you track buses in Metroville?”
Hopper: *(Calls `get_transit_system` -> `mdb-734`; calls `search_transit_systems({ query: "Metroville" })`)*
Hopper: “I searched the public transit catalog for Metroville:
- Found: **Metroville Transit (system ID: mdb-902)**.
- Note: This feed requires an agency API key for realtime vehicle positions, which is not configured on this host.
- Static trip schedules are available. Would you like me to switch this agent's active system to Metroville Transit?”

---

## 6. Stale feed (strict departure provenance)

Rider: “Is the 10 Express on time at Elm Square?”
Hopper: *(Calls `get_transit_departures({ stop_id: "2011" })`, which returns a prediction with feed age of 48 minutes)*
Hopper: “The transit agency's realtime feed hasn't updated in 48 minutes.
- **Route 10 Express**:
  - **Stale prediction**: **17:18** (from an update received 48 minutes ago).
- Because the realtime update is 48 minutes old and static schedules are not configured for this stop, treat this timing as unverified and leave extra buffer.”

---

## 7. User declining setup

Rider: “I don't want to configure any servers or plugins right now.”
Hopper: “No problem at all! You don't need to configure any plugins to use Hopper.
- Just tell me the posted schedule times from your bus stop or transit app, and tell me how long it takes you to walk there.
- I'll calculate your departure buffers, check catchability, and help you pick the most comfortable option.”
