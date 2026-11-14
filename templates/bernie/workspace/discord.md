# Connect an existing Discord bot

This is an optional host configuration step, not an automatic part of adding Bernie. You need authority over the Discord application and the OpenClaw Gateway. An existing bot can be connected; creating a new Discord application is not required.

1. Check the Gateway's existing Discord accounts, routing and access policies before changing anything. Decide which account should belong to Bernie; an account-wide binding can change where its incoming messages go. Preserve other accounts and approved access settings.
2. If the bot is not yet connected, follow the [OpenClaw Discord setup guide](https://docs.openclaw.ai/channels/discord) to configure its bot token securely. Never put the token in chat, a template, source control, or a command argument. Use the supported secret or masked connection flow. Ensure the bot is in the intended server with appropriate permissions and intents.
3. Bind the intended configured Discord account to the newly added agent using the actual agent and account IDs. For example, after checking `openclaw agents bind --help`:

   `openclaw agents bind --agent <agent-id> --bind discord:<account-id>`

   This changes routing; review existing bindings and confirm the desired cutover first. Connecting the same bot token to two active listeners can cause conflicts or duplicate responses. Coordinate any old listener before activating the new one.
4. Check channel status and routing, then, with the owner's approval, send a clearly labelled test and confirm both the bot identity and Bernie's reply in the intended destination. Preserve existing DM pairing and server allowlists; do not broaden access just to make a test work.

Discord connection alone does not grant calendar access or configure Family Pack notifications. Those have separate account, destination and authorization settings. Consult the current OpenClaw documentation for your installed version and report any unverified step.
