"use client";

import { useCallback, useRef } from "react";

/**
 * Desktop browsers do not map click-drag to horizontal scroll on overflow-x
 * containers (touch does). This hook adds mouse/pen drag scrolling while
 * leaving native touch panning intact.
 */
export function useHorizontalDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: false,
  });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Touch: native overflow scrolling
    if (e.pointerType === "touch") return;
    if ((e.target as HTMLElement).closest("button, a")) return;
    const el = ref.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const el = ref.current;
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 8) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  }, []);

  const onPointerUpOrCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const el = ref.current;
    try {
      if (el?.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* ignore */
    }
    drag.current.active = false;
  }, []);

  /** Suppress accidental chip clicks after a drag */
  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }, []);

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerUpOrCancel,
    onPointerCancel: onPointerUpOrCancel,
    onClickCapture,
  };
}
