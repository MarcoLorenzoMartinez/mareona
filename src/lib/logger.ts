import "server-only";

import { createLogger } from "./logger/core";
import type { Logger } from "./logger/types";

export * from "./logger/types";
export { createLogger } from "./logger/core";

/**
 * Standard structured logger for Mareona server runtime.
 * Outputs Newline Delimited JSON (ndJSON) in production for cloud log ingestion
 * (Vercel Log Drains, Datadog, BetterStack) and readable formatted lines in local dev.
 */
export const logger: Logger = createLogger();
