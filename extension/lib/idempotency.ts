/**
 * eve replays completed tool steps but re-runs a step interrupted mid-execution.
 * Deriving the idempotency key from the durable call id makes a re-run reuse the
 * original BlitzReels receipt instead of spending credits twice.
 */
export function idempotencyKeyFor({
  callId,
  operation,
}: {
  callId: string;
  operation: string;
}): string {
  return `eve-${operation}-${callId}`;
}
