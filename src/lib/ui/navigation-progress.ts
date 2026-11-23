/**
 * Lightweight event bus for global top navigation progress feedback.
 * Allows programmatic navigations and slow actions to drive TopProgressBar.
 */

type ProgressEvent = "start" | "done";
type ProgressListener = (event: ProgressEvent) => void;

const listeners = new Set<ProgressListener>();

/**
 * Subscribes a progress bar listener to manual start/done signals.
 *
 * @param listener Callback invoked on progress start or completion.
 * @returns Unsubscribe function.
 */
export function subscribeNavigationProgress(listener: ProgressListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Signals that a navigation or slow route-level transition has begun.
 */
export function startNavigationProgress(): void {
  for (const listener of listeners) {
    listener("start");
  }
}

/**
 * Signals that a pending navigation or transition has completed.
 */
export function completeNavigationProgress(): void {
  for (const listener of listeners) {
    listener("done");
  }
}

/**
 * Evaluates whether a DOM click event targets an enabled internal navigation link
 * pointing to a different URL than the active page.
 *
 * @param e Native mouse click event.
 * @returns True when TopProgressBar should enter loading state.
 */
export function shouldTriggerProgressForClick(e: MouseEvent): boolean {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
    return false;
  }

  const target = e.target as HTMLElement | null;
  const anchor = target?.closest("a");
  if (!anchor || anchor.getAttribute("aria-disabled") === "true") return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  if (anchor.getAttribute("target") === "_blank") return false;

  try {
    const url = new URL(anchor.href, window.location.href);
    const currentUrl = new URL(window.location.href);
    if (url.origin !== currentUrl.origin) return false;
    return url.pathname !== currentUrl.pathname || url.search !== currentUrl.search;
  } catch {
    return false;
  }
}
