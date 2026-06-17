"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

export interface DialogHandle {
  showModal: () => void;
  close: () => void;
}

interface DialogProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Dialog = forwardRef<DialogHandle, DialogProps>(
  ({ title, description, children, onClose, className }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const titleId = useId();
    const descriptionId = useId();

    useImperativeHandle(ref, () => ({
      showModal: () => {
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        dialogRef.current?.showModal();
      },
      close: () => {
        dialogRef.current?.close();
      },
    }));

    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const handleClose = () => {
        previousFocusRef.current?.focus();
        onClose?.();
      };

      dialog.addEventListener("close", handleClose);
      return () => dialog.removeEventListener("close", handleClose);
    }, [onClose]);

    return (
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "fixed inset-0 z-50 m-auto max-h-[90vh] w-[min(100%-2rem,32rem)] rounded-xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/50 open:flex open:flex-col",
          className,
        )}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            dialogRef.current?.close();
          }
        }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 id={titleId} className="text-xl font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-base text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton
            icon={X}
            aria-label="Close dialog"
            variant="ghost"
            onClick={() => dialogRef.current?.close()}
          />
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </dialog>
    );
  },
);

Dialog.displayName = "Dialog";
