import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { idempotencyKeyFor } from "../lib/idempotency";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Produce a full faceless short from a script: BlitzReels plans the scenes, generates the visuals, voices it over, and burns in captions. This is the most expensive operation in the extension; it returns a queued job whose progress you read with `get_generation`.",
  inputSchema: z.object({
    script: z.string().min(1).describe("Spoken narration, in full."),
    projectName: z.string().optional(),
    targetDurationSeconds: z.number().int().min(5).max(180).optional(),
    visualStyle: z
      .string()
      .optional()
      .describe("Free-text art direction, e.g. `cinematic documentary`."),
    generateVoiceover: z.boolean().default(true),
    voiceId: z.string().optional(),
    includeCaptions: z.boolean().default(true),
    generateBackgroundMusic: z.boolean().default(false),
    generateSoundEffects: z.boolean().default(false),
  }),
  approval: once(),
  async execute(input, ctx) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.generation.faceless({
          script: input.script,
          projectName: input.projectName,
          targetDurationSeconds: input.targetDurationSeconds,
          visualStyle: input.visualStyle,
          storyKitId: undefined,
          generateVoiceover: input.generateVoiceover,
          voiceId: input.voiceId,
          includeCaptions: input.includeCaptions,
          generateBackgroundMusic: input.generateBackgroundMusic,
          generateSoundEffects: input.generateSoundEffects,
          characterIds: undefined,
          plannerModelId: undefined,
          imageModelId: undefined,
          videoModel: undefined,
          captionStyleId: undefined,
          idempotencyKey: idempotencyKeyFor({
            callId: ctx.callId,
            operation: "generate-faceless",
          }),
        }),
    });
  },
});
