# Contributing to Agent Templates

Thank you for your interest in contributing! This repository maintains a collection of reusable, independently versioned templates for OpenClaw autonomous agents.

## Adding a New Template

Add a new agent under `templates/<slug>/` with `package.json`, `CLAW.md`, `README.md`, and first-run `BOOTSTRAP.md` when useful. Keep supporting files within that package. Use OpenClaw's current manifest format, not obsolete profiles/packages/cronJobs forms.

### Directory Structure

```text
templates/<slug>/
├── package.json        # Template metadata and openclaw manifest pointer
├── CLAW.md             # Manifest frontmatter and SOUL.md agent prompt
├── README.md           # Instructions, capabilities, and setup steps
├── BOOTSTRAP.md        # First-run onboarding conversation (optional)
├── skills/             # Bundled skills (optional)
└── workspace/          # Mapped workspace templates and reference files
```

### Requirements & Guidance

- **Self-contained**: Templates must be independently valid and buildable. Supporting files belong inside the package directory.
- **Scope & Conversation**: Describe input, job, output, and authority. Include a first useful conversation, fictional examples, evidence requirements, and realistic acceptance scenarios. Keep initial setup short and resumable. Do not ship actual user preferences.
- **External Tools & Prerequisites**: Document supported setup, exact tested versions, operator requirements, and missing capabilities. Do not promise automatic installation, authentication, global coverage, or background work from a declaration alone.
- **Privacy & Safety**: Keep personal locations, real household records, credentials, local provider installations, downloaded databases, and raw conversations out of this repository. Public examples must be fictional or dated public evidence.

### Validation & Testing

Validate, inspect, and build the affected package with OpenClaw:

```bash
openclaw templates validate ./templates/<slug>
openclaw templates dev ./templates/<slug>
openclaw templates inspect ./templates/<slug>
```

Build a distribution archive into an ignored `dist/` directory:

```bash
mkdir -p dist
openclaw templates build ./templates/<slug> --out ./dist/<slug>-<version>.tgz
```

Record real outcomes and untested layers in `docs/VERIFICATION.md`.

### Submission Workflow

1. Fork this repository and create a feature branch:
   ```bash
   git checkout -b template/my-new-template
   ```
2. Add your template under `templates/<slug>/`.
3. Update the template catalog in `README.md`.
4. Review outgoing files for private data, credentials, and unsupported claims.
5. Open a scoped Draft Pull Request against `main`.

> Note: Source review, GitHub merge, registry publication, and installing an agent are four separate events; none should be claimed from another's receipt.
