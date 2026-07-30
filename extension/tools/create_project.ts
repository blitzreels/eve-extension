import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { idempotencyKeyFor } from "../lib/idempotency";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Create an empty BlitzReels project. Pick 9:16 for Reels, TikTok, and Shorts, 16:9 for YouTube, 1:1 or 4:5 for feed posts.",
  inputSchema: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    aspectRatio: z.enum(["9:16", "16:9", "1:1", "4:5"]).optional(),
    projectType: z.enum(["video", "carousel"]).optional(),
  }),
  async execute({ name, description, aspectRatio, projectType }, ctx) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.projects.create({
          name,
          description,
          aspectRatio,
          projectType,
          carouselSettings: undefined,
          idempotencyKey: idempotencyKeyFor({
            callId: ctx.callId,
            operation: "create-project",
          }),
        }),
    });
  },
});
