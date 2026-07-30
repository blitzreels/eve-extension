import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { idempotencyKeyFor } from "../lib/idempotency";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Generate a standalone AI video clip from a prompt, or animate an existing image asset by passing `sourceAssetId`. Lands in the media library as a queued job; read progress with `get_generation`.",
  inputSchema: z.object({
    prompt: z.string().min(1),
    model: z.string().optional().describe("Model id; omit to use the workspace default."),
    durationSeconds: z.number().int().min(1).max(60).optional(),
    aspectRatio: z.string().optional().describe("e.g. `9:16` or `16:9`."),
    sourceAssetId: z.string().optional().describe("Image asset to animate, for image-to-video."),
    generateAudio: z.boolean().optional(),
    negativePrompt: z.string().optional(),
  }),
  approval: once(),
  async execute(input, ctx) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.generation.videos({
          prompt: input.prompt,
          model: input.model,
          durationSeconds: input.durationSeconds,
          aspectRatio: input.aspectRatio,
          sourceAssetId: input.sourceAssetId,
          generateAudio: input.generateAudio,
          negativePrompt: input.negativePrompt,
          referenceAssetIds: undefined,
          seed: undefined,
          folderId: undefined,
          idempotencyKey: idempotencyKeyFor({
            callId: ctx.callId,
            operation: "generate-video",
          }),
        }),
    });
  },
});
