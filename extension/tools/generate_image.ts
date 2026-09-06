import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { idempotencyKeyFor } from "../lib/idempotency";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Generate an image into the BlitzReels media library — thumbnails, carousel slides, or B-roll stills. Returns a queued job; read progress with `get_generation`.",
  inputSchema: z.object({
    prompt: z.string().min(8).max(5000),
    resolution: z.enum(["0.5k", "1k", "2k", "4k"]).nullable().optional(),
    enhancePrompt: z.boolean().default(false),
    model: z.string().optional(),
    aspectRatio: z.string().optional().describe("e.g. `9:16` or `1:1`."),
    referenceAssetIds: z
      .array(z.string())
      .optional()
      .describe("Existing assets to condition the generation on."),
  }),
  approval: once(),
  async execute({ prompt, model, aspectRatio, referenceAssetIds, resolution, enhancePrompt }, ctx) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.generation.images({
          prompt,
          model,
          aspectRatio,
          referenceAssetIds,
          folderId: undefined,
          resolution,
          enhancePrompt,
          idempotencyKey: idempotencyKeyFor({
            callId: ctx.callId,
            operation: "generate-image",
          }),
        }),
    });
  },
});
