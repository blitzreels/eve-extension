import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels, invalidInput } from "../lib/result";

export default defineTool({
  description:
    "Reselect one managed clip using an exact time range, a suggestion id, or automatic best-match selection. Exact ranges are preserved instead of being moved to caption boundaries.",
  inputSchema: z.object({
    clipId: z.string().min(1),
    selectionMode: z.enum(["auto_best", "suggestion", "time_range"]),
    suggestionId: z.string().optional(),
    startSeconds: z.number().min(0).optional(),
    endSeconds: z.number().positive().optional(),
    minDurationSeconds: z.number().positive().optional(),
    maxDurationSeconds: z.number().positive().optional(),
  }),
  async execute(input) {
    if (input.selectionMode === "suggestion" && !input.suggestionId) {
      return invalidInput({
        message: "suggestionId is required for suggestion selection.",
      });
    }
    if (
      input.selectionMode === "time_range" &&
      (input.startSeconds === undefined ||
        input.endSeconds === undefined ||
        input.endSeconds <= input.startSeconds)
    ) {
      return invalidInput({
        message: "A valid startSeconds and endSeconds range is required for time_range selection.",
      });
    }
    if (input.minDurationSeconds !== undefined && input.maxDurationSeconds === undefined) {
      return invalidInput({
        message: "maxDurationSeconds is required when minDurationSeconds is provided.",
      });
    }
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.clips.reselect({
          clipId: input.clipId,
          selection: {
            mode: input.selectionMode,
            suggestionId: input.suggestionId ?? null,
            startSeconds: input.startSeconds ?? null,
            endSeconds: input.endSeconds ?? null,
          },
          target:
            input.maxDurationSeconds === undefined
              ? null
              : {
                  minDurationSeconds: input.minDurationSeconds ?? null,
                  maxDurationSeconds: input.maxDurationSeconds,
                },
        }),
    });
  },
});
