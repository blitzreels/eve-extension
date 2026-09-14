import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels, invalidInput } from "../lib/result";

export default defineTool({
  description:
    "Regenerate one managed clip from an exact range, suggestion, or automatic selection, with optional layout and caption controls.",
  inputSchema: z.object({
    clipId: z.string().min(1),
    selectionMode: z.enum(["auto_best", "suggestion", "time_range"]),
    suggestionId: z.string().optional(),
    startSeconds: z.number().min(0).optional(),
    endSeconds: z.number().positive().optional(),
    minDurationSeconds: z.number().positive().optional(),
    maxDurationSeconds: z.number().positive().optional(),
    layoutMode: z
      .enum([
        "auto",
        "people_first",
        "screen_first",
        "preserve_full_source",
        "prefer_split",
        "prefer_focus",
        "prefer_tutorial",
        "prefer_demo",
      ])
      .optional(),
    contentTypeHint: z.enum(["auto", "podcast", "tutorial", "demo", "generic"]).optional(),
    captionStyleId: z.string().optional(),
    captionWordRevealAnimation: z
      .enum([
        "none",
        "fade",
        "scale",
        "slide-up",
        "slide-left",
        "slide-mix",
        "pop",
        "drop",
        "slam",
        "typewriter",
        "glitch",
        "mask-reveal",
        "bounce-up",
        "split-reveal",
      ])
      .optional(),
    captionMaxLines: z.number().int().min(1).max(4).optional(),
    captionWordsPerLine: z.number().int().min(1).max(16).optional(),
    captionPageCombineMs: z.number().int().min(250).max(10_000).optional(),
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
          layout:
            input.layoutMode === undefined && input.contentTypeHint === undefined
              ? null
              : {
                  mode: input.layoutMode,
                  contentTypeHint: input.contentTypeHint,
                  tutorialStackRatio: undefined,
                },
          captions:
            input.captionStyleId === undefined &&
            input.captionWordRevealAnimation === undefined &&
            input.captionMaxLines === undefined &&
            input.captionWordsPerLine === undefined &&
            input.captionPageCombineMs === undefined
              ? null
              : {
                  enabled: true,
                  styleId: input.captionStyleId,
                  wordRevealAnimation: input.captionWordRevealAnimation,
                  maxLinesPerCaption: input.captionMaxLines,
                  wordsPerLineLimit: input.captionWordsPerLine,
                  pageCombineMs: input.captionPageCombineMs,
                },
        }),
    });
  },
});
