"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import {
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface VirtualListProps<T> {
  items: T[];
  estimateSize?: number;
  gap?: number;
  overscan?: number;
  className?: string;
  empty?: ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  as?: ElementType;
  itemAs?: ElementType;
}

export function VirtualList<T>({
  items,
  estimateSize = 48,
  gap = 0,
  overscan = 5,
  className,
  empty,
  getItemKey,
  renderItem,
  as: ListTag = "div",
  itemAs: ItemTag = "div",
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    gap,
    overscan,
    getItemKey: getItemKey
      ? (index) => String(getItemKey(items[index]!, index))
      : undefined,
  });

  if (items.length === 0) {
    return (
      <div className={cn("overflow-y-auto", className)}>
        {empty ?? null}
      </div>
    );
  }

  return (
    <div ref={parentRef} className={cn("overflow-y-auto", className)}>
      <ListTag
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
          width: "100%",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index]!;

          return (
            <ItemTag
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </ItemTag>
          );
        })}
      </ListTag>
    </div>
  );
}
