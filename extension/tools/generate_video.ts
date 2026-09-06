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
    prompt: z.string().min(3).max(5000),
    resolution: z.enum(["480p", "720p", "768p", "1080p", "4k"]).nullable().optional(),
    enhancePrompt: z.boolean().default(false),
    model: z.string().optional().describe("Model id; omit to use the workspace default."),
    durationSeconds: z.number().int().min(2).max(30).optional(),
    aspectRatio: z.string().optional().describe("e.g. `9:16` or `16:9`."),
    sourceAssetId: z.string().optional().describe("Image asset to animate, for image-to-video."),
    endFrameAssetId: z.string().uuid().optional(),
    referenceAssetIds: z.array(z.string().uuid()).max(30).optional(),
    referenceVideoAssetIds: z.array(z.string().uuid()).max(10).optional(),
    referenceAudioAssetIds: z.array(z.string().uuid()).max(10).optional(),
    seed: z.number().int().optional(),
    generateAudio: z.boolean().nullable().optional(),
    negativePrompt: z.string().optional(),
    provider: z
      .enum(["auto", "byteplus-modelark", "fal"])
      .default("auto")
      .describe("Provider override; auto routes by compatibility and price."),
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
          referenceAssetIds: input.referenceAssetIds,
          referenceVideoAssetIds: input.referenceVideoAssetIds,
          referenceAudioAssetIds: input.referenceAudioAssetIds,
          endFrameAssetId: input.endFrameAssetId,
          resolution: input.resolution,
          seed: input.seed,
          folderId: undefined,
          provider: input.provider,
          enhancePrompt: input.enhancePrompt,
          idempotencyKey: idempotencyKeyFor({
            callId: ctx.callId,
            operation: "generate-video",
          }),
        }),
    });
  },
});
