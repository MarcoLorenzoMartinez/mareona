import type { Instrumentation } from "next";

/**
 * Next.js Instrumentation hook.
 * Invoked once when the Next.js server instance starts up.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamically load server logger to confirm startup
    const { logger } = await import("@/lib/logger");
    logger.info("Mareona server runtime initialized", {
      environment: process.env.NODE_ENV,
      runtime: process.env.NEXT_RUNTIME,
    });
  }
}

/**
 * Global server-side error listener for Next.js App Router.
 * Automatically catches unhandled exceptions in Server Components, Server Actions,
 * and Route Handlers, logging them in ndJSON format with context metadata.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  const { logger } = await import("@/lib/logger");

  logger.error("Unhandled server exception captured by instrumentation", err, {
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
