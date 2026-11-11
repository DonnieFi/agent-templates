# Sources and design references

## Transit

- Bernie, DonnieFi's household transit implementation:
  https://github.com/DonnieFi/bernie/tree/b850072331f51a1037b2cc3484df1091da16f751
  Inspiration for the bus-use case; no implementation or household data copied.
- Candidate runtime: https://github.com/jdamcd/gtfs-mcp/releases/tag/v1.0.2
  Source compilation, scoped executable installation, real Halifax stdio queries,
  and native OpenClaw MCP discovery were exercised. Receiving-host Add and model
  conversation remain unverified; see the collection verification report.
- Halifax static schedules: https://gtfs.halifax.ca/static/google_transit.zip
- Halifax trip updates: https://gtfs.halifax.ca/realtime/TripUpdate/TripUpdates.pb
- Halifax vehicle positions: https://gtfs.halifax.ca/realtime/Vehicle/VehiclePositions.pb
  Endpoint availability is not realtime freshness or integration proof. Respect
  agency licensing and use conditions before distributing data or deploying.

## OpenClaw Template examples inspected on 2026-11-11

Published archives were read as data, not installed or executed. SHA-256 was
checked against registry metadata before inspecting their files.

- Patrick Erichsen: @patrick-erichsen-2/competitor-watch 0.1.1.
  Archive SHA-256 e3103860a66483d7f802aa6cc7f8af698a2d15ffc3eb8b740cfbaa1c9ed308b5.
  Useful patterns: first real baseline, resumable setup, explicit schedule activation.
  This published version still contains retired packages/cronJobs/profile forms;
  it is not the current schema authority. Hopper uses current native settings,
  skills/plugins, and automations instead.
- Jacqueline Henriksen: @jjjhenriksen/travel-copilot 0.2.4.
  Archive SHA-256 d748e6d4ab68d7c3d468d6e068f42b8860c3825f4be8491423d7046efddb0f22.
  Source: https://github.com/jjjhenriksen/agent-templates
  Useful patterns: first useful conversation, exact dependencies, mapped reference
  files, fictional voice examples, explicit acceptance and integration gaps.
- Jacqueline Henriksen: @jjjhenriksen/meal-planner 0.1.2.
  Archive SHA-256 23c0267279f958bad59d2b14fddcdb4fd15515ccd42f7604c667fa41d7c62b0c.
  Useful pattern: useful work before optional provider connection, without
  implying the provider has already been authenticated.

Hopper's text is newly authored. These are workflow references, not copied
runtime code, an endorsement, or a claim that their live integrations were tested.
Canonical format: https://docs.openclaw.ai/cli/templates
