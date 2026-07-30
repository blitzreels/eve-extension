import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { idempotencyKeyFor } from "../lib/idempotency";
import { callBlitzReels, invalidInput } from "../lib/result";

export default defineTool({
  description:
    "Turn one long-form video into a batch of short vertical clips: BlitzReels picks the moments from the transcript, reframes to 9:16, and burns in captions. Source it from an existing library asset id or straight from a YouTube URL. This consumes credits and runs for several minutes; poll the `get_clip_batch` tool for progress.",
  inputSchema: z.object({
    assetId: z.string().optional().describe("Library asset to clip. Provide this or `youtubeUrl`."),
    youtubeUrl: z
      .string()
      .url()
      .optional()
      .describe("YouTube source to import and clip in one call."),
    quality: z
      .enum(["720p", "1080p", "1440p", "2160p"])
      .optional()
      .describe("Download quality when sourcing from `youtubeUrl`."),
    clipPresetId: z
      .enum(["default", "formation-clipperz", "high-retention", "demo-focus"])
      .optional()
      .describe(
        "Selection strategy. `high-retention` favours hooks, `demo-focus` favours product demos.",
      ),
    captionThemeId: z
      .string()
      .optional()
      .describe("Caption theme id applied to every clip in the batch."),
  }),
  approval: once(),
  async execute({ assetId, youtubeUrl, quality, clipPresetId, captionThemeId }, ctx) {
    if (!assetId && !youtubeUrl) {
      return invalidInput({
        message: "Provide either `assetId` or `youtubeUrl`.",
      });
    }

    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.clips.create({
          source: {
            sourceType: assetId ? "asset" : "youtube",
            assetId: assetId ?? null,
            youtubeUrl: youtubeUrl ?? null,
            quality: quality ?? null,
          },
          clipPresetId: clipPresetId ?? null,
          captionThemeId: captionThemeId ?? null,
          createFlowOptions: undefined,
          brandingOptions: undefined,
          idempotencyKey: idempotencyKeyFor({
            callId: ctx.callId,
            operation: "create-clip-batch",
          }),
        }),
    });
  },
});
