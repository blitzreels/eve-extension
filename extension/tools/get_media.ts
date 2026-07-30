import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Read one media asset: processing status, duration, transcription state, and clipping readiness. Poll it after an import or upload before creating clips.",
  inputSchema: z.object({
    assetId: z.string().min(1),
  }),
  async execute({ assetId }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({ run: () => client.media.get({ assetId }) });
  },
});
