import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Read a BlitzReels project's current state: summary, attached assets, timeline items, transcript, or all of it. Start from `summary` and widen only when a narrower mode is missing what you need; every response carries bounds so you can page through large collections.",
  inputSchema: z.object({
    projectId: z.string().min(1),
    mode: z.enum(["summary", "assets", "timeline", "transcript", "full"]).default("summary"),
    timelineLimit: z.number().int().min(1).max(200).optional(),
    timelineOffset: z.number().int().min(0).optional(),
    transcriptLimit: z.number().int().min(1).max(500).optional(),
    transcriptOffset: z.number().int().min(0).optional(),
  }),
  async execute({
    projectId,
    mode,
    timelineLimit,
    timelineOffset,
    transcriptLimit,
    transcriptOffset,
  }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.projects.inspect({
          projectId,
          mode,
          timelineLimit,
          timelineOffset,
          transcriptLimit,
          transcriptOffset,
        }),
    });
  },
});
