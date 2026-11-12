# Transit runtime setup

Hopper relies on an external transit integration to retrieve GTFS schedule and
realtime feeds. This document explains what Hopper bundles, how existing
integrations are discovered, and the supported setup paths.

---

## 1. Responsibilities: Template vs. Integration

- **What Hopper bundles**:
  - Conversational persona, onboarding instructions, and operating rules.
  - Bundled transit workflow skill (`skills/transit`).
  - Reference departure presentation formats and fictional examples.
- **What a transit integration supplies**:
  - The runtime executing GTFS queries (`list_systems`, `get_arrivals`, etc.).
  - Network connections to agency GTFS static zip feeds and GTFS-RT protobuf endpoints.
  - Local caching and SQLite database management.

Hopper does not bundle an internal GTFS engine or include an unconditional
hardcoded server declaration. This prevents broken installations or duplicate
servers when an integration is not yet provisioned.

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

### Path B: OpenClaw GTFS Plugin (In Development)
An official OpenClaw GTFS plugin is currently in development to provide a native,
guided installation experience.
- **Current status**: Not yet published on ClawHub.
- **Policy**: Do not look for, guess, or invent a plugin package name, version,
  or ClawHub URL. When published, guided installation will use normal OpenClaw
  consent and host policy controls.

### Path C: Advanced Operator Provisioning (External GTFS MCP)
For technical operators who wish to provision an external MCP runtime manually,
the qualified upstream source is `jdamcd/gtfs-mcp` v1.0.2 (commit
`adaf2222e9f15ef2822a9c8130faaf867448f365`):
https://github.com/jdamcd/gtfs-mcp/releases/tag/v1.0.2

#### Operator Build Steps
An operator with Node 22+ (tested on Node 24.22.1) and npm can build the runtime
in a dedicated directory:
```bash
git clone https://github.com/jdamcd/gtfs-mcp.git
cd gtfs-mcp
git checkout adaf2222e9f15ef2822a9c8130faaf867448f365
npm ci --ignore-scripts --no-audit --no-fund
node node_modules/typescript/bin/tsc
npm install --global --prefix <operator-prefix> --ignore-scripts .
```
Ensure `<operator-prefix>/bin` is accessible on PATH for the Gateway service account.
Verify that `gtfs-mcp --version` resolves to v1.0.2.

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

## 3. Diagnostic States & Troubleshooting

1. **Ready**:
   - `list_systems` returns configured agencies.
   - `get_feed_health` shows current feed updates.
   - Real departure queries succeed.
2. **Tools Blocked or Hidden by Policy**:
   - Symptom: Server is running on host, but Hopper reports no tools or permission errors.
   - Action: Operator verifies Gateway tool profile and grants Hopper permission to
     call the concrete transit tools.
3. **Tools Working, City Unconfigured**:
   - Symptom: `list_systems` responds, but requested city is absent.
   - Action: Operator adds the local transit agency's static and realtime feeds to the
     runtime configuration file and confirms agency timezone.
4. **No Visible Compatible Tools**:
   - Symptom: Session has no transit tools exposed.
   - Action: Hopper operates in fallback mode (interprets rider-supplied timetables).
     Operator provisions an integration via Path A or Path C.
