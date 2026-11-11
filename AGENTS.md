# Template collection guidance

Each templates/<slug>/ package must be independently valid and buildable with
the current OpenClaw Template format. Read that package's README before editing.
CLAW.md owns the manifest; its Markdown body supplies SOUL.md. Map all required
workspace files and declared bundled skill/plugin folders explicitly.

Keep each agent focused and conversational. Ask only for missing facts that
change the next useful action. Do not force a form, account connection, or broad
permissions when the requested job does not require them.

Preserve user work. Never import private workspace instructions, real personal
records, credentials, raw conversations, or machine-specific paths into packages.
Public examples must be fictional or explicitly identified dated public evidence.
Prompt rules are not access controls; do not claim isolation from wording alone.

Use exact verified dependency versions where the format supports them. Distinguish
declared integrations, installed executables, authenticated services, live tool
proof, and completed model behavior. Do not call one layer proof of another.

Update examples, setup, capability limits, and acceptance scenarios when behavior
changes. Run non-installing validation/build and appropriate tests before claiming
success. A checklist is not a passed test. No live Add, publication, messaging,
transactions, or scheduler changes without the corresponding explicit authority.

Keep each public version immutable after publication. Root documentation may
summarize packages but must not become an implicit runtime dependency of one.
