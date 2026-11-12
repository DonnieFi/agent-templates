# Hopper

**Catch the right ride.** An OpenClaw transit companion with conversational
setup and stop/direction-aware departures. Preferences can be reused in the
conversation; cross-conversation saving requires a verified private store.
No Home Assistant or continuous location tracking required.

## What Hopper includes

- **Conversational persona**: Onboarding flow, operating rules, and departure layouts.
- **Bundled transit workflow skill** (`skills/transit`): Coordinates stop resolution,
  departures, and walking buffer calculations.
- **Bundled native transit plugin** (`plugins/gtfs/`): `hopper-gtfs-plugin` v`0.1.0-dev.3`,
  providing public GTFS catalog discovery, agent-scoped system selection, and realtime
  predictions without external MCP binaries or `HOPPER_GTFS_CONFIG` requirements.

## Native Tools

Hopper uses six native tools provided by the bundled `hopper-gtfs` plugin:
- `search_transit_systems`: Search public catalog candidates by city/agency.
- `use_transit_system`: Select and validate an agency for this agent across sessions (requires user confirmation).
- `get_transit_system`: Inspect active agency selection (includes Halifax preset `mdb-734`).
- `search_transit_stops`: Search stops by name or exact ID.
- `get_transit_departures`: Fetch predicted departures with ISO timestamps, trip headsign, stop sequence, feed age, and timezone.
- `get_transit_vehicles`: Fetch current vehicle locations and speeds.

## Capability checking & missing dependencies

On first run, Hopper reuses any facts already supplied in the conversation, checks
for exposed transit tools silently, and asks only for missing details:
1. **Ready with usable coverage**: Reuses active system (e.g. Halifax preset) or
   searches the catalog on request.
2. **Tools working, city unconfigured**: Searches catalog; explains unsupported
   or auth-required feeds honestly without guessing.
3. **Explicit permission denial**: Informs the user that transit tools are provisioned
   on the host Gateway but require explicit tool grants in host policy.
4. **Connection or runtime failure**: Explains that the plugin runtime did not respond;
   directs operators to Gateway and plugin logs.
5. **No visible tools**: Explains that live transit tools are not accessible in the
   session, without speculating whether software is installed on the host or blocked
   by policy. Hopper falls back to manual timetable interpretation.

## First ride

1. Inspect and Add the Template with normal OpenClaw review and consent.
2. Start a conversation with Hopper. Hopper checks available transit tools.
3. Tell Hopper your starting location or stop and destination.
4. Confirm agency and direction; receive a departure answer labeled with live
   prediction status and feed age.
5. Save preferences only when a verified private store is available.

Ask “What are my next departures?”, “It takes me eight minutes to walk there;
allow three minutes extra,” or “Remember this stop as my commute.”

There are no default automations, fares/purchases, person tracking, or arrival-safety
claims. On-demand questions do not start background activity.

## Files

- `CLAW.md`: Manifest frontmatter and personality (`SOUL.md`).
- `BOOTSTRAP.md`: Capability-first first-run conversation guide.
- `workspace/AGENTS.md`: Correctness, privacy, capability states, and authority.
- `skills/transit/SKILL.md`: Workflow skill for discovering and querying transit tools.
- `plugins/gtfs/`: Bundled `hopper-gtfs` plugin distribution (built JS, manifest, metadata).
- `workspace/reference/`: Operator setup, acceptance scenarios, and Halifax configuration example.
- `package.json`: Package metadata.

## Validate

Use OpenClaw's templates validate, dev, and build commands. Package validation
does not install external servers or prove live model queries. The README is
also mapped into `reference/package-readme.md` for the installed agent.

## Inspiration and building blocks

- Bernie: https://github.com/DonnieFi/bernie — household bus-tracking use case.
- GTFS plugin source: https://github.com/DonnieFi/openclaw-gtfs — authoritative plugin repository.
- Template format: https://docs.openclaw.ai/cli/templates

Newly authored instructions. No Bernie implementation, personal locations,
conversation contents, or upstream implementation code is copied into Hopper.
