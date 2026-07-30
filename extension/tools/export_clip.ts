import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Render one clip to a downloadable file. Blocking visual QA still prevents an export, so repair the clip first when QA flags it.",
  inputSchema: z.object({
    clipId: z.string().min(1),
    resolution: z.enum(["720p", "1080p"]).default("1080p"),
    format: z.enum(["mp4", "mov"]).default("mp4"),
  }),
  approval: once(),
  async execute({ clipId, resolution, format }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () => client.clips.export({ clipId, resolution, format }),
    });
  },
});
