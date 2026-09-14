---
description: Use when turning a long-form video, podcast, webinar, or YouTube URL into short vertical clips with BlitzReels, and when a clip fails visual QA.
---

# Long-form to shorts with BlitzReels

Tool names below are bare; at runtime they carry the mount namespace (`blitzreels__create_clip_batch`).

## 1. Get the source into the library

- Already uploaded → `list_media` with a `search` term, take the asset id.
- YouTube URL → either `import_youtube` first, or pass `youtubeUrl` straight to `create_clip_batch`.
- Import once. Re-importing the same URL returns `status: "already_exists"` rather than a duplicate.

An imported asset is not clippable until processing and transcription finish.
Poll `get_media` on later turns; do not sleep inside a turn.

## 2. Create the batch

Call `create_clip_batch` with the asset id (or the YouTube URL).

Pick `clipPresetId` from the intent:

| Source | Preset |
| --- | --- |
| Podcast, interview, webinar | `high-retention` |
| Product demo, screen recording | `demo-focus` |
| Course or training footage | `formation-clipperz` |
| Anything else | omit, or `default` |

This is credit-spending and approval-gated. State the source and preset in the same
message so the approver sees what they are approving.

## 3. Poll the batch

`get_clip_batch` until `rendered_count + failed_count === total_clip_count`.
Poll on separate turns, spaced out — a batch takes minutes, not seconds.

Report progress with the counts, not with a guess at remaining time.

## 4. Handle QA

Clips at `needs_repair` or `needs_reselection` failed automated visual QA. Find them with
`list_clips` filtered on that status, then call `repair_clip`:

| Symptom | `repairMode` |
| --- | --- |
| Two speakers, one cropped out | `prefer_split` |
| Single speaker off-centre | `prefer_focus` |
| Screen content cropped | `prefer_demo` or `prefer_tutorial` |
| Captions covering a face | `move_captions_off_faces` |
| Unclear | `auto` |

The repair receipt reports `qa_blocking_after`. If it is still true, try a different mode
once, then surface the clip to a human rather than looping.

Use `reselect_clip` for an exact `time_range`, a chosen `suggestion`, or a fresh `auto_best` selection.
Exact time ranges are preserved.
Pass `layoutMode: people_first`, `contentTypeHint: podcast`, and a caption look when regenerating interviews.
People-first output uses one speaker focus frame or two distinct speaker frames; it does not use letterbox.
This step is complete when the regenerated clip uses the requested range, layout, and caption overrides.

Use `list_caption_words` before word-level caption work and `set_caption_look` for a verified style receipt.
Caption warnings are advisory; never disable rendering because source-burned captions are not editable.

Verify a repair visually with `render_snapshot` on the clip's project id before exporting.

## 5. Export

`export_clip` per clip, or `start_export` with the current project revision for a whole project, then poll `get_export`
for the download URL. Blocking QA prevents an export — repair first.

Use `delete_clip_batch` with `dryRun: true` before cleanup, then repeat with explicit retention and confirmation.

## Failure handling

- `retryable: false` → stop and report. Retrying will fail the same way.
- `upgrade_url` present → the workspace hit a plan limit. Report the link; do not retry.
- A clip stuck at `failed` is not repairable. Reselect a different window with a new batch,
  or hand it to a human.
