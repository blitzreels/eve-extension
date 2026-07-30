import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { getBlitzReelsClient } from "../lib/client";
import { idempotencyKeyFor } from "../lib/idempotency";
import { callBlitzReels } from "../lib/result";

export default defineTool({
  description:
    "Preview or delete a managed clip batch with explicit retention for derived projects and exports.",
  inputSchema: z.object({
    batchId: z.string().min(1),
    retention: z.enum(["retain_projects_and_exports", "delete_projects_and_exports"]),
    dryRun: z.boolean().default(true),
    confirmDelete: z.boolean().default(false),
  }),
  approval: always(),
  async execute({ batchId, retention, dryRun, confirmDelete }, ctx) {
    const client = getBlitzReelsClient();
    return callBlitzReels({
      run: () =>
        client.clipBatches.delete({
          batchId,
          retention,
          dryRun,
          confirmDelete,
          idempotencyKey: idempotencyKeyFor({
            callId: ctx.callId,
            operation: "delete-clip-batch",
          }),
        }),
    });
  },
});
