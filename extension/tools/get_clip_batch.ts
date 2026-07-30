import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Read a clip batch: per-clip status, QA summary, preview frames, download URLs, and the zip of every rendered clip. Poll this after `create_clip_batch` until `rendered_count` plus `failed_count` reaches `total_clip_count`.",
  inputSchema: z.object({
    batchId: z.string().min(1),
  }),
  async execute({ batchId }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({ run: () => client.clipBatches.get({ batchId }) });
  },
});
