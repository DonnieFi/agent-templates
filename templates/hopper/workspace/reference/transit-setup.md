# Transit runtime setup

Hopper relies on an external transit integration to retrieve GTFS schedule and
realtime feeds. This document explains what Hopper bundles, how existing
integrations are discovered, and the supported setup paths.

---

## 1. Responsibilities: Template vs. Integration

- **What Hopper bundles**:
  - Conversational persona, onboarding instructions, and operating rules.
  - Bundled transit workflow skill (`skills/transit`).
  - Reference departure presentation layouts, setup guides, and fictional examples.
- **What a transit integration supplies**:
  - The runtime executing GTFS queries (`list_systems`, `get_arrivals`, etc.).
  - Network connections to agency GTFS static zip feeds and GTFS-RT protobuf endpoints.
  - Local caching and SQLite database management.

Hopper does not bundle an internal GTFS engine or hardcode an unconditional MCP
server in its manifest. This avoids broken installations or duplicate servers.
This package currently bundles no transit runtime; a clean-host Template Add
alone does not produce live departures until an integration path below is satisfied.

---

## 2. Integration Paths

### Path A: Reusing an Existing Host Integration (Recommended)
If the host Gateway already has a compatible GTFS integration or MCP server
configured:
1. Hopper inspects exposed tools in the session (`list_systems`, `search_stops`,
   `get_arrivals`, etc.).
2. Tools may be exposed under the `hopper-transit__` namespace or un-prefixed.
3. If tools are visible and responding, Hopper reuses the existing connection
   without modifying settings or creating duplicate servers.
4. **Tool permissions**: Hopper runs with `profile: minimal`. If the host integration
   uses a custom prefix or names not in Hopper's allowlist, the operator must grant
   those concrete tool permissions in the Gateway tool policy. Wildcard allowances
   or unrestricted shell access must not be used.

### Path B: Planned Hopper Transit Plugin
A native transit plugin is planned to provide a packaged, guided installation
experience.
- **Current status**: In planning and early development; not yet published.
- **Availability**: Guided plugin installation is not currently available. Do not
  look for, guess, or invent a plugin package name, version, or ClawHub URL.
- **Packaging note**: Recent OpenClaw versions (including `2026.11.3 (9cb2b23)`)
  support bundled plugin paths through native installation and review, so registry
  publication on ClawHub is not strictly required for an initial local testing
  candidate. However, compatibility depends on the exact receiving OpenClaw
  version. Hopper keeps `plugins: []` until a real, reviewed plugin artifact exists.

### Path C: Advanced Operator Provisioning (External GTFS MCP)
For technical operators who wish to provision an external MCP runtime manually,
the qualified upstream source is `jdamcd/gtfs-mcp` v1.0.2 (commit
`adaf2222e9f15ef2822a9c8130faaf867448f365`):
https://github.com/jdamcd/gtfs-mcp/releases/tag/v1.0.2

#### Operator Build & Verification Steps
An operator with Node 22+ (tested on Node 24.22.1) and npm can build the runtime
in a dedicated runtime directory:

1. **Clone and checkout exact source commit**:
   ```bash
   git clone https://github.com/jdamcd/gtfs-mcp.git
   cd gtfs-mcp
   git checkout adaf2222e9f15ef2822a9c8130faaf867448f365
   ```
2. **Verify source identity**:
   Confirm the commit hash matches `git rev-parse HEAD` (`adaf2222...`) and inspect
   `package.json` to confirm `"version": "1.0.2"`. (Note: `src/index.ts` has no
   CLI `--version` flag; executing the binary begins server stdio transport).
3. **Compile and install**:
   ```bash
   npm ci --ignore-scripts --no-audit --no-fund
   node node_modules/typescript/bin/tsc
   npm install --global --prefix <operator-prefix> --ignore-scripts .
   ```
4. **Verify executable resolution**:
   Ensure `<operator-prefix>/bin` is on PATH for the Gateway service account.
   Verify that `which gtfs-mcp` resolves to the installed binary in `<operator-prefix>/bin`.
5. **Verify protocol functionality**:
   Execute an MCP handshake check (e.g. `openclaw mcp probe` or stdio `initialize`
   and `tools/list` handshake) to verify that the runtime responds with the 11
   expected transit tools.

*(Note: The npm registry package `gtfs-mcp@1.0.2` returned 404. Do not use an
unverified npm or npx install command).*

#### Configuration
Create a GTFS configuration JSON file (see `reference/halifax.gtfs.example.json`
for format) identifying public transit feeds. Set the environment variable
`HOPPER_GTFS_CONFIG` pointing to this server-readable path. Register the MCP server
in Gateway settings with:
- Command: `gtfs-mcp`
- Transport: `stdio`
- Environment: `GTFS_MCP_CONFIG=${HOPPER_GTFS_CONFIG}`
- Include tools: `list_systems`, `search_stops`, `find_nearby_stops`, `get_stop`,
  `get_arrivals`, `list_routes`, `get_route`, `get_alerts`, `get_vehicles`,
  `get_trip`, `get_feed_health`.

---

## 3. Evidence-Based Diagnostic States

1. **Ready with Usable Coverage**:
   - `list_systems` returns configured agencies.
   - `get_feed_health` shows fresh updates.
   - Real departure queries succeed.
2. **Tools Responding, City Unconfigured**:
   - Symptom: `list_systems` responds, but requested city is absent.
   - Action: Operator adds the local transit agency's static and realtime feeds to the
     runtime configuration file and confirms agency timezone.
3. **Explicit Permission Denial**:
   - Symptom: Tool call explicitly returns a policy rejection or permission error.
   - Action: Operator verifies Gateway tool profile and grants Hopper permission to
     call the concrete transit tools.
4. **Connection or Runtime Failure**:
   - Symptom: Tool call fails with transport drop, timeout, or runtime exit.
   - Action: Integration did not respond. Operator inspects integration logs
     (do not diagnose as a permission problem without evidence).
5. **No Visible Compatible Tools**:
   - Symptom: Session has no transit tools exposed.
   - Action: Hopper operates in fallback mode (interprets rider-supplied timetables).
     Operator provisions an integration via Path A or Path C. Do not claim software
     is installed, missing, or blocked solely from invisible tools.

---

## 4. Future Plugin Architecture Boundary & Acceptance Gate

### Architecture Boundary
- **Hopper owns**: Conversation, persona, schedule/prediction interpretation,
  catchability calculations, and rider choices.
- **The transit plugin owns**: Runtime dependencies, public GTFS/GTFS-RT feed
  fetching, database storage/caching, and structured transit query results.
- **Tool grants**: Exact native tool names and concrete grants must be agreed and
  verified together. Schema matching cannot expose tools excluded by host policy.
  Do not introduce speculative tool aliases, wildcard grants, or imaginary packages.

### Desired Plugin Output Semantics (Target Specification)
When a future transit plugin is implemented, it should provide:
- Opaque, stable identifiers for systems, routes, trips, and stops.
- Actual stop sequence and true `trip_headsign` (verified against trip details).
- Distinct scheduled timetable departure timestamps vs. predicted departure timestamps.
- Explicit agency timezone metadata.
- Data freshness / source observation timestamps.
- Service disruption details (distinguishing cancellations and skipped stops).
- Alert feed availability status distinctly separate from "no alerts reported".

### Eventual Integration Acceptance Gate
When an end-to-end transit plugin candidate is ready, its qualification gate requires:
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
