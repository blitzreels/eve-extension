import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "List clips for a source asset or project, optionally filtered by status. Use `needs_repair` or `needs_reselection` to find the clips that failed automated visual QA.",
  inputSchema: z.object({
    assetId: z.string().optional(),
    projectId: z.string().optional(),
    status: z
      .enum([
        "preparing_source",
        "awaiting_suggestions",
        "selecting_clip",
        "assembling",
        "qa_running",
        "needs_reselection",
        "needs_repair",
        "ready",
        "exporting",
        "exported",
        "failed",
      ])
      .optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  }),
  async execute({ assetId, projectId, status, limit, offset }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () => client.clips.list({ assetId, projectId, status, limit, offset }),
    });
  },
});
