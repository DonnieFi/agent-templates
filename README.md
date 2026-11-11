# Agent Templates

Portable OpenClaw agents built around useful everyday jobs.

Packages under `templates/` represent agent templates for OpenClaw. In this collection, [Hopper](templates/hopper/) is the current-format, independently versioned OpenClaw Template package; [starter-agent](templates/starter-agent/) is a legacy scaffold (retaining `agent.json` and `prompts/system.md` rather than an installable OpenClaw `CLAW.md`/`package.json` manifest). This source repository is separate from ClawHub publication: reviewing or merging source does not publish a registry package or install an agent.

## Available Templates

| Template | Description | Status |
| :--- | :--- | :--- |
| [**Hopper**](templates/hopper/) | Catch the right ride: conversational transit companion with stop/direction-aware departures, walking buffers, and live vs. scheduled status | Draft / Pilot |
| [**Starter Agent**](templates/starter-agent/) | Minimal scaffold for building custom autonomous agents | Legacy scaffold—not installable |

### Hopper — Catch the right ride

[Hopper](templates/hopper/) helps a rider find stops and useful departures, check direction and realtime freshness, and compare options using their walking time. It does not require Home Assistant or continuous location tracking.

- **Status**: Initial draft. The candidate transit runtime has returned real Halifax predictions in an isolated protocol test. Complete receiving-host Add and model conversation proof, wider agency discovery, and background watches are unfinished. See [verification](docs/VERIFICATION.md) and Hopper's README for exact boundaries.

## Repository Layout

- `templates/hopper/`: Hopper's complete package source.
- `templates/starter-agent/`: Legacy starter scaffold (not an installable OpenClaw Template package).
- `templates/<another-agent>/`: Future independent packages.
- `docs/VERIFICATION.md`: Observed evidence and outstanding checks.
- `AGENTS.md`: Portable template collection guidance.
- `CONTRIBUTING.md`: Adding and changing packages.

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/DonnieFi/agent-templates.git
cd agent-templates
```

### 2. Validate a Template

With a compatible OpenClaw CLI installed, run from this repository root:

```bash
openclaw templates validate ./templates/hopper
openclaw templates dev ./templates/hopper
openclaw templates inspect ./templates/hopper
```

Build into an existing local output directory:

```bash
mkdir -p dist
openclaw templates build ./templates/hopper --out ./dist/hopper-0.1.0.tgz
```

These checks do not create an agent or publish a package. Adding, connecting external services, enabling automations, and ClawHub publication are separate reviewed actions. Do not run installation or publishing commands as a test.

## Sharing Templates

Keep source changes reviewable here, publish an explicitly reviewed package to ClawHub, then share its link and useful examples in the [OpenClaw Templates Showcase](https://community.openclaw.ai/t/openclaw-templates-showcase/415). The showcase thread does not state a core-repository PR requirement.

## Privacy & Boundaries

Keep personal locations, real household records, credentials, local provider installations, downloaded transit databases, and raw conversations out of this repository. Example data must be clearly fictional; public feed observations must be dated and not presented as current advice.

## License

This repository is licensed under the [MIT License](LICENSE).
