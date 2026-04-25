"use client";

import { cn } from "@/lib/utils";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";

/**
 * Horizontal chip row for category filters (All, Coffee, …).
 *
 * **Do not use Radix `ScrollArea` here:** its viewport sets `overflow-x: hidden`
 * unless a horizontal `ScrollAreaScrollbar` is mounted.
 *
 * **Desktop:** native `overflow-x: auto` does not follow click-drag; we add
 * pointer-based drag scroll for mouse/pen. **Touch** keeps native panning.
 */
export function CategoryChipStrip({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const drag = useHorizontalDragScroll();

  return (
    <div
      ref={drag.ref}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onClickCapture={drag.onClickCapture}
      className={cn(
        "min-w-0 cursor-grab overflow-x-auto overflow-y-hidden overscroll-x-contain active:cursor-grabbing hide-scrollbar touch-pan-x select-none",
        className,
      )}
    >
      <div className="flex w-max min-w-full gap-2 pb-2">{children}</div>
    </div>
  );
}
