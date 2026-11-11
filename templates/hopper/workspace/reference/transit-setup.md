# Transit runtime setup

Hopper uses the existing GTFS MCP server rather than a second transit parser.
The qualified candidate is jdamcd/gtfs-mcp v1.0.2, source commit
adaf2222e9f15ef2822a9c8130faaf867448f365:
https://github.com/jdamcd/gtfs-mcp/releases/tag/v1.0.2

The Template declares command gtfs-mcp and passes GTFS_MCP_CONFIG from the
HOPPER_GTFS_CONFIG environment reference. The executable and config must be
available to the receiving Gateway's service account. Installing the Template
does not install this external runtime. No credentials are needed for the
Halifax feeds in the included example.

## Operator provisioning

A source-build route was exercised in an isolated workspace with Node 24.22.1
and npm. The upstream engine requirement is Node 22 or newer. After reviewing
and checking out the exact commit above into an operator-selected runtime folder:

1. In that folder run npm ci --ignore-scripts --no-audit --no-fund.
2. Run node node_modules/typescript/bin/tsc.
3. Install the compiled local folder into an operator-selected prefix using
   npm install --global --prefix <prefix> --ignore-scripts <runtime-folder>.
4. Ensure <prefix>/bin is on the Gateway service account's PATH. Verify that
   gtfs-mcp resolves to that reviewed runtime, not another executable.

These are operator actions, not commands to run automatically during rider
onboarding. Preserve existing installations/configuration. Source updates need
review and verification, not an implicit latest-version download. The GitHub
release exists, but the npm registry's gtfs-mcp/1.0.2 lookup returned 404; do not
replace this route with a guessed npx command. Upstream also publishes a Docker
image, but this package has not qualified its Docker deployment.

## Configure Halifax without asking the rider to edit JSON

Use reference/halifax.gtfs.example.json as the starting point. An authorized
operator or setup assistant should produce a separate runtime config, choose an
owned data directory, and set HOPPER_GTFS_CONFIG to that file's server-readable
path through the installation's normal environment controls. Never write private
locations into the example or public source repository. The config identifies
public transit systems; the rider's usual stop is a separate private preference.

The example declares schedules, trip updates, and vehicle positions, but no
alerts feed. Missing alerts are not an all-clear. Confirm America/Halifax as the
agency timezone; the rider's device timezone may differ.

## Register once through Template Add

Provision the executable and runtime config first; let Template Add register the
manifest's hopper-transit MCP declaration. Do not create a same-named server with
a different definition before Add. OpenClaw correctly refuses that collision
rather than overwriting shared configuration. In particular, a literal config
path and the manifest's environment-reference form are different declarations.
For an existing server, inspect and reconcile through ordinary operator controls
with the user's authority; do not delete or replace it automatically.

## Verify the connection

Use OpenClaw's ordinary MCP settings/probe path, keeping existing approvals.
Do not stop a live Gateway or edit shared configuration from rider onboarding.
Offline CLI probes require that their selected Gateway state is not live; use
the supported Control UI path for a running installation.

Verify list_systems, search_stops, get_stop, get_feed_health, and get_arrivals.
The live stdio test found 11 tools, public Halifax stops, fresh trip updates and
five realtime arrivals at stop 8336. OpenClaw's native MCP probe also connected through the declared gtfs-mcp command
and discovered all 11 tools without diagnostics. These prove the runtime/feed
and native discovery paths, not a completed model conversation or Template Add.

## Other cities

Configure verified official GTFS feeds and their agency timezone through the
same runtime. The rider selects among configured systems. General GTFS support
does not guarantee a city's coverage, realtime data, or transfer routing. This
version has no worldwide agency directory or custom geolocation/city-picker UI.
