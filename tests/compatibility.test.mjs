import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BlitzReelsError } from "@blitzreels/sdk";
import * as tools from "../dist/tools/index.mjs";
import { idempotencyKeyFor } from "../extension/lib/idempotency.ts";
import { callBlitzReels } from "../extension/lib/result.ts";

test("eve 1.0 build emits the current distribution contract and all tools", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../dist/extension/_manifest.json", import.meta.url)),
  );
  assert.equal(manifest.formatVersion, 3);
  assert.equal(manifest.builtWithEve, "1.0.0");
  assert.equal(Object.keys(tools).length, 22);
});

test("credit-spending and destructive tools still require human approval", () => {
  for (const name of [
    "create_clip_batch",
    "generate_faceless_video",
    "generate_image",
    "generate_video",
    "start_export",
    "export_clip",
    "import_youtube",
    "delete_clip_batch",
  ]) {
    // biome-ignore lint/performance/noDynamicNamespaceImportAccess: Test every published approval policy.
    assert.equal(tools[name].approval({}), "user-approval", name);
  }
  // Destruction always asks, even if the rest of the context contains prior approval.
  assert.equal(tools.delete_clip_batch.approval({ approved: true }), "user-approval");
  assert.equal(tools.list_projects.approval, undefined);
});

test("invalid clipping input fails before calling the service", async () => {
  const result = await tools.create_clip_batch.execute({}, { callId: "call_1" });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "invalid_input");
  assert.equal(result.error.retryable, false);
});

test("receipt keys survive replay and distinguish calls and operations", () => {
  const input = { operation: "start-export", callId: "call_123" };
  assert.equal(idempotencyKeyFor(input), "eve-start-export-call_123");
  assert.equal(idempotencyKeyFor(input), idempotencyKeyFor({ ...input }));
  assert.notEqual(idempotencyKeyFor(input), idempotencyKeyFor({ ...input, callId: "call_124" }));
  assert.notEqual(
    idempotencyKeyFor(input),
    idempotencyKeyFor({ ...input, operation: "create-project" }),
  );
});

test("SDK errors retain retry, request receipt and upgrade guidance", async () => {
  const result = await callBlitzReels({
    run: async () => {
      throw new BlitzReelsError({
        code: "plan_limit",
        message: "Upgrade required",
        status: 402,
        retryable: false,
        requestId: "request_123",
        details: { limit: 1, upgrade_url: "https://blitzreels.com/upgrade" },
      });
    },
  });
  assert.deepEqual(result, {
    ok: false,
    error: {
      code: "plan_limit",
      message: "Upgrade required",
      status: 402,
      retryable: false,
      request_id: "request_123",
      upgrade_url: "https://blitzreels.com/upgrade",
      details: { limit: 1, upgrade_url: "https://blitzreels.com/upgrade" },
    },
  });
  assert.deepEqual(await callBlitzReels({ run: async () => ({ receipt: "job_1" }) }), {
    ok: true,
    data: { receipt: "job_1" },
  });
});
