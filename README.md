# @blitzreels/eve

An [eve](https://eve.dev) extension that gives a durable AI agent BlitzReels video tools:
long-form to short-form clipping, visual-QA repair, project inspection, snapshot previews,
AI generation, and exports.

It wraps [`@blitzreels/sdk`](https://www.npmjs.com/package/@blitzreels/sdk), so tool calls run in
your app runtime against the same public API the CLI and MCP server use.

This repository contains only the Eve integration. The BlitzReels SDK, CLI, application,
backend, infrastructure, and internal contracts are maintained privately.

## Install

```bash
pnpm add @blitzreels/eve
```

## Mount

Create the mount file in your agent. Its filename becomes the tool namespace.

```ts title="agent/extensions/blitzreels.ts"
import blitzreels from "@blitzreels/eve";

export default blitzreels({ apiKey: process.env.BLITZREELS_API_KEY! });
```

Create an API key from your BlitzReels workspace's Developer page, then put it in `.env.local`:

```bash
BLITZREELS_API_KEY=br_live_...
```

Keys are environment-bounded: `br_live_...` against production, `br_test_...` against a local
or development runtime. Point `baseUrl` at the matching host when you use a test key.

The mount above exposes `blitzreels__list_projects`, `blitzreels__create_clip_batch`, and so on.

### Config

| Key | Required | Default |
| --- | --- | --- |
| `apiKey` | yes | — |
| `baseUrl` | no | `https://www.blitzreels.com/api/v1` |

## Tools

| Tool | Effect | Approval |
| --- | --- | --- |
| `list_projects` | read | — |
| `create_project` | write | — |
| `inspect_project` | read | — |
| `render_snapshot` | read (renders preview frames) | — |
| `list_media` | read | — |
| `get_media` | read | — |
| `import_youtube` | write, downloads source | `once()` |
| `create_clip_batch` | write, spends credits | `once()` |
| `get_clip_batch` | read | — |
| `list_clips` | read | — |
| `reselect_clip` | write | — |
| `repair_clip` | write | — |
| `export_clip` | write, renders | `once()` |
| `list_caption_words` | read | — |
| `set_caption_look` | write | — |
| `delete_clip_batch` | destructive write | `always()` |
| `start_export` | write, renders | `once()` |
| `get_export` | read | — |
| `generate_video` | write, spends credits | `once()` |
| `generate_image` | write, spends credits | `once()` |
| `generate_faceless_video` | write, spends credits | `once()` |
| `get_generation` | read | — |

Every tool returns `{ ok: true, data }` or `{ ok: false, error }`. The error carries `code`,
`retryable`, `status`, `request_id`, and `upgrade_url` so an agent can decide between retrying,
stopping, and reporting a plan limit — it never throws a raw HTTP failure into the model's context.

Credit-spending tools derive their idempotency key from eve's durable `callId`, so a step that eve
re-runs after an interruption reuses the original BlitzReels receipt instead of paying twice.

### Overriding approval

Tighten or loosen a gate from the consuming agent with a directory mount:

```ts title="agent/extensions/blitzreels/tools/export_clip.ts"
import { export_clip } from "@blitzreels/eve/tools";
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";

export default defineTool({ ...export_clip, approval: always() });
```

Use `disableTool()` in the same slot to remove a tool entirely.

## Skill

The extension ships a `blitzreels-clipping` skill: the long-form-to-shorts procedure, the
`clipPresetId` decision table, the QA `repairMode` decision table, and the polling contract.
eve loads it on demand when a turn matches its description.

## Alternative: connect over MCP

If you want the hosted tool surface instead of typed local tools, BlitzReels also runs a
Streamable HTTP MCP server at `https://www.blitzreels.com/api/mcp`. It authenticates the signed-in
user over OAuth — an API key is rejected — so wire it through Vercel Connect and give the eve
session a user principal from route auth or a platform channel.

```ts title="agent/connections/blitzreels.ts"
import { connect } from "@vercel/connect/eve";
import { defineMcpClientConnection } from "eve/connections";
import { once } from "eve/tools/approval";

export default defineMcpClientConnection({
  url: "https://www.blitzreels.com/api/mcp",
  description: "BlitzReels: clip long videos into shorts, edit projects, and export.",
  auth: connect("www.blitzreels.com/blitzreels"),
  approval: once(),
});
```

Use the extension when the agent acts as a workspace with its own API key, and when you want typed
tools, tuned descriptions, approval defaults, and idempotent retries. Use the MCP connection when
each end user should act as themselves, and when you want whatever the server exposes today with
no package to upgrade. The connector UID above is whatever `vercel connect create` returns for
your project.

## Develop

```bash
pnpm build
pnpm typecheck
```

`eve dev` in a consuming agent rebuilds the extension on source changes.

## Links

- BlitzReels API docs: <https://www.blitzreels.com/docs>
- OpenAPI: <https://www.blitzreels.com/api/openapi.json>
- Eve extensions: <https://eve.dev/docs/extensions>
