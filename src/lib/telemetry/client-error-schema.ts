import { z } from "zod";

/**
 * Zod schema validating runtime client error reports submitted by error boundaries.
 */
export const clientErrorReportSchema = z.object({
  name: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(2000),
  digest: z.string().trim().max(100).optional(),
  route: z.string().trim().max(500).optional(),
  timestamp: z.string().datetime().optional(),
});

export type ClientErrorReport = z.infer<typeof clientErrorReportSchema>;

export interface FormattedClientErrorLog {
  readonly errorName: string;
  readonly message: string;
  readonly digest?: string;
  readonly route?: string;
}

/**
 * Normalizes a client error report for consumption by structured server logger.
 *
 * @param report - Validated client error report input.
 * @returns Sanitized metadata object for logger context.
 */
export function formatClientErrorForLog(report: ClientErrorReport): FormattedClientErrorLog {
  return {
    errorName: report.name,
    message: report.message,
    digest: report.digest,
    route: report.route,
  };
}
