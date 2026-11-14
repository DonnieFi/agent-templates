# Hopper verification

Observed 2026-11-11. This is an initial draft, not publication or a production
readiness declaration. Public feed observations below are historical evidence,
not current travel advice.

## Qualified inputs

- OpenClaw source: 17140700d7b54ac2d960863123273528d1e77553.
- GTFS MCP v1.0.2: adaf2222e9f15ef2822a9c8130faaf867448f365.
- Isolated runtime: Node 24.22.1; upstream lockfile install with lifecycle scripts
  disabled, successful TypeScript compilation, and a task-scoped executable
  install. No host Gateway configuration or live service was modified.
- No external runtime source, dependencies, credentials, databases, or captured
  raw protocol logs are included in this repository or the Template archive.

## Observed passes

1. Package schema validation and archive construction through OpenClaw's native
   Template project validator/builder. Selected files include the bundled skill,
   mapped workspace references, root BOOTSTRAP, and README.
2. Real stdio MCP initialize and tools/list against the compiled pinned runtime:
   11 transit tools discovered.
3. Live Halifax tool sequence: list systems, search Spring Garden stops, read
   stop 8336, inspect feed health, fetch arrivals, and inspect one returned trip.
   Five predictions were marked realtime. The feed-health check reported both
   vehicle and trip-update feeds eight seconds old during the qualified run.
4. Missing-alert negative case: the server explicitly returned that alerts were
   unavailable, not that there were no alerts. The initial proof script treated
   this expected unavailable result as a failure; its oracle was corrected and
   the full flow then exited successfully. No server code was changed.
5. Native OpenClaw MCP probe, with isolated profile/state, connected using both
   the compiled entrypoint and the final gtfs-mcp executable. The exact executable
   probe returned all 11 namespaced tools, no diagnostics, and exit 0.
6. Native offline Template dev preview on fresh state returned zero blocked
   actions and no blockers. It correctly retained HOPPER_GTFS_CONFIG as a runtime
   readiness requirement; offline preview does not claim it is connected.
7. Collision negative case: preview refused to overwrite a same-named MCP server
   with a different literal-path configuration. Setup documentation was corrected
   to provision the executable/config first and let Add register its declaration.
8. Source hosting and review: GitHub repository created at
   https://github.com/DonnieFi/agent-templates with draft PR #1
   (https://github.com/DonnieFi/agent-templates/pull/1) opened against main.
9. Manifest and capability-discovery reconciliation:
   - Removed unconditional `mcpServers.hopper-transit` declaration from `CLAW.md`
     to avoid creating dead/duplicate server definitions before capability discovery.
     External MCP runtime recipe preserved in `reference/transit-setup.md`.
   - Removed optional `automations: []` line from `CLAW.md` following ClawHub
     CLI 0.25.1 workaround; verified zero automations are declared.
   - Reconciled tool grants in `CLAW.md` to concrete transit tool names without
     wildcards or shell access.
   - Updated `BOOTSTRAP.md`, `skills/transit/SKILL.md`, and operating rules to
     check exposed capabilities before commute setup, reuse facts already supplied,
     and distinguish evidence-based diagnostic states (ready, unconfigured city,
     explicit permission denial, connection failure, no visible tools).
   - Strict departure provenance: distinguish live predictions, scheduled timetable
     times, stale predictions (with age), and unavailable data; never relabel stale
     predictions as scheduled.
   - Corrected operator verification of `gtfs-mcp` v1.0.2 to check source commit
     and `package.json` version plus MCP protocol handshake (removing unsupported
     `--version` CLI flag recommendation).
   - Documented planned Hopper transit plugin status neutrally without fictional URLs,
     and defined future plugin architecture boundaries and acceptance gate criteria.
10. Bundled native GTFS plugin integration:
   - Authoritative source repository: https://github.com/DonnieFi/openclaw-gtfs
     (Draft PR #1: https://github.com/DonnieFi/openclaw-gtfs/pull/1, commit ba65c1db45d63dd94743e4371bb37bad57f87093).
   - Packaged artifact SHA-256: c51cbc87d5f94e382940be0044b412da539a6abb9323943174f6507c58e98c7d (hopper-gtfs-plugin-0.1.0-dev.3.tgz).
   - Staged exact built distribution under templates/hopper/plugins/gtfs/ (compiled JS in dist/,
     package.json, openclaw.plugin.json, README.md, LICENSE; no node_modules, no editable TypeScript).
   - Declared bundled dependency in CLAW.md (plugins: [{ path: "plugins/gtfs" }]).
   - Reconciled tool grants to six native tools: search_transit_systems, use_transit_system,
     get_transit_system, search_transit_stops, get_transit_departures, get_transit_vehicles.
   - Native departure schema alignment: returned field is `headsign` (not `trip_headsign`);
     feed freshness rejects feeds >120s; empty departures on fresh queries represent no
     upcoming departures within the window.
   - Zero automations; removed obsolete mcpServers and HOPPER_GTFS_CONFIG requirements.
11. Disposable Gateway Template Add verification:
   - Configured disposable profile `hopper-test-disp` with `gateway.controlUi.experimental.templates = true`.
   - Verified no pre-existing plugin or environment variables.
   - `templates add --dry-run` resolved 14 actions, 2 bundled packages (`skills/transit`, `plugins/gtfs`), and the 3 declared capability escalations with 0 MCP servers and 0 automations.
   - `templates add --accept-capabilities` successfully scaffolded the workspace at `~/.openclaw-hopper-test-disp/workspace-hopper` and registered `agent:hopper`. The opening turn stopped cleanly when no route-compatible OpenAI credentials were configured in the isolated test profile, retaining the agent and its staged files without duplication or corruption.

## Findings applied to instructions

- The runtime's arrival headsign may name the last realtime stop rather than
  the actual vehicle sign. Verify trip_headsign and stop order via get_trip.
- Arrival output contains local clock strings and rounded relative minutes,
  not full absolute arrival timestamps. Do not promise second-precise or tight
  connections from rounded data.
- MCP discovery is not proof that a restrictive agent tool profile exposes those
  tools. Hopper now declares a minimal profile plus its concrete native transit
  tool names and workspace read/write/edit; host policy still governs grants.

## Incomplete

- Full Template Add followed by a genuine model conversation through the installed
  agent. The isolated proof environment has no configured live-model credential.
- Clean-machine end-to-end provisioning, including PATH/environment persistence
  for a receiving Gateway service account.
- City/agency discovery beyond configured systems, custom picker/location UI,
  persistent private commute storage, and background departure watches.
- Broader-agency fixtures, midnight/branch/cancellation conversation scenarios,
  and empirical catchability quality. The acceptance document is a plan, not a
  test-result list.
- ClawHub publication and community showcase posting.

No live Add, account setup, scheduled job, family-location tracking, or external
publication was performed. The test MCP children terminated after each check.

## Independent review resolution

A separate reviewer examined the supplied package snapshot. Its first filesystem
attempt could not access the draft; the actual review used a complete numbered
snapshot of the relevant files instead.

- Missing agent tool visibility: resolved with a minimal profile and the 11
  verified native MCP tool names. Fallback instructions now distinguish unseen
  tools from proven provisioning failure and preserve host policy.
- Operator-dependent first setup: retained as an explicit pilot limitation,
  highlighted before Add. The source build/probe evidence does not make setup
  one-click or prove the receiving host is provisioned.
- Unconditional commute-saving description: removed. Preferences can be reused
  in the conversation; cross-conversation saving remains conditional on a
  separately verified private persistence capability.

The review did not request fake watcher support or weaker privacy boundaries.

# Bernie verification

Observed 2026-11-14 with OpenClaw 2026.11.3 (17db247).

- Reviewed all five files added by dc84861: no private family records, real locations, account IDs, credentials, raw conversations, or machine-specific paths were found in the package.
- Optional Discord guide checked against current OpenClaw Discord setup documentation and installed `agents bind --help`. It reuses an existing application/account, requires operator authority and explicit routing cutover, keeps secrets outside the package/chat/command arguments, and preserves pairing and allowlists. No live bot connection, routing change, or access change was performed.
- `openclaw templates validate templates/bernie`: passed.
- `openclaw templates dev templates/bernie`: passed; five planned actions, one capability escalation, zero blocked actions. Existing agent-ID collision resolves to `bernie-2`; this is preview only, not an installed agent.
- `openclaw templates inspect templates/bernie`: passed; zero skills, plugins, MCP servers, and automations. README is excluded from the built package; the Discord reference is explicitly mapped.
- Model conversations, Template Add, Discord identity/reply tests, and receiving-host permissions remain untested. Acceptance scenarios in the README are review criteria, not passed tests.
- No catalog/registry publication, installation, live messaging, or merge is authorized or performed by this verification.

- `openclaw templates build templates/bernie --out dist/bernie-0.1.0.tgz`: passed; archive contains only CLAW.md, package.json, workspace/AGENTS.md, and workspace/discord.md. SHA-256: `3ddc5cbacac5eb9d2704d2cc9a8c5e151698791c4e12853dfce8c4308d6057aa`.

## Bernie family-centric revision — 2026-11-14

- Added consent-based, separate local Markdown profiles for people and pets, with minimal agreed facts, relevant-profile reading, corrections/removal, and explicit shared-workspace privacy limits.
- Made the base agent conversation/local-notes only: no Home Assistant or unavailable integration calls; connected family features belong to separately configured Family Pack.
- Re-ran validate, offline dev preview, inspect, build, and diff checks successfully. Preview still reports five planned actions, one capability escalation, zero blockers; zero skills/plugins/MCP servers/automations.
- Updated archive SHA-256: `29664819b7d635105e04859a73dc4626b4c5c5ddd7d952462ebc16859533a4f2` (supersedes the earlier artifact hash).
- Profile files are created at runtime after consent, not bundled. Real model personalization, profile creation, and Family Pack integration remain untested. No live installation or connection was performed.

## Bernie standalone-first clarification — 2026-11-14

- Base conversation, supplied-context planning, and consent-based local profiles require no Family Pack or startup service probes. Optional owner-approved Family Pack onboarding can reuse an existing family agent or offer a template; it must preserve identity/notes and tolerate skipped or removed integrations.
- Validate, offline preview, inspect, build, and diff checks passed again; five preview actions, one capability escalation, zero blockers. Archive SHA-256: `16a72c3c09b06ab468767fc5fbc59e3093a4db4a0ef7a0ff1f8ece44f46b5bdc` supersedes earlier hashes.
- Standalone/model and Family Pack handoff acceptance scenarios remain unexecuted. No Family Pack startup code was inspected or changed in this repository.
