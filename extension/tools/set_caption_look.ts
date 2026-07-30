import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Apply a built-in caption look and return the effective render settings read-back. A mismatch becomes a warning and does not disable caption rendering.",
  inputSchema: z.object({
    projectId: z.string().min(1),
    lookId: z.string().min(1),
    clearWordOverrides: z.boolean().default(false),
  }),
  async execute({ projectId, lookId, clearWordOverrides }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.captions.updateStyle({
          projectId,
          lookId,
          presetId: undefined,
          clearWordOverrides,
          style: {},
        }),
    });
  },
});
