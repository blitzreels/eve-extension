import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Import a YouTube video into the BlitzReels media library as a source asset. Returns an asset id whose status is `processing` until transcription finishes; poll the `get_media` tool before clipping it.",
  inputSchema: z.object({
    url: z.string().url(),
    quality: z.enum(["720p", "1080p", "1440p", "2160p"]).optional(),
    folderId: z.string().optional(),
    audioLanguage: z
      .string()
      .optional()
      .describe("ISO language code of the spoken audio, e.g. `en` or `fr`."),
  }),
  approval: once(),
  async execute({ url, quality, folderId, audioLanguage }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.media.importYoutube({
          url,
          quality,
          folderId,
          audioLanguage,
          fps: undefined,
        }),
    });
  },
});
