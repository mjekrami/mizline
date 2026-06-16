"use client";

import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  wrapClassName?: string;
}

type ImageStatus = "loading" | "ready" | "error";

function ProductImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-secondary text-muted-foreground",
        className,
      )}
      aria-hidden
    >
      <ImageIcon className="size-8 opacity-40" />
    </div>
  );
}

export function ProductImage({
  src,
  alt,
  className,
  wrapClassName,
}: ProductImageProps) {
  const [status, setStatus] = useState<ImageStatus>(src ? "loading" : "error");

  useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const probe = new Image();
    probe.onload = () => {
      if (cancelled) return;
      setStatus(probe.naturalWidth > 0 ? "ready" : "error");
    };
    probe.onerror = () => {
      if (!cancelled) setStatus("error");
    };
    probe.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  const image =
    status === "ready" ? (
      // eslint-disable-next-line @next/next/no-img-element -- external menu URLs
      <img
        src={src ?? undefined}
        alt=""
        aria-hidden
        loading="lazy"
        className={cn("bg-muted object-cover", className)}
      />
    ) : (
      <ProductImagePlaceholder className={className} />
    );

  if (wrapClassName) {
    return (
      <div className={wrapClassName} aria-label={alt} role="img">
        {image}
      </div>
    );
  }

  return image;
}
