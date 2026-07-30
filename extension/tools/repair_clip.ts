import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Re-frame a clip that failed visual QA. `auto` lets BlitzReels choose; `prefer_split` targets two speakers, `prefer_focus` a single speaker, `prefer_demo` and `prefer_tutorial` screen content, and `move_captions_off_faces` fixes captions covering a face. Returns a repair receipt saying whether QA is still blocking.",
  inputSchema: z.object({
    clipId: z.string().min(1),
    repairMode: z
      .enum([
        "auto",
        "prefer_split",
        "prefer_focus",
        "prefer_tutorial",
        "prefer_demo",
        "move_captions_off_faces",
      ])
      .default("auto"),
  }),
  async execute({ clipId, repairMode }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () => client.clips.repair({ clipId, repairMode }),
    });
  },
});
