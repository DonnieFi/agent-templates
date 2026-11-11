# Contributing to Agent Templates

Thank you for your interest in contributing! This repository maintains reusable templates for autonomous agents.

## Adding a New Template

### 1. Directory Structure

Place each new template in its own subfolder under `templates/`:

```text
templates/<template-name>/
├── README.md           # Instructions, capabilities, and setup steps
├── agent.json          # Agent metadata, tools, and model configuration
└── prompts/
    └── system.md       # Agent instructions and system prompt
```

### 2. Requirements

- **Self-contained**: Templates should contain everything required to run or configure the agent.
- **Documentation**: Provide a concise `README.md` detailing the agent's role, dependencies, and configuration parameters.
- **No Secrets**: Never commit API keys, auth tokens, or private endpoints. Use placeholder environment variable references (e.g. `$API_KEY` or `.env.example`).

### 3. Submission Workflow

1. Fork this repository.
2. Create a feature branch:
   ```bash
   git checkout -b template/my-new-template
   ```
3. Add your template under `templates/<template-name>/`.
4. Update the template table in `README.md`.
5. Commit and push:
   ```bash
   git commit -m "feat(templates): add <template-name> template"
   git push origin template/my-new-template
   ```
6. Open a Pull Request against `main`.
