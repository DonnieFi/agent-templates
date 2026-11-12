# Transit runtime setup

Hopper uses a native OpenClaw transit plugin to retrieve GTFS catalog data and
realtime departures. This document explains the bundled plugin architecture, tool
contracts, and operator verification.

---

## 1. Bundled Plugin Integration

Hopper bundles the `hopper-gtfs` plugin under `plugins/gtfs/`:
- **Package name**: `hopper-gtfs-plugin`
- **Plugin ID**: `hopper-gtfs`
- **Candidate version**: `0.1.0-dev.3`
- **Source repository**: `https://github.com/DonnieFi/openclaw-gtfs`
- **Source commit**: `ba65c1d` (commit `ba65c1d4287841ee1a18ea0b3f15f6fc10ca8b99`)
- **Package artifact SHA-256**: `c51cbc87d5f94e382940be0044b412da539a6abb9323943174f6507c58e98c7d` (`hopper-gtfs-plugin-0.1.0-dev.3.tgz`)

### Manifest Declaration
Hopper's `CLAW.md` declares the bundled plugin dependency directly:
```yaml
plugins:
  - path: plugins/gtfs
```
When an operator adds Hopper to an OpenClaw Gateway with normal review and consent,
OpenClaw installs the plugin dependencies into the gateway-managed environment.
No external MCP server (`gtfs-mcp`) or `HOPPER_GTFS_CONFIG` environment variable is
required.

---

## 2. Native Tool Contracts

The plugin exposes six native tools under `profile: minimal`:

1. **`search_transit_systems({ query, limit? })`**:
   Searches the public MobilityData catalog for agencies matching the query.
   Returns candidate IDs, locations, feed URLs, and authentication requirements.
2. **`use_transit_system({ system_id })`**:
   Validates feeds and saves the selected agency for this agent across sessions.
   *Must only be invoked after explicit user confirmation.*
3. **`get_transit_system({})`**:
   Returns the currently configured system metadata, or `null` if unconfigured.
   Halifax is included as a public preset (`mdb-734`).
4. **`search_transit_stops({ query, limit? })`**:
   Searches for stops by name or exact public stop ID.
5. **`get_transit_departures({ stop_id, route_id?, limit? })`**:
   Queries live vehicle and trip updates. Returns predicted departures with ISO
   timestamps, `trip_headsign`, stop sequence, feed age, and agency timezone.
6. **`get_transit_vehicles({ route_id?, limit? })`**:
   Queries current public vehicle locations, headings, and speeds.

### Tool Grants
Hopper declares bounded allowances in `CLAW.md`:
```yaml
tools:
  profile: minimal
  alsoAllow:
    - read
    - write
    - edit
    - search_transit_systems
    - use_transit_system
    - get_transit_system
    - search_transit_stops
    - get_transit_departures
    - get_transit_vehicles
  fs:
    workspaceOnly: true
```
Unrestricted tool profiles, shell execution, or wildcard plugin allowances are
never required or granted.

---

## 3. Onboarding & Diagnostic States

1. **Ready with Usable Coverage**:
   - `get_transit_system` returns active system (e.g. `mdb-734`).
   - Stop and departure queries succeed.
2. **Tools Responding, City Unconfigured**:
   - `search_transit_systems` finds candidate systems.
   - If a feed requires API authentication or lacks realtime updates, Hopper explains
     this limitation honestly without guessing.
3. **Explicit Permission Denial**:
   - Symptom: Tool call explicitly returns policy/permission denial.
   - Action: Operator verifies Gateway tool profile and grants Hopper access to the
     concrete tools listed above.
4. **Connection or Runtime Failure**:
   - Symptom: Tool call fails with transport drop or worker crash.
   - Action: Operator inspects Gateway and plugin logs.
5. **No Visible Compatible Tools**:
   - Symptom: Session has no transit tools exposed.
   - Action: Operator verifies plugin installation and Gateway consent. Hopper
     operates in schedule-interpretation fallback mode.

---

## 4. Boundaries & Scope

- **No alert queries**: Disruption alerts are not queried in this version.
- **No journey planning**: Direct boarding-stop departures only.
- **No background watches**: On-demand queries only; no automations or recurring jobs.
- **No scheduled timetable fallback**: If static schedule data is absent, Hopper
  does not manufacture a timetable time.
