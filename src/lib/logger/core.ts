import type { LogLevel, LogEntry, LogErrorPayload, Logger, LoggerOptions } from "./types";

const LEVEL_WEIGHTS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const REDACTED_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "apikey",
  "api_key",
  "service_role",
]);

/**
 * Safely sanitizes arbitrary objects, stripping circular references and masking sensitive credentials.
 */
export function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const seen = new WeakSet<object>();

  function redact(val: unknown, depth = 0): unknown {
    if (depth > 6) return "[Truncated]";
    if (val === null || typeof val !== "object") return val;

    if (seen.has(val)) return "[Circular]";
    seen.add(val);

    if (Array.isArray(val)) {
      return val.map((item) => redact(item, depth + 1));
    }

    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(val as Record<string, unknown>)) {
      if (REDACTED_KEYS.has(key.toLowerCase())) {
        cleaned[key] = "[REDACTED]";
      } else {
        cleaned[key] = redact(value, depth + 1);
      }
    }
    return cleaned;
  }

  return redact(data) as Record<string, unknown>;
}

/**
 * Extracts error details safely into a standard LogErrorPayload without throwing.
 */
export function normalizeError(err: unknown): LogErrorPayload | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return {
      name: err.name || "Error",
      message: err.message || "Unknown error",
      stack: err.stack,
    };
  }
  return {
    name: "UnknownError",
    message: typeof err === "string" ? err : JSON.stringify(err),
  };
}

/**
 * Serializes a log entry to a single-line ndJSON string for cloud log ingestors.
 */
export function serializeJsonLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Formats a log entry for local development terminal readability.
 */
export function formatPrettyLog(entry: LogEntry): string {
  const time = entry.timestamp.split("T")[1]?.replace("Z", "") || entry.timestamp;
  const levelBadge = entry.level.toUpperCase().padEnd(5);
  const ctx = entry.context ? `[${entry.context}] ` : "";
  const errStr = entry.error ? ` | ${entry.error.name}: ${entry.error.message}` : "";
  const dataStr = entry.data && Object.keys(entry.data).length > 0 ? ` ${JSON.stringify(entry.data)}` : "";

  return `${time} ${levelBadge} ${ctx}${entry.message}${errStr}${dataStr}`;
}

/**
 * Creates a structured logger instance adhering to industry cloud observability standards.
 */
export function createLogger(options?: LoggerOptions): Logger {
  const isProd = options?.isProduction ?? process.env.NODE_ENV === "production";
  const defaultMinLevel: LogLevel = isProd ? "info" : "debug";
  const configuredLevel = (process.env.LOG_LEVEL as LogLevel | undefined) || options?.minLevel || defaultMinLevel;
  const minWeight = LEVEL_WEIGHTS[configuredLevel] ?? LEVEL_WEIGHTS.info;
  const context = options?.context;

  function emit(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    rawError?: unknown
  ) {
    if (LEVEL_WEIGHTS[level] < minWeight) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
      ...(data ? { data: sanitizeLogData(data) } : {}),
      ...(rawError ? { error: normalizeError(rawError) } : {}),
    };

    if (isProd) {
      const line = serializeJsonLog(entry);
      if (level === "error") {
        console.error(line);
      } else if (level === "warn") {
        console.warn(line);
      } else {
        console.info(line);
      }
    } else {
      const formatted = formatPrettyLog(entry);
      if (level === "error") {
        console.error(`\x1b[31m${formatted}\x1b[0m`);
      } else if (level === "warn") {
        console.warn(`\x1b[33m${formatted}\x1b[0m`);
      } else {
        console.info(formatted);
      }
    }
  }

  return {
    context,
    debug: (msg, data) => emit("debug", msg, data),
    info: (msg, data) => emit("info", msg, data),
    warn: (msg, data, err) => emit("warn", msg, data, err),
    error: (msg, err, data) => emit("error", msg, data, err),
    child: (childContextOrOptions) => {
      const childOpts: LoggerOptions =
        typeof childContextOrOptions === "string"
          ? { context: context ? `${context}:${childContextOrOptions}` : childContextOrOptions }
          : {
              ...childContextOrOptions,
              context: context && childContextOrOptions.context
                ? `${context}:${childContextOrOptions.context}`
                : childContextOrOptions.context || context,
            };
      return createLogger({
        isProduction: isProd,
        minLevel: configuredLevel,
        ...childOpts,
      });
    },
  };
}
