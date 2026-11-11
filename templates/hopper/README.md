# Hopper

**Catch the right ride.** An OpenClaw transit companion with conversational
setup and stop/direction-aware departures. Preferences can be reused in the
conversation; cross-conversation saving requires a verified private store.
No Home Assistant or continuous location tracking required.

## Initial draft

This package contains onboarding, operating instructions, a bundled workflow
skill, a declared external MCP dependency, and a Halifax configuration example.
It is not yet a production-ready transit service. The external runtime requires
provisioning. Real Halifax MCP queries and native OpenClaw tool discovery passed;
full Template Add and a model conversation remain unverified. Global agency
discovery, custom picker UI, and background watches are not implemented.

## Focus-week package

This is an OpenClaw Template contribution, not a new transit application or a
change to OpenClaw core. Its structure was compared with published Competitor
Watch, Travel Copilot, and Everyday Meal Planner packages. See the mapped
reference/sources.md for exact versions and provenance. Fictional voice examples,
an answer guide, and acceptance scenarios accompany the workflow; the scenarios
are not claimed as passed conversation tests.

## Before Add

This is an operator-provisioned pilot, not a one-click installation. The receiving
Gateway needs the reviewed gtfs-mcp executable and HOPPER_GTFS_CONFIG binding
before live rider onboarding can work. The template itself does not install them.
No persistent commute store is bundled or verified in this version.

## First ride

1. Review CLAW.md and workspace/reference/transit-setup.md.
2. Have an operator provision the external executable and runtime config. The
   qualified candidate is jdamcd/gtfs-mcp v1.0.2. Do not separately register a
   different server named hopper-transit; Template Add owns that declaration.
3. Inspect and Add the Template with normal OpenClaw review and consent.
4. Tell Hopper a city/stop or voluntarily share one location where supported.
5. Confirm agency and direction; get a real departure answer before optional
   personalization. Save preferences only in an available private store.

Ask “What are my next departures?”, “It takes me eight minutes to walk there;
allow three minutes extra,” or “Remember this stop as my commute.” Hopper must
label live predictions versus schedules and explain unavailable coverage.

The Halifax preset has schedules, trip updates, and vehicle positions; it has
no configured alerts feed. Other cities need verified configured feeds. There
are no default automations, fares/purchases, person tracking, or arrival-safety
claims. On-demand questions do not start background activity.

## Files

- CLAW.md: manifest and personality, becoming the new agent's SOUL.md.
- BOOTSTRAP.md: first-run conversation.
- workspace/AGENTS.md: correctness, privacy, and authority.
- skills/transit/SKILL.md: workflow for existing transit tools.
- workspace/reference/: operator setup and Halifax configuration example.
- package.json: package metadata, without scripts or lifecycle hooks.

## Validate

Use OpenClaw's templates validate, dev, and build commands. Package validation
does not install the external server or prove a live agent query. The README is
also mapped into reference/package-readme.md for the installed agent.

## Inspiration and building blocks

- Bernie: https://github.com/DonnieFi/bernie — household bus-tracking use case.
- GTFS MCP: https://github.com/jdamcd/gtfs-mcp — candidate data runtime.
- Template format: https://docs.openclaw.ai/cli/templates

Newly authored instructions. No Bernie implementation, personal locations,
conversation contents, or upstream implementation code is copied into Hopper.
