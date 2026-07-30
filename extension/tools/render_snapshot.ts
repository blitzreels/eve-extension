import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Render still frames of a project at given timestamps and return signed preview image URLs. Use it to check framing, captions, and overlays before spending an export.",
  inputSchema: z.object({
    projectId: z.string().min(1),
    atSeconds: z
      .array(z.number().min(0))
      .min(1)
      .max(8)
      .describe("Timeline timestamps to capture, in seconds."),
    targetWidth: z.number().int().min(160).max(1920).optional(),
    imageFormat: z.enum(["jpeg", "png"]).optional(),
  }),
  async execute({ projectId, atSeconds, targetWidth, imageFormat }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.projects.renderSnapshots({
          projectId,
          atSeconds,
          targetWidth,
          imageFormat,
        }),
    });
  },
});
