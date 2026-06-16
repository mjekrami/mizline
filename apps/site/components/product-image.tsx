import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external menu URLs
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("bg-muted object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        className,
      )}
      aria-hidden={!alt}
    >
      <ImageIcon className="size-8 opacity-40" />
    </div>
  );
}
