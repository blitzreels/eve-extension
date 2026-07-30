## BlitzReels

BlitzReels turns long-form video into short vertical clips and generates AI video.
Its tools are namespaced by the mount filename (a `blitzreels.ts` mount exposes `blitzreels__list_projects`).

Every BlitzReels tool returns an envelope. On success: `{ ok: true, data }`.
On failure: `{ ok: false, error }` with `code`, `retryable`, `request_id`, and `upgrade_url`.
Retry only when `retryable` is true. When `upgrade_url` is set the workspace hit a plan limit — report it, do not retry.

Rendering, clipping, and generation are asynchronous. Never block a turn waiting for them:
start the work, report the returned id, and poll the matching read tool on a later turn.

Clip and export operations spend credits and are gated on approval the first time in a session.
Do not re-run a gated call to work around a denial.

Load the `blitzreels-clipping` skill before running a long-form-to-shorts job.
