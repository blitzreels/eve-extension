import { defineTool } from "eve/tools";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "List BlitzReels video projects in the workspace, newest first. Use it to find a project id before inspecting, editing, or exporting.",
  inputSchema: z.object({
    search: z.string().optional().describe("Filter projects by name."),
    status: z.enum(["active", "archived", "all"]).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  }),
  async execute({ search, status, limit, offset }) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.projects.list({
          search,
          status,
          limit,
          offset,
          cursor: undefined,
          excludeClipProjects: undefined,
          hasExport: undefined,
          aspectRatio: undefined,
          sortBy: undefined,
        }),
    });
  },
});
