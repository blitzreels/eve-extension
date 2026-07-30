import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Read a generation job's status, progress, credit estimate, and download URL. Poll it after any `generate_*` tool call.",
  inputSchema: z.object({
    jobId: z.string().min(1),
  }),
  async execute({ jobId }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({ run: () => client.generation.get({ jobId }) });
  },
});
