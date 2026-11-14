# Agent Templates

This repo is the source for the OpenClaw Templates in this collection.
A Template is a package that `openclaw templates add` turns into a new, ordinary OpenClaw agent.

Each folder under `templates/` holds one Template.
The package source sits at the root of that folder: `CLAW.md`, `package.json`, `workspace/`, and, when the package has them, `skills/` and `plugins/`.
Reviewing or merging this source does not publish a registry package or install an agent.

## Templates

| Template | Package | ClawHub | Folder |
|----------|---------|---------|--------|
| [Hopper](templates/hopper/README.md) | `hopper-transit-companion@0.1.0` | Not published | [`templates/hopper/`](templates/hopper/) |
| [Bernie](templates/bernie/README.md) | `bernie-house-griffon@0.1.1` | Not published | [`templates/bernie/`](templates/bernie/) |
| [Meals](templates/meals/README.md) | `meals-week-planner@0.1.0` | Not published | [`templates/meals/`](templates/meals/) |
| [Tutor](templates/tutor/README.md) | `tutor-study-companion@0.1.0` | Not published | [`templates/tutor/`](templates/tutor/) |

The ClawHub column is a stub. These package names are the `package.json` names. They are not ClawHub slugs.

Each Template has its own `README.md` with the details.

[starter-agent](templates/starter-agent/) is a legacy scaffold (`agent.json` and `prompts/system.md`). It has no `CLAW.md` package.

Plugin source stays in its own repository. The Template vendors a pinned build.

| Template | Plugin source |
|----------|----------------|
| Hopper | [DonnieFi/openclaw-gtfs](https://github.com/DonnieFi/openclaw-gtfs) |
| Meals | [DonnieFi/openclaw-meals](https://github.com/DonnieFi/openclaw-meals) |
| Tutor | [DonnieFi/openclaw-tutor](https://github.com/DonnieFi/openclaw-tutor) |

Bernie has no bundled plugin.

Add one from this checkout:

```sh
openclaw templates add ./templates/hopper
```

Use `./templates/bernie`, `./templates/meals`, or `./templates/tutor` for the other packages.
A recorded Gateway Add is still outstanding. See [docs/VERIFICATION.md](docs/VERIFICATION.md) and [docs/meals-tutor-verification.md](docs/meals-tutor-verification.md).

## Report a problem

Open a GitHub issue on [DonnieFi/agent-templates](https://github.com/DonnieFi/agent-templates/issues).
Give the Template name, its version, your OpenClaw version (`openclaw --version`), and what happened.
Do not paste tokens, keys, postal codes, or personal data.

## Build or check a Template locally

You need OpenClaw with the `templates` command.

```sh
openclaw templates validate ./templates/hopper
openclaw templates dev ./templates/hopper
openclaw templates inspect ./templates/hopper
mkdir -p dist
openclaw templates build ./templates/hopper --out ./dist/hopper-0.1.0.tgz
```

`dev` checks what an Add would do without changing your OpenClaw.
`build` refuses to overwrite an existing file.
These commands do not create an agent or publish a package.

Use `./templates/bernie`, `./templates/meals`, or `./templates/tutor` the same way.
`build` writes `./dist/<name>-0.1.0.tgz`.

## Add a Template

1. Make a folder `templates/<name>/` with the package source at its root. `openclaw templates validate ./templates/<name>` must pass.
2. Add a row to the table above. Leave ClawHub as `Not published` until a reviewed publish.
3. Open a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Privacy

Keep personal locations, real household records, credentials, and raw conversations out of this repository.
Example data must be fictional. Public feed observations must be dated.

## License

MIT. See [LICENSE](LICENSE).
