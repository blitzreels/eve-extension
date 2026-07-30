import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Read an export's render status. Once `status` is complete it carries the download URL, thumbnail, duration, and file size. Poll it after `start_export` instead of blocking a turn on the render.",
  inputSchema: z.object({
    exportId: z.string().min(1),
  }),
  async execute({ exportId }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({ run: () => client.exports.get({ exportId }) });
  },
});
