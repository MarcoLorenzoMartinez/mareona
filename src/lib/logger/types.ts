export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogErrorPayload {
  readonly name: string;
  readonly message: string;
  readonly stack?: string;
}

export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly context?: string;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly error?: LogErrorPayload;
}

export interface LoggerOptions {
  readonly context?: string;
  readonly minLevel?: LogLevel;
  readonly isProduction?: boolean;
}

export interface Logger {
  readonly context?: string;
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>, error?: unknown): void;
  error(message: string, error?: unknown, data?: Record<string, unknown>): void;
  child(contextOrOptions: string | LoggerOptions): Logger;
}
