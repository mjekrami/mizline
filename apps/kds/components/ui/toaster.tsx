"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. `0` keeps the toast until dismissed. */
  duration?: number;
  /** Optional inline action, e.g. an "Undo" button. */
  action?: ToastAction;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
}

const DEFAULT_DURATION = 5000;
const ERROR_DURATION = 8000;

// Module-level singleton store so toasts work from anywhere (hooks, panels,
// async callbacks) without a context provider. `<Toaster />` subscribes and
// renders; it can live once in a server-component layout.
let toasts: Toast[] = [];
let counter = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return toasts;
}

const EMPTY_TOASTS: Toast[] = [];

function getServerSnapshot() {
  return EMPTY_TOASTS;
}

export function pushToast(options: ToastOptions): string {
  const id = `toast-${++counter}`;
  const variant = options.variant ?? "default";
  const duration =
    options.duration ??
    (variant === "error" ? ERROR_DURATION : DEFAULT_DURATION);

  toasts = [
    ...toasts,
    {
      id,
      title: options.title,
      description: options.description,
      variant,
      duration,
      action: options.action,
    },
  ];
  emit();
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

// Stable reference so consumers can safely place it in dependency arrays.
const toastApi = { toast: pushToast, dismiss: dismissToast } as const;

export function useToast() {
  return toastApi;
}

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border",
  success: "border-success/40",
  error: "border-error/40",
  warning: "border-warning/40",
  info: "border-info/40",
};

const variantIconStyles: Record<ToastVariant, string> = {
  default: "text-muted-foreground",
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  info: "text-info",
};

const variantIcons: Record<ToastVariant, LucideIcon> = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastCard({ toast }: { toast: Toast }) {
  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(
      () => dismissToast(toast.id),
      toast.duration,
    );
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration]);

  const Icon = variantIcons[toast.variant];

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-card p-4 text-foreground shadow-lg",
        variantStyles[toast.variant],
      )}
    >
      <Icon
        className={cn("mt-0.5 size-5 shrink-0", variantIconStyles[toast.variant])}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-sm break-words text-muted-foreground">
            {toast.description}
          </p>
        ) : null}
        {toast.action ? (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              dismissToast(toast.id);
            }}
            className="mt-2 inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
      <IconButton
        icon={X}
        aria-label="Dismiss notification"
        variant="ghost"
        className="-my-2 -mr-2"
        onClick={() => dismissToast(toast.id)}
      />
    </div>
  );
}

export function Toaster() {
  const items = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:max-w-sm sm:items-end"
    >
      {items.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  );
}
