# Hopper

**Catch the right ride.** An OpenClaw transit companion with conversational
setup and stop/direction-aware departures. Preferences can be reused in the
conversation; cross-conversation saving requires a verified private store.
No Home Assistant or continuous location tracking required.

## What Hopper includes vs. external integration

- **Included in this template**:
  - Conversational persona, onboarding flow, and operating rules.
  - Bundled transit workflow skill (`skills/transit`).
  - Reference departure presentation layouts, setup guides, and fictional examples.
- **Supplied by a transit integration**:
  - Live and scheduled GTFS query capabilities (`list_systems`, `search_stops`, `get_arrivals`, etc.).
  - Transit feed connections, updates, and caching.

Hopper is capability-detection-first: it discovers tools actually exposed in the
session rather than assuming hardcoded server declarations or fixed transport
prefixes.

## Capability checking & missing dependencies

On first run, Hopper reuses any facts already supplied in the conversation, checks
for exposed transit tools silently, and asks only for missing details:
1. **Ready with usable coverage**: Performs a harmless read (`list_systems`, feed health)
   to verify data freshness before retrieving departures.
2. **Tools working, city unconfigured**: Lists configured systems; does not guess
   or substitute another agency.
3. **Explicit permission denial**: Informs the user that transit tools are provisioned
   on the host Gateway but require explicit tool grants in host policy.
4. **Connection or runtime failure**: Explains that the integration process did not
   respond; directs operators to runtime logs without diagnosing permissions without evidence.
5. **No visible tools**: Explains that live transit tools are not accessible in the
   session, without speculating whether software is installed on the host or blocked
   by policy. Hopper can still calculate walking time buffers, assess catchability,
   and interpret transit schedules or timetable text provided by the rider.
   - See `reference/transit-setup.md` for current integration options (including
     the planned Hopper transit plugin and operator MCP setup).
   - If the rider declines setup, Hopper continues in schedule-interpretation mode
     without nagging.

## Before Add

Hopper bundles no transit runtime and does not yet make a clean-host Template Add
produce live departures out of the box. It does not hardcode an unconditional MCP
server or unverified plugin in its manifest, avoiding broken installations or duplicate
servers. Review `workspace/reference/transit-setup.md` for current integration options
and operator provisioning steps.

## First ride

1. Inspect and Add the Template with normal OpenClaw review and consent.
2. Start a conversation with Hopper. Hopper checks available transit tools.
3. Tell Hopper your starting location or stop and destination.
4. Confirm agency and direction; receive a departure answer labeled with live
   prediction or scheduled timetable status before optional personalization.
5. Save preferences only when a verified private store is available.

Ask “What are my next departures?”, “It takes me eight minutes to walk there;
allow three minutes extra,” or “Remember this stop as my commute.” Hopper must
label live predictions versus schedules and explain unavailable coverage.

There are no default automations, fares/purchases, person tracking, or arrival-safety
claims. On-demand questions do not start background activity.

## Files

- `CLAW.md`: Manifest frontmatter and personality (`SOUL.md`).
- `BOOTSTRAP.md`: Capability-first first-run conversation guide.
- `workspace/AGENTS.md`: Correctness, privacy, capability states, and authority.
- `skills/transit/SKILL.md`: Workflow skill for discovering and querying transit tools.
- `workspace/reference/`: Operator setup, acceptance scenarios, and Halifax configuration example.
- `package.json`: Package metadata.

## Validate

Use OpenClaw's templates validate, dev, and build commands. Package validation
does not install external servers or prove live model queries. The README is
also mapped into `reference/package-readme.md` for the installed agent.

## Inspiration and building blocks

- Bernie: https://github.com/DonnieFi/bernie — household bus-tracking use case.
- GTFS MCP: https://github.com/jdamcd/gtfs-mcp — candidate data runtime.
- Template format: https://docs.openclaw.ai/cli/templates

Newly authored instructions. No Bernie implementation, personal locations,
conversation contents, or upstream implementation code is copied into Hopper.
