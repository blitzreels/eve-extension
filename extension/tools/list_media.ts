import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "List media assets already in the BlitzReels library. Use it to find the asset id of an uploaded or imported source video before clipping or editing.",
  inputSchema: z.object({
    search: z.string().optional(),
    assetType: z.enum(["video", "audio", "image", "document", "all"]).optional(),
    folderId: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  }),
  async execute({ search, assetType, folderId, limit, offset }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.media.list({
          search,
          assetType,
          folderId,
          minDurationSeconds: undefined,
          orientation: undefined,
          limit,
          offset,
        }),
    });
  },
});
