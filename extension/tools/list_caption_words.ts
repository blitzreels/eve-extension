import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "List project caption words, including transcription-backed project captions without timeline items. Warnings distinguish editable captions from captions burned into source media.",
  inputSchema: z.object({
    projectId: z.string().min(1),
    timelineItemId: z.string().optional(),
    matchText: z.string().optional(),
    limit: z.number().int().min(1).max(500).default(100),
    offset: z.number().int().min(0).default(0),
  }),
  async execute(input) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.captions.listWords({
          projectId: input.projectId,
          timelineItemId: input.timelineItemId,
          matchText: input.matchText,
          limit: input.limit,
          offset: input.offset,
        }),
    });
  },
});
