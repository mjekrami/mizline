"use client";

import type { Order } from "@mizline/shared";
import { collectOrderInstructionNotes } from "@/lib/order-display";
import { cn } from "@/lib/utils";

interface OrderInstructionsProps {
  order: Order;
  className?: string;
}

export function OrderInstructions({ order, className }: OrderInstructionsProps) {
  const notes = collectOrderInstructionNotes(order);
  if (notes.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-muted/40 px-2 py-1.5 text-xs",
        className,
      )}
    >
      <p className="font-medium text-foreground">Special instructions</p>
      <ul className="mt-1 list-disc pl-4 text-muted-foreground">
        {notes.map((note, index) => (
          <li key={`${order.id}-note-${index}`}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
