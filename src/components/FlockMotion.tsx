"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

const TITLE_SELECTOR = ".flock-title";
const REVEAL_SELECTOR = ".flock-reveal";

export function FlockMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.querySelector<HTMLElement>(".site-header");
    let previousScroll = window.scrollY;
    let frameId = 0;
    let restoreTimer = 0;
    const revealTimers: number[] = [];

    const revealAfterFirstPaint = (element: HTMLElement) => {
      requestAnimationFrame(() => {
        revealTimers.push(window.setTimeout(() => element.classList.add("is-visible"), 40));
      });
    };

    const titleObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "120px 0px 80px 0px" },
    );

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "120px 0px 80px 0px" },
    );

    const revealVisibleMotion = () => {
      document.querySelectorAll<HTMLElement>(`${TITLE_SELECTOR}, ${REVEAL_SELECTOR}`).forEach((element) => {
        if (element.classList.contains("is-visible")) return;
        const bounds = element.getBoundingClientRect();
        const isOnScreen = bounds.top < window.innerHeight + 100 && bounds.bottom > -100;
        if (!isOnScreen) return;

        element.classList.add("is-visible");
        titleObserver.unobserve(element);
        revealObserver.unobserve(element);
      });
    };

    const motionElements = (root: ParentNode, selector: string) => {
      const descendants = Array.from(root.querySelectorAll<HTMLElement>(selector));
      if (root instanceof HTMLElement && root.matches(selector)) descendants.unshift(root);
      return descendants;
    };

    const bindMotion = (root: ParentNode) => {
      motionElements(root, TITLE_SELECTOR).forEach((element) => {
        if (element.dataset.motionBound) return;
        element.dataset.motionBound = "true";
        if (reducedMotion) {
          element.classList.add("is-visible");
        } else if (element.classList.contains("flock-title--onload")) {
          revealAfterFirstPaint(element);
        } else {
          titleObserver.observe(element);
        }
      });

      motionElements(root, REVEAL_SELECTOR).forEach((element) => {
        if (element.dataset.motionBound) return;
        element.dataset.motionBound = "true";
        if (reducedMotion) {
          element.classList.add("is-visible");
        } else if (element.classList.contains("flock-reveal--onload")) {
          revealAfterFirstPaint(element);
        } else {
          revealObserver.observe(element);
        }
      });
    };

    bindMotion(document);
    revealVisibleMotion();
    revealTimers.push(window.setTimeout(revealVisibleMotion, 50));
    revealTimers.push(window.setTimeout(revealVisibleMotion, 200));
    revealTimers.push(window.setTimeout(revealVisibleMotion, 500));
    revealTimers.push(window.setTimeout(revealVisibleMotion, 1000));
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches(TITLE_SELECTOR) || node.matches(REVEAL_SELECTOR)) {
              bindMotion(node.parentElement ?? document);
            } else {
              bindMotion(node);
            }
          }
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const updateHeader = () => {
      if (!header) return;
      const currentScroll = window.scrollY;
      if (currentScroll <= 0) {
        header.classList.remove("is-scrolled", "is-hidden");
      } else {
        header.classList.add("is-scrolled");
        header.classList.toggle("is-hidden", currentScroll > previousScroll);
      }
      previousScroll = currentScroll;
    };
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    const restoreHeaderState = () => {
      const synchronize = () => {
        if (!header) return;
        if (window.scrollY <= 2) {
          previousScroll = 0;
          header.classList.remove("is-scrolled", "is-hidden");
        } else {
          updateHeader();
        }
      };

      requestAnimationFrame(synchronize);
      window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(synchronize, 160);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        restoreHeaderState();
        requestAnimationFrame(revealVisibleMotion);
      }
    };
    const restorePageMotion = () => {
      restoreHeaderState();
      requestAnimationFrame(revealVisibleMotion);
    };
    window.addEventListener("pageshow", restorePageMotion);
    window.addEventListener("focus", restorePageMotion);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let lenis: Lenis | undefined;
    if (!reducedMotion) {
      lenis = new Lenis({
        duration: 1.18,
        easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.1,
      });
      const animate = (time: number) => {
        lenis?.raf(time);
        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
    }

    return () => {
      titleObserver.disconnect();
      revealObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("pageshow", restorePageMotion);
      window.removeEventListener("focus", restorePageMotion);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearTimeout(restoreTimer);
      if (frameId) cancelAnimationFrame(frameId);
      revealTimers.forEach((timer) => window.clearTimeout(timer));
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
}
