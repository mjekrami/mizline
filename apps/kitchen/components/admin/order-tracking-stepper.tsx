import type { OrderStatus } from "@mizline/shared";
import { orderStatusLabels } from "@mizline/shared";
import { CheckCircle2, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

const TRACKING_STEPS: OrderStatus[] = [
  "new",
  "preparing",
  "ready",
  "fulfilled",
];

const stepAccent: Record<OrderStatus, string> = {
  new: "border-order-new text-order-new",
  preparing: "border-order-preparing text-order-preparing",
  ready: "border-order-ready text-order-ready",
  fulfilled: "border-order-fulfilled text-order-fulfilled",
  cancelled: "border-order-cancelled text-order-cancelled",
};

const stepDot: Record<OrderStatus, string> = {
  new: "bg-order-new",
  preparing: "bg-order-preparing",
  ready: "bg-order-ready",
  fulfilled: "bg-order-fulfilled",
  cancelled: "bg-order-cancelled",
};

const stepDescriptions: Partial<Record<OrderStatus, string>> = {
  new: "Order received, waiting for kitchen.",
  preparing: "Kitchen is preparing this order.",
  ready: "Ready for hand-off to the table.",
  fulfilled: "All items handed off — order complete.",
};

function stepIndex(status: OrderStatus): number {
  return TRACKING_STEPS.indexOf(status);
}

interface OrderTrackingStepperProps {
  status: OrderStatus;
  compact?: boolean;
}

export function OrderTrackingStepper({
  status,
  compact = false,
}: OrderTrackingStepperProps) {
  const currentStep = stepIndex(status);
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="rounded-lg border border-order-cancelled/40 bg-order-cancelled/5 px-4 py-3 text-sm text-order-cancelled">
        This order was cancelled.
      </div>
    );
  }

  if (compact) {
    return (
      <ol className="flex items-center gap-1">
        {TRACKING_STEPS.map((step, index) => {
          const done = currentStep > index;
          const active = currentStep === index;

          return (
            <li key={step} className="flex items-center gap-1">
              <span
                className={cn(
                  "size-2 rounded-full",
                  done
                    ? "bg-success"
                    : active
                      ? stepDot[step]
                      : "bg-muted",
                )}
                title={orderStatusLabels[step]}
              />
              {index < TRACKING_STEPS.length - 1 ? (
                <span
                  className={cn(
                    "h-px w-4",
                    done ? "bg-success" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {TRACKING_STEPS.map((step, index) => {
        const done = currentStep > index;
        const active = currentStep === index;
        const upcoming = currentStep < index;

        return (
          <li
            key={step}
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-background/40 px-3 py-2.5",
              active ? `border-l-4 ${stepAccent[step]}` : "border-border/60",
              upcoming && "opacity-50",
            )}
          >
            {done ? (
              <CheckCircle2 className="size-4 shrink-0 text-success" />
            ) : active ? (
              <Clock3 className={cn("size-4 shrink-0", stepAccent[step])} />
            ) : (
              <span className="size-4 shrink-0 rounded-full border-2 border-border" />
            )}
            <div>
              <p className="text-sm font-medium">{orderStatusLabels[step]}</p>
              {active && stepDescriptions[step] ? (
                <p className="text-xs text-muted-foreground">
                  {stepDescriptions[step]}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
