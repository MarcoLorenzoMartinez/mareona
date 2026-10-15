// Client: Requiere interactividad para escuchar eventos de navegación y animar la barra de carga
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function TopProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(true);
    setProgress(15);

    timerRef.current = setTimeout(() => {
      setProgress(65);
    }, 150);
  };

  const completeProgress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setProgress(100);

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      timerRef.current = setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 200);
  };

  // Whenever the path or search params change, navigation has successfully resolved.
  useEffect(() => {
    if (!isVisible) return;

    const frameId = requestAnimationFrame(() => {
      completeProgress();
    });

    return () => cancelAnimationFrame(frameId);
  }, [pathname, searchParams, isVisible]);

  // Intercept client-side navigation clicks to provide instant tactile feedback.
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const targetAttr = anchor.getAttribute("target");
      if (targetAttr === "_blank") return;

      try {
        const url = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (url.origin !== currentUrl.origin) return;
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return;
        }

        startProgress();
      } catch {
        // Ignore invalid URL formats
      }
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      window.removeEventListener("popstate", handlePopState);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px] overflow-hidden"
    >
      <div
        className="h-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)] transition-all duration-200"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      />
    </div>
  );
}

/**
 * Top-edge micro-progress bar styled in Sporting Red (#e2001a).
 * Wraps search-param hooks in Suspense to ensure zero client-rendering de-opts.
 */
export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <TopProgressBarInner />
    </Suspense>
  );
}
