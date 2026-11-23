/**
 * Client-side network quality store and timeout wrapper to detect "lie-fi"
 * (browser reports online, yet stadium/congested cellular links stall or fail).
 */

export const SLOW_REQUEST_THRESHOLD_MS = 3000;
export const HEALTHY_REQUEST_THRESHOLD_MS = 1500;
export const DEGRADED_COOLDOWN_MS = 25_000;
export const POLL_TIMEOUT_MS = 10_000;

export interface NetworkConnectionLike {
  readonly effectiveType?: string;
  readonly rtt?: number;
  readonly saveData?: boolean;
}

let degradedUntilMs = 0;
let isDegradedFlag = false;
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Evaluates whether browser NetworkInformation indicates a severely constrained link.
 *
 * @param connection Optional `navigator.connection` object.
 * @returns True when effectiveType is 2g/slow-2g or RTT >= 1500 ms.
 */
export function isSlowNetworkConnectionInfo(
  connection?: NetworkConnectionLike | null
): boolean {
  if (!connection) return false;
  if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
    return true;
  }
  if (typeof connection.rtt === "number" && connection.rtt >= 1500) {
    return true;
  }
  return false;
}

/**
 * Records the latency and outcome of a network operation (polling, navigation, action)
 * to update the degraded-connectivity state.
 *
 * @param durationMs Elapsed time in milliseconds.
 * @param ok Whether the request completed without network/timeout error.
 * @param now Optional timestamp override for deterministic tests.
 */
export function reportRequestOutcome(
  durationMs: number,
  ok: boolean,
  now: number = Date.now()
): void {
  const prev = isDegradedFlag;

  if (!ok || durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
    degradedUntilMs = now + DEGRADED_COOLDOWN_MS;
    isDegradedFlag = true;
  } else if (durationMs <= HEALTHY_REQUEST_THRESHOLD_MS) {
    degradedUntilMs = 0;
    isDegradedFlag = false;
  } else if (degradedUntilMs > 0 && now >= degradedUntilMs) {
    degradedUntilMs = 0;
    isDegradedFlag = false;
  }

  if (prev !== isDegradedFlag) {
    emitChange();
  }
}

/**
 * Returns whether the network has recently exhibited slow or failed requests.
 *
 * @param now Optional timestamp override for deterministic tests.
 * @returns True while within the degraded-connectivity cooldown window.
 */
export function isNetworkDegraded(now: number = Date.now()): boolean {
  if (!isDegradedFlag) return false;
  if (now >= degradedUntilMs) {
    degradedUntilMs = 0;
    isDegradedFlag = false;
    emitChange();
    return false;
  }
  return true;
}

/**
 * Subscribes a listener to degraded-network state changes.
 *
 * @param listener Callback invoked when degraded state transitions.
 * @returns Unsubscribe function.
 */
export function subscribeNetworkQuality(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Resets internal network quality state (intended strictly for unit tests).
 */
export function resetNetworkQualityForTests(): void {
  degradedUntilMs = 0;
  isDegradedFlag = false;
  listeners.clear();
}

/**
 * Executes an async task bounded by a hard timeout and reports latency/outcome
 * to the network quality monitor.
 *
 * @param task Async operation to execute.
 * @param timeoutMs Maximum wait before rejecting (defaults to POLL_TIMEOUT_MS).
 * @returns Result of `task` if resolved before timeout.
 * @throws Error when `task` rejects or exceeds `timeoutMs`.
 */
export async function runWithNetworkTimeout<T>(
  task: () => Promise<T>,
  timeoutMs: number = POLL_TIMEOUT_MS
): Promise<T> {
  const startedAt = Date.now();
  let timerId: ReturnType<typeof setTimeout> | null = null;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => {
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const result = await Promise.race([task(), timeoutPromise]);
    reportRequestOutcome(Date.now() - startedAt, true);
    return result;
  } catch (error) {
    reportRequestOutcome(Date.now() - startedAt, false);
    throw error;
  } finally {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
  }
}
