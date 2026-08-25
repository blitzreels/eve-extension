import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { idempotencyKeyFor } from "../lib/idempotency";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Start rendering a whole BlitzReels project to a video file. Returns an export id and job id; poll the `get_export` tool for the download URL.",
  inputSchema: z.object({
    projectId: z.string().min(1),
    expectedRevision: z.number().int().nonnegative(),
    resolution: z.enum(["720p", "1080p"]).default("1080p"),
    format: z.enum(["mp4", "mov"]).default("mp4"),
    coverFrameSeconds: z
      .number()
      .min(0)
      .optional()
      .describe("Timestamp used for the export thumbnail."),
  }),
  approval: once(),
  async execute({ projectId, expectedRevision, resolution, format, coverFrameSeconds }, ctx) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.exports.start({
          projectId,
          expectedRevision,
          resolution,
          format,
          coverFrameSeconds,
          idempotencyKey: idempotencyKeyFor({
            callId: ctx.callId,
            operation: "start-export",
          }),
        }),
    });
  },
});
