import { BlitzReelsError } from "@blitzreels/sdk";

export type BlitzReelsToolError = {
  code: string;
  message: string;
  status: number;
  retryable: boolean;
  request_id: string | null;
  upgrade_url: string | null;
  details: Record<string, unknown>;
};

export type BlitzReelsToolResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: BlitzReelsToolError };

export async function callBlitzReels<TData>({
  run,
}: {
  run: () => Promise<TData>;
}): Promise<BlitzReelsToolResult<TData>> {
  try {
    return { ok: true, data: await run() };
  } catch (thrown) {
    return { ok: false, error: toToolError({ thrown }) };
  }
}

export function invalidInput({ message }: { message: string }): BlitzReelsToolResult<never> {
  return {
    ok: false,
    error: {
      code: "invalid_input",
      message,
      status: 0,
      retryable: false,
      request_id: null,
      upgrade_url: null,
      details: {},
    },
  };
}

function toToolError({ thrown }: { thrown: unknown }): BlitzReelsToolError {
  if (thrown instanceof BlitzReelsError) {
    return {
      code: thrown.code,
      message: thrown.message,
      status: thrown.status,
      retryable: thrown.retryable,
      request_id: thrown.requestId,
      upgrade_url: thrown.upgradeUrl,
      details: thrown.details as Record<string, unknown>,
    };
  }
  return {
    code: "unknown_error",
    message: thrown instanceof Error ? thrown.message : String(thrown),
    status: 0,
    retryable: false,
    request_id: null,
    upgrade_url: null,
    details: {},
  };
}
